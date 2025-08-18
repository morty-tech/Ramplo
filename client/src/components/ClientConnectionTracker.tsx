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
          <Handshake className="w-5 h-5 text-aura-600" />
          Client Connections
        </h3>
        <span className="text-sm text-gray-600">
          Today: {todayTotal}
        </span>
      </div>
      
      <div className="relative overflow-hidden rounded-lg bg-white px-4 shadow-md sm:px-6">
        <div className="space-y-0">
          {connectionTypes.map((type, index) => (
            <div key={type.key}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <p className="text-2xl font-semibold text-gray-900 w-8">{todayConnections?.[type.key] || 0}</p>
                  <p className="text-base font-medium text-gray-700">{type.label}</p>
                </div>
                
                <div className="flex items-center bg-frost-100 rounded-md p-1">
                  <button
                    onClick={() => adjustCount(type.key, false)}
                    disabled={updateConnectionsMutation.isPending || !todayConnections?.[type.key]}
                    className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-3 h-3 text-gray-600" />
                  </button>
                  
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  
                  <button
                    onClick={() => adjustCount(type.key, true)}
                    disabled={updateConnectionsMutation.isPending}
                    className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3 text-gray-600" />
                  </button>
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