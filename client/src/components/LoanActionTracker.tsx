import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileCheck, DollarSign, Home, Plus, Minus } from "lucide-react";

interface LoanActions {
  preapprovals: number;
  applications: number;
  closings: number;
}

export default function LoanActionTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todayLoanActions } = useQuery({
    queryKey: ["/api/loan-actions/today"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/loan-actions/today");
      return response.json();
    },
  });

  const updateLoanActionsMutation = useMutation({
    mutationFn: async (data: LoanActions) => {
      return apiRequest("POST", "/api/loan-actions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loan-actions/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Updated!",
        description: "Loan action recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update loan actions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const adjustCount = (type: keyof LoanActions, increment: boolean) => {
    const newValue = increment ? 1 : -1;
    
    updateLoanActionsMutation.mutate({
      [type]: newValue,
      preapprovals: type === 'preapprovals' ? newValue : 0,
      applications: type === 'applications' ? newValue : 0,
      closings: type === 'closings' ? newValue : 0,
    } as LoanActions);
  };

  const actionTypes = [
    {
      key: "preapprovals" as keyof LoanActions,
      label: "Preapprovals",
      icon: FileCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      key: "applications" as keyof LoanActions,
      label: "Applications", 
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      key: "closings" as keyof LoanActions,
      label: "Closings",
      icon: Home,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const todayTotal = todayLoanActions 
    ? (todayLoanActions.preapprovals || 0) + (todayLoanActions.applications || 0) + (todayLoanActions.closings || 0)
    : 0;

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <FileCheck className="w-5 h-5" />
          Loan Actions
        </h3>
        <p className="text-sm text-gray-600">
          Today's total: {todayTotal} actions
        </p>
      </div>
      
      <div className="relative overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-sm sm:px-6 sm:pt-5">
        <div className="space-y-2">
        {actionTypes.map((type) => (
          <div key={type.key} className="flex items-center justify-between p-2 border rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${type.bgColor} rounded-full flex items-center justify-center`}>
                <type.icon className={`${type.color} w-4 h-4`} />
              </div>
              <div className="font-medium text-sm">{type.label}</div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustCount(type.key, false)}
                disabled={updateLoanActionsMutation.isPending || !todayLoanActions?.[type.key]}
                className="h-7 w-7 p-0"
              >
                <Minus className="w-3 h-3" />
              </Button>
              
              <div className="w-8 text-center font-medium text-sm">
                {todayLoanActions?.[type.key] || 0}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustCount(type.key, true)}
                disabled={updateLoanActionsMutation.isPending}
                className="h-7 w-7 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}