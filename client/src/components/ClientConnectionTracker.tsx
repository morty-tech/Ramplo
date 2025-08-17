import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Handshake, Phone, MessageSquare, Mail, Plus, Minus } from "lucide-react";

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
    },
    {
      key: "textMessages" as keyof DailyConnections,
      label: "Text Messages", 
      icon: MessageSquare,
    },
    {
      key: "emails" as keyof DailyConnections,
      label: "Emails",
      icon: Mail,
    },
  ];

  const todayTotal = todayConnections ? 
    (todayConnections.phoneCalls || 0) + (todayConnections.textMessages || 0) + (todayConnections.emails || 0) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Handshake className="w-5 h-5" />
          Client Connections
        </h3>
        <span className="text-sm text-gray-600">
          Today: {todayTotal}
        </span>
      </div>
      
      <div className="relative overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-sm sm:px-6 sm:pt-5">
        <div className="space-y-0">
          {connectionTypes.map((type, index) => (
            <div key={type.key}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="absolute p-2">
                    <type.icon aria-hidden="true" className="size-5 text-tealwave-600" />
                  </div>
                  <div className="ml-14">
                    <p className="text-sm font-medium text-gray-500">{type.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{todayConnections?.[type.key] || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustCount(type.key, false)}
                    disabled={updateConnectionsMutation.isPending || !todayConnections?.[type.key]}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustCount(type.key, true)}
                    disabled={updateConnectionsMutation.isPending}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {index < connectionTypes.length - 1 && (
                <div className="border-b border-gray-100"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}