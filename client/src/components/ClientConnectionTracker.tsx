import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, MessageSquare, Mail, Plus, Minus } from "lucide-react";

interface DailyConnections {
  phoneCalls: number;
  textMessages: number;
  emails: number;
}

export default function ClientConnectionTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [connections, setConnections] = useState<DailyConnections>({
    phoneCalls: 0,
    textMessages: 0,
    emails: 0,
  });

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
      toast({
        title: "Connections updated!",
        description: "Your daily client connections have been recorded.",
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
    setConnections(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + (increment ? 1 : -1))
    }));
  };

  const handleSave = () => {
    updateConnectionsMutation.mutate(connections);
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

  const totalConnections = connections.phoneCalls + connections.textMessages + connections.emails;
  const todayTotal = todayConnections ? 
    (todayConnections.phoneCalls || 0) + (todayConnections.textMessages || 0) + (todayConnections.emails || 0) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Client Connection Tracker
        </CardTitle>
        <p className="text-sm text-gray-600">
          Track your daily client communications. Today's total: {todayTotal}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionTypes.map((type) => (
          <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${type.bgColor} rounded-full flex items-center justify-center`}>
                <type.icon className={`${type.color} w-5 h-5`} />
              </div>
              <Label className="font-medium">{type.label}</Label>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustCount(type.key, false)}
                disabled={connections[type.key] === 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <Input
                type="number"
                value={connections[type.key]}
                onChange={(e) => setConnections(prev => ({
                  ...prev,
                  [type.key]: Math.max(0, parseInt(e.target.value) || 0)
                }))}
                className="w-16 text-center"
                min="0"
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustCount(type.key, true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Total connections to add: <span className="font-semibold">{totalConnections}</span>
            </div>
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={totalConnections === 0 || updateConnectionsMutation.isPending}
            className="w-full"
          >
            {updateConnectionsMutation.isPending ? "Saving..." : "Save Connections"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}