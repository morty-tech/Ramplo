import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Task } from "@shared/schema";
import ClientConnectionTracker from "@/components/ClientConnectionTracker";
import LoanActionTracker from "@/components/LoanActionTracker";
import TaskDetailModal from "@/components/TaskDetailModal";
import { 
  Flame, 
  FileText, 
  Home, 
  Calendar,
  Send,
  UserCheck,
  Map,
  Clock,
  Info,
  Eye,
  Target
} from "lucide-react";

// Ticker animation hook for counting numbers
function useCountUp(end: number, duration: number = 1000, delay: number = 0) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [end, duration, hasStarted]);

  return count;
}

export default function Dashboard() {
  const { user, profile, progress } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const { data: todayTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks", `week=${progress?.currentWeek || 1}&day=${progress?.currentDay || 1}`],
    queryFn: async () => {
      const week = progress?.currentWeek || 1;
      const day = progress?.currentDay || 1;
      const response = await apiRequest("GET", `/api/tasks?week=${week}&day=${day}`);
      return response.json();
    },
    enabled: !!progress,
  });

  const { data: todayConnections } = useQuery({
    queryKey: ["/api/connections/today"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/connections/today");
      return response.json();
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiRequest("PATCH", `/api/tasks/${taskId}/complete`),
    onSuccess: () => {
      // Add a delay to show the completion animation
      setTimeout(() => {
        setCompletingTaskId(null);
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        setIsTaskModalOpen(false);
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
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const completedTasks = todayTasks.filter((task: Task) => task.completed);
  const progressPercentage = todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0;

  const todayTasksCompleted = todayTasks.filter((task: Task) => task.completed).length;
  const todayTasksTotal = todayTasks.length;

  // Ticker animations for daily tasks
  const animatedCompleted = useCountUp(todayTasksCompleted, 800, 200);
  const animatedTotal = useCountUp(todayTasksTotal, 800, 400);

  // Calculate performance score based on tasks and connections
  const taskCompletionRate = todayTasksTotal > 0 ? (todayTasksCompleted / todayTasksTotal) * 100 : 0;
  const totalConnections = todayConnections ? (todayConnections.phoneCalls || 0) + (todayConnections.textMessages || 0) + (todayConnections.emails || 0) : 0;
  const connectionScore = Math.min(totalConnections * 10, 100); // 10 points per connection, max 100
  const performanceScore = Math.round((taskCompletionRate + connectionScore) / 2);

  // Performance level based on score
  const getPerformanceLevel = (score: number) => {
    if (score >= 75) return { level: "Excelling", color: "#22c55e" }; // Green
    if (score >= 50) return { level: "On Track", color: "#3b82f6" }; // Blue  
    if (score >= 25) return { level: "Building", color: "#f59e0b" }; // Orange
    return { level: "Getting Started", color: "#ef4444" }; // Red
  };

  const performanceLevel = getPerformanceLevel(performanceScore);

  // Query for the foundation roadmap to get real week themes and daily objectives
  const { data: roadmapData } = useQuery({
    queryKey: ["/api/roadmap/select"],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/roadmap/select", {});
      return response.json();
    },
  });

  // Define currentWeek and currentDay before using them
  const currentWeek = progress?.currentWeek || 1;
  const currentDay = progress?.currentDay || 1;

  // Get today's objective from the roadmap data
  const getTodaysObjective = () => {
    if (roadmapData?.selectedRoadmap?.weeklyTasks && currentWeek && currentDay) {
      const weekData = roadmapData.selectedRoadmap.weeklyTasks.find((w: any) => w.week === currentWeek);
      if (weekData?.days) {
        const dayData = weekData.days.find((d: any) => d.day === currentDay);
        return dayData?.objective;
      }
    }
    return null;
  };

  const todaysObjective = getTodaysObjective();

  // Week focus based on real roadmap data
  const getWeekFocus = (week: number) => {
    if (roadmapData?.selectedRoadmap?.weeklyTasks) {
      const weekData = roadmapData.selectedRoadmap.weeklyTasks.find((w: any) => w.week === week);
      return weekData?.theme || "Week " + week;
    }
    return "Week " + week; // Fallback with no hardcoded themes
  };
  const lastWeekFocus = currentWeek > 1 ? getWeekFocus(currentWeek - 1) : null;
  const nextWeekFocus = currentWeek < 14 ? getWeekFocus(currentWeek + 1) : null;

  const stats = [
    {
      title: "Today's Tasks",
      value: `${animatedCompleted}/${animatedTotal}`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Client Connects Today", 
      value: todayConnections ? (todayConnections.phoneCalls || 0) + (todayConnections.textMessages || 0) + (todayConnections.emails || 0) : 0,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Ramp Run",
      value: progress?.rampRunDays || 0,
      icon: Flame,
      color: "text-orange-600", 
      bgColor: "bg-orange-100",
      tooltip: "Number of days you've completed all tasks and made client connections"
    },
    {
      title: "Closed Loans",
      value: progress?.loansClosed || 0,
      icon: Home,
      color: "text-purple-600", 
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="p-6 mx-4 md:mx-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {profile?.firstName || user?.firstName || 'there'}, let's Ramp!
          </h1>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Week {currentWeek} of 14</p>
          <p className="text-gray-600">This week's focus is {getWeekFocus(currentWeek)}</p>
        </div>
        
        {/* Performance Score - aligned with headline on medium+ screens */}
        <div className="flex flex-col items-center mt-4 md:mt-0">
          <div className="relative w-16 h-16">
            {/* Background circle */}
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32" 
                r="28"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="6"
              />
              
              {/* Performance level arc */}
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke={performanceLevel.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(performanceScore / 100) * 176} 176`}
                className="transition-all duration-500"
              />
            </svg>
            
            {/* Score in circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-lg font-bold text-gray-900">{performanceScore}</div>
            </div>
          </div>
          
          <div className="text-center mt-1">
            <div className="text-xs font-medium text-gray-900">{performanceLevel.level}</div>
            <div className="flex items-center gap-1 text-xs text-gray-500 justify-center">
              Ramp Performance
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="hover:text-gray-700">
                    <Info className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p>Your daily performance score combines task completion with client outreach activity</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      {stat.title}
                      {stat.tooltip && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="hover:text-gray-600">
                              <Info className="h-3 w-3 text-gray-400" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px]">
                            <p>{stat.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                    <stat.icon className={`${stat.color} text-xl`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TooltipProvider>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <CardTitle>Today's Tasks</CardTitle>
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              {todaysObjective && (
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="font-medium text-blue-700">Today's Focus:</span>
                  <span className="ml-1">{todaysObjective}</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayTasks.map((task: Task) => {
                  const isCompleting = completingTaskId === task.id;
                  const isCompleted = task.completed;
                  
                  return (
                  <div
                    key={task.id}
                    className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                      isCompleting 
                        ? 'border-green-300 bg-green-50 scale-[1.02] shadow-md' 
                        : isCompleted 
                        ? 'border-gray-200 bg-gray-50 opacity-75' 
                        : 'border-gray-200 hover:border-primary hover:shadow-sm bg-white'
                    }`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="relative flex items-center">
                      <Checkbox
                        checked={isCompleted || isCompleting}
                        onCheckedChange={(checked) => {
                          if (checked && !task.completed && !isCompleting) {
                            handleTaskComplete(task.id);
                          }
                        }}
                        disabled={isCompleted || isCompleting}
                        className={`h-5 w-5 border-2 transition-all duration-200 ${
                          isCompleting 
                            ? 'border-green-500 bg-green-500 animate-pulse' 
                            : isCompleted 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex-grow">
                      <div>
                        <h3 className={`font-medium transition-all duration-300 ${
                          isCompleting 
                            ? 'text-green-700' 
                            : isCompleted 
                            ? 'text-gray-500 line-through' 
                            : 'text-gray-900'
                        }`}>
                          {task.title}
                          {isCompleting && (
                            <span className="ml-2 text-green-600 animate-bounce">✓</span>
                          )}
                        </h3>
                      </div>
                      <p className={`text-sm mt-1 transition-colors duration-300 ${
                        isCompleting 
                          ? 'text-green-600' 
                          : isCompleted 
                          ? 'text-gray-400' 
                          : 'text-gray-600'
                      }`}>{task.description}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs transition-colors duration-300 ${
                            isCompleting 
                              ? 'bg-green-100 text-green-700' 
                              : isCompleted 
                              ? 'bg-gray-100 text-gray-400' 
                              : ''
                          }`}
                        >
                          {task.category}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Est. {task.estimatedMinutes} min
                        </span>
                        <span className="text-xs text-blue-600 font-medium">Click for details</span>
                      </div>
                    </div>
                  </div>
                  );
                })}

                {todayTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No tasks scheduled for today</p>
                  </div>
                )}
              </div>

              {todayTasks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      Progress: {completedTasks.length} of {todayTasks.length} tasks completed
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          
          {/* Client Connection Tracker */}
          <ClientConnectionTracker />
          
          {/* Loan Action Tracker */}
          <LoanActionTracker />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                  onClick={() => window.location.href = '/outreach'}
                >
                  <Send className="w-4 h-4 mr-3" />
                  Browse Templates
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                  onClick={() => window.location.href = '/deal-coach'}
                >
                  <UserCheck className="w-4 h-4 mr-3" />
                  Ask Deal Coach
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                  onClick={() => window.location.href = '/roadmap'}
                >
                  <Map className="w-4 h-4 mr-3" />
                  View Roadmap
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
