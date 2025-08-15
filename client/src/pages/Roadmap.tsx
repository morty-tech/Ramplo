import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Task } from "@shared/schema";
import TaskDetailModal from "@/components/TaskDetailModal";
import { Check, Clock, Calendar, Eye } from "lucide-react";

const TOTAL_WEEKS = 14;

export default function Roadmap() {
  const { progress } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  const currentWeek = progress?.currentWeek || 1;
  const completedTasks = progress?.tasksCompleted || 0;
  const daysRemaining = 90 - ((currentWeek - 1) * 7 + (progress?.currentDay || 1));

  // Query for all tasks to enable detailed view
  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/tasks");
      return response.json();
    },
  });

  // Query for the foundation roadmap structure
  const { data: roadmapData } = useQuery({
    queryKey: ["/api/roadmap/select"],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/roadmap/select", {});
      return response.json();
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiRequest("PATCH", `/api/tasks/${taskId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsTaskModalOpen(false);
      toast({
        title: "Task completed!",
        description: "Great job staying on track!",
      });
    },
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const getTaskForTitle = (taskTitle: string) => {
    return allTasks.find(task => task.title.toLowerCase().includes(taskTitle.toLowerCase()));
  };

  // Calculate totals after allTasks is available
  const totalTasks = allTasks.length; // Actual number of tasks from foundation roadmap
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Generate weeks from foundation roadmap data
  const weeks = React.useMemo(() => {
    console.log('Roadmap data:', roadmapData); // Debug log
    
    if (!roadmapData?.selectedRoadmap?.weeklyTasks) {
      // Fallback: use actual tasks data to generate basic weeks
      if (allTasks.length > 0) {
        const tasksByWeek = allTasks.reduce((acc: Record<number, Task[]>, task) => {
          if (!acc[task.week]) acc[task.week] = [];
          acc[task.week].push(task);
          return acc;
        }, {});
        
        return Object.entries(tasksByWeek).map(([weekNum, weekTasks]) => ({
          week: parseInt(weekNum),
          title: `Week ${weekNum}`,
          description: `Week ${weekNum} tasks and activities.`,
          tasks: weekTasks.slice(0, 5).map(t => t.title),
          status: currentWeek > parseInt(weekNum) ? "completed" : currentWeek === parseInt(weekNum) ? "current" : "upcoming"
        })).sort((a, b) => a.week - b.week);
      }
      return [];
    }

    return roadmapData.selectedRoadmap.weeklyTasks.map((weekData: any) => ({
      week: weekData.week,
      title: weekData.theme,
      description: `Week ${weekData.week} focuses on ${weekData.theme.toLowerCase()}.`,
      tasks: weekData.dailyTasks
        .reduce((acc: string[], task: any) => {
          if (!acc.includes(task.title)) {
            acc.push(task.title);
          }
          return acc;
        }, [])
        .slice(0, 5), // Show first 5 unique tasks
      status: currentWeek > weekData.week ? "completed" : currentWeek === weekData.week ? "current" : "upcoming"
    }));
  }, [roadmapData, currentWeek, allTasks]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your 90-Day Roadmap</h1>
        <p className="text-gray-600">A personalized plan to get your first 1-3 deals in 90 days.</p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Overall Progress</CardTitle>
            <span className="text-sm text-gray-600">Week {currentWeek} of {TOTAL_WEEKS}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3 mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{completedTasks}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{daysRemaining}</div>
              <div className="text-sm text-gray-600">Days Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {weeks.map((week: any) => (
          <Card 
            key={week.week} 
            className={`${
              week.status === 'current' ? 'border-2 border-primary' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Week {week.week}: {week.title}
                </CardTitle>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  week.status === 'completed' 
                    ? 'bg-green-600' 
                    : week.status === 'current'
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}>
                  {week.status === 'completed' ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : week.status === 'current' ? (
                    <Clock className="h-5 w-5 text-white" />
                  ) : (
                    <span className="text-white text-sm font-bold">{week.week}</span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{week.description}</p>
              <div className="space-y-2">
                {week.tasks.map((task: string, index: number) => {
                  const taskObj = getTaskForTitle(task);
                  const isClickable = taskObj && (taskObj.detailedDescription || taskObj.externalLinks?.length || taskObj.internalLinks?.length);
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between text-sm group ${
                        isClickable ? 'cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors' : ''
                      }`}
                      onClick={() => taskObj && isClickable && handleTaskClick(taskObj)}
                    >
                      <div className="flex items-center">
                        {week.status === 'completed' ? (
                          <>
                            <Check className="h-4 w-4 text-green-600 mr-2" />
                            <span className="line-through text-gray-500">{task}</span>
                          </>
                        ) : week.status === 'current' && index < 2 ? (
                          <>
                            <div className="h-2 w-2 bg-blue-600 rounded-full mr-2" />
                            <span className="text-gray-900">{task}</span>
                          </>
                        ) : (
                          <>
                            <div className="h-2 w-2 bg-gray-300 rounded-full mr-2" />
                            <span className="text-gray-500">{task}</span>
                          </>
                        )}
                      </div>
                      {isClickable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskClick(taskObj);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Badge variant={
                  week.status === 'completed' ? 'default' :
                  week.status === 'current' ? 'default' : 'secondary'
                } className={
                  week.status === 'completed' ? 'bg-green-600' :
                  week.status === 'current' ? 'bg-blue-600' : ''
                }>
                  {week.status === 'completed' && '✓ Week Completed'}
                  {week.status === 'current' && '📍 Current Week'}
                  {week.status === 'upcoming' && 'Coming Soon'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* All weeks are now populated from real roadmap data */}
      </div>

      {/* Call to Action */}
      <Card className="mt-8 bg-primary text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Stay Focused on Your Goals</h3>
          <p className="mb-4 opacity-90">
            Complete today's tasks to keep your momentum going and hit your 90-day targets.
          </p>
          <Button 
            variant="secondary"
            onClick={() => window.location.href = '/dashboard'}
            className="bg-white text-primary hover:bg-gray-100"
          >
            View Today's Tasks
          </Button>
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onComplete={completeTaskMutation.mutate}
        isCompleting={completeTaskMutation.isPending}
      />
    </div>
  );
}
