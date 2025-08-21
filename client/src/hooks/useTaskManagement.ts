import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Task } from "@shared/schema";

export function useTaskManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiRequest("PATCH", `/api/tasks/${taskId}/complete`),
    onSuccess: () => {
      // Add a delay to show the completion animation
      setTimeout(() => {
        setCompletingTaskId(null);
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        toast({
          title: "Task completed!",
          description: "Great job staying on track!",
        });
      }, 300); // 300ms delay for faster animation
    },
  });

  const handleTaskComplete = (taskId: string) => {
    setCompletingTaskId(taskId);
    completeTaskMutation.mutate(taskId);
  };

  const handleTaskClick = (task: Task) => {
    setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
  };

  return {
    expandedTaskId,
    completingTaskId,
    handleTaskComplete,
    handleTaskClick,
    isCompleting: completeTaskMutation.isPending
  };
}