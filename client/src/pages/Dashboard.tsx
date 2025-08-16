import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import { CalendarIcon, UsersIcon, HomeIcon, FireIcon } from '@heroicons/react/24/outline'
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
  Target,
  Check
} from "lucide-react";

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

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
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
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
      id: 1, 
      name: "Today's Tasks", 
      stat: `${animatedCompleted}/${animatedTotal}`, 
      icon: CalendarIcon, 
      change: todayTasksCompleted > 0 ? `+${todayTasksCompleted}` : '0', 
      changeType: todayTasksCompleted > 0 ? 'increase' : 'neutral' as const
    },
    { 
      id: 2, 
      name: "Client Connects", 
      stat: totalConnections.toString(), 
      icon: UsersIcon, 
      change: totalConnections > 0 ? `+${totalConnections}` : '0', 
      changeType: totalConnections > 0 ? 'increase' : 'neutral' as const
    },
    { 
      id: 3, 
      name: "Ramp Run Days", 
      stat: (progress?.rampRunDays || 0).toString(), 
      icon: FireIcon, 
      change: progress?.rampRunDays && progress.rampRunDays > 0 ? `${progress.rampRunDays} days` : '0', 
      changeType: progress?.rampRunDays && progress.rampRunDays > 0 ? 'increase' : 'neutral' as const
    },
    { 
      id: 4, 
      name: "Closed Loans", 
      stat: (progress?.loansClosed || 0).toString(), 
      icon: HomeIcon, 
      change: progress?.loansClosed && progress.loansClosed > 0 ? `${progress.loansClosed} total` : '0', 
      changeType: progress?.loansClosed && progress.loansClosed > 0 ? 'increase' : 'neutral' as const
    },
  ];

  return (
    <div className="p-6 mx-4 md:mx-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-gray-600 mb-1">Hi {profile?.firstName || user?.firstName || 'there'}!</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Weekly Focus: {getWeekFocus(currentWeek)}
          </h1>
        </div>
        
        {/* Week indicator with progress - aligned with headline on medium+ screens */}
        <div className="flex flex-col items-end mt-4 md:mt-0 text-right min-w-[160px]">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Week {currentWeek} of 14</p>
            <span className="text-xs font-semibold text-white bg-forest-600 px-2 py-1 rounded-full">
              {Math.round((currentWeek / 14) * 100)}%
            </span>
          </div>
          <div className="w-full">
            <Progress 
              value={(currentWeek / 14) * 100} 
              className="h-2 w-full bg-gray-200" 
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Today's Performance
        </h3>
        
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-sm sm:px-6 sm:pt-5"
            >
              <dt>
                <div className="absolute rounded-md bg-forest-600 p-3">
                  <item.icon aria-hidden="true" className="size-6 text-white" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                {item.changeType !== 'neutral' && (
                  <p
                    className={classNames(
                      item.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                      'ml-2 flex items-baseline text-sm font-semibold',
                    )}
                  >
                    {item.changeType === 'increase' ? (
                      <ArrowUpIcon aria-hidden="true" className="size-5 shrink-0 self-center text-green-500" />
                    ) : (
                      <ArrowDownIcon aria-hidden="true" className="size-5 shrink-0 self-center text-red-500" />
                    )}
                    <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                    {item.change}
                  </p>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
{profile?.firstName || user?.firstName || 'Your'}'s Tasks
            </h3>
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          
          <div className="relative overflow-hidden rounded-lg bg-white px-0 pt-0 pb-4 shadow-sm sm:px-0">
            {todaysObjective && (
              <div className="bg-forest-600 text-white px-4 py-4 sm:px-6 mb-4">
                <div className="flex items-center text-sm">
                  <Target className="w-4 h-4 mr-2 text-white" />
                  <span className="font-medium text-white">Today's Focus:</span>
                  <span className="ml-1">{todaysObjective}</span>
                </div>
              </div>
            )}
            
            <ul role="list" className="divide-y divide-gray-100 px-4 sm:px-6">
              {todayTasks.map((task: Task) => {
                const isCompleting = completingTaskId === task.id;
                const isCompleted = task.completed;
                
                const isExpanded = expandedTaskId === task.id;
                
                return (
                  <li key={task.id} className={`transition-all duration-200 ${isCompleted ? 'bg-green-50/50' : ''}`}>
                    <div className="flex items-start justify-between gap-x-6">
                      <div className={`min-w-0 flex-grow cursor-pointer ${isExpanded ? 'pt-5 pb-2' : 'py-5'}`} onClick={() => handleTaskClick(task)}>
                        <div className="flex items-start gap-x-3">
                          <p className={`text-base font-semibold transition-all duration-300 ${
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
                          </p>
                          <p className={`mt-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                            ['outreach', 'client calls', 'follow-up'].includes(task.category?.toLowerCase() || '') 
                              ? 'bg-forest-50 text-forest-700 ring-forest-600/20'
                              : ['research', 'market analysis', 'lead generation'].includes(task.category?.toLowerCase() || '')
                              ? 'bg-teal-50 text-teal-700 ring-teal-600/20'
                              : ['social media', 'content creation', 'marketing', 'branding'].includes(task.category?.toLowerCase() || '')
                              ? 'bg-lime-50 text-lime-700 ring-lime-600/20'
                              : ['admin', 'planning', 'setup', 'organization'].includes(task.category?.toLowerCase() || '')
                              ? 'bg-slate-50 text-slate-700 ring-slate-600/20'
                              : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                          }`}>
                            {task.category}
                          </p>
                        </div>
                        {!isExpanded && (
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-x-2 text-xs/5 text-gray-500">
                              <p className="whitespace-nowrap">
                                Est. {task.estimatedMinutes} min
                              </p>
                              <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                                <circle r={1} cx={1} cy={1} />
                              </svg>
                              <p className="truncate">{task.description}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-none items-center gap-x-4 py-5">
                        {isCompleted ? (
                          <div className="flex items-center gap-2 mr-3">
                            <span className="text-xs font-semibold text-forest-600 uppercase tracking-wide">Completed</span>
                            <Check className="w-5 h-5 text-forest-600" />
                          </div>
                        ) : (
                          !isExpanded && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isCompleting) {
                                  handleTaskComplete(task.id);
                                }
                              }}
                              disabled={isCompleting}
                              className={`rounded-md px-2.5 py-1.5 text-xs font-medium shadow-xs transition-all duration-200 ${
                                isCompleting
                                  ? 'bg-green-500 text-white'
                                  : 'bg-limeglow-400 text-forest-800 hover:bg-limeglow-300'
                              }`}
                            >
                              {isCompleting ? 'Completing...' : 'Mark Completed'}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <>
                        <div className="pb-5">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-600">{task.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-forest-600 uppercase tracking-wide flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {task.estimatedMinutes} minutes
                              </p>
                            </div>
                            {!isCompleted && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isCompleting) {
                                    handleTaskComplete(task.id);
                                  }
                                }}
                                disabled={isCompleting}
                                className={`rounded-md px-2.5 py-1.5 text-xs font-medium shadow-xs transition-all duration-200 ${
                                  isCompleting
                                    ? 'bg-green-500 text-white'
                                    : 'bg-limeglow-400 text-forest-800 hover:bg-limeglow-300'
                                }`}
                              >
                                {isCompleting ? 'Completing...' : 'Mark Completed'}
                              </Button>
                            )}
                          </div>
                          
                          {task.detailedDescription && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Details</h4>
                              <p className="text-sm text-gray-600">{task.detailedDescription}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      </>
                    )}
                  </li>
                );
              })}
              
              {todayTasks.length === 0 && (
                <li className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks scheduled for today</p>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          
          {/* Client Connection Tracker */}
          <ClientConnectionTracker />
          
          {/* Loan Action Tracker */}
          <LoanActionTracker />

          {/* Quick Actions */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Send className="w-5 h-5" />
              Quick Actions
            </h3>
            
            <div className="relative overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-sm sm:px-6 sm:pt-5">
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
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
