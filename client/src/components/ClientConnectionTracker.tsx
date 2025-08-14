import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Mail, Plus, Minus } from "lucide-react";

interface DailyConnections {
  phoneCalls: number;
  textMessages: number;
  emails: number;
}

export default function ClientConnectionTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todayConnections } = useQuery({
    queryKey: ["/api/connections/today"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/connections/today");
      return response.json();
    },
  });

  const updateConnectionsMutation = useMutation({
    mutationFn: async (data: DailyConnections) => {
      return apiRequest("POST", "/api/connections", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Updated!",
        description: "Client connection recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update connections. Please try again.",
        variant: "destructive",
      });
    },
  });

  const adjustCount = (type: keyof DailyConnections, increment: boolean) => {
    const newValue = increment ? 1 : -1;
    
    // Immediately update the backend
    updateConnectionsMutation.mutate({
      [type]: newValue,
      phoneCalls: type === 'phoneCalls' ? newValue : 0,
      textMessages: type === 'textMessages' ? newValue : 0,
      emails: type === 'emails' ? newValue : 0,
    } as DailyConnections);
  };

  const connectionTypes = [
    {
      key: "phoneCalls" as keyof DailyConnections,
      label: "Phone Calls",
      icon: Phone,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      key: "textMessages" as keyof DailyConnections,
      label: "Text Messages", 
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      key: "emails" as keyof DailyConnections,
      label: "Emails",
      icon: Mail,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const todayTotal = todayConnections ? 
    (todayConnections.phoneCalls || 0) + (todayConnections.textMessages || 0) + (todayConnections.emails || 0) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Client Connections
        </CardTitle>
        <p className="text-sm text-gray-600">
          Today's total: {todayTotal} connections
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionTypes.map((type) => (
          <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${type.bgColor} rounded-full flex items-center justify-center`}>
                <type.icon className={`${type.color} w-5 h-5`} />
              </div>
              <div className="font-medium">{type.label}</div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustCount(type.key, false)}
                disabled={updateConnectionsMutation.isPending || !todayConnections?.[type.key]}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <div className="w-16 text-center font-medium text-lg">
                {todayConnections?.[type.key] || 0}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustCount(type.key, true)}
                disabled={updateConnectionsMutation.isPending}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="text-center">
            <div className="text-sm text-gray-600">
              Click + or - to instantly update your daily totals
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}