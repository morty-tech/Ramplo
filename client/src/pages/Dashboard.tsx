import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import { BoltIcon, UsersIcon, TrophyIcon, FireIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Task } from "@shared/schema";
import ClientConnectionTracker from "@/components/ClientConnectionTracker";
import LoanActionTracker from "@/components/LoanActionTracker";
import { TaskList } from "@/components/TaskList";
import { useTaskManagement } from "@/hooks/useTaskManagement";
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
  Check,
  ChevronRight
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
  const { expandedTaskId, completingTaskId, handleTaskComplete, handleTaskClick } = useTaskManagement();

  const { data: todayTasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      // Backend now automatically calculates current week/day based on start date
      const response = await apiRequest("GET", "/api/tasks");
      return response.json();
    },
  });

  const { data: todayConnections, isLoading: connectionsLoading } = useQuery({
    queryKey: ["/api/connections/today"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/connections/today");
      return response.json();
    },
  });



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
  const { data: roadmapData, isLoading: roadmapLoading } = useQuery({
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
      icon: BoltIcon, 
      change: todayTasksCompleted > 0 ? `+${todayTasksCompleted}` : '0', 
      changeType: todayTasksCompleted > 0 ? 'increase' : 'neutral' as const
    },
    { 
      id: 2, 
      name: "Daily Client Connects", 
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
      icon: TrophyIcon, 
      change: progress?.loansClosed && progress.loansClosed > 0 ? `${progress.loansClosed} total` : '0', 
      changeType: progress?.loansClosed && progress.loansClosed > 0 ? 'increase' : 'neutral' as const
    },
  ];

  // Check if any critical data is still loading
  const isLoading = tasksLoading || connectionsLoading || roadmapLoading || !progress;

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative">
            {/* Animated spinner */}
            <div className="w-12 h-12 border-4 border-aura-200 border-t-aura-600 rounded-full animate-spin mx-auto mb-4"></div>
            {/* Pulsing background ring */}
            <div className="absolute inset-0 w-12 h-12 border-2 border-aura-100 rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your Dashboard</p>
        </div>
      </div>
    );
  }

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
            <span className="text-xs font-semibold text-white bg-aura-600 px-2 py-1 rounded-full">
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
          <Target className="w-5 h-5 text-aura-600" />
          Your Performance
        </h3>
        
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-sm sm:px-6 sm:pt-5"
            >
              <dt>
                <div className="absolute p-3">
                  <item.icon aria-hidden="true" className="size-8 text-aura-600" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                {item.changeType !== 'neutral' && (
                  <p
                    className={classNames(
                      item.changeType === 'increase' ? 'text-electric-600' : 'text-red-600',
                      'ml-2 flex items-baseline text-sm font-semibold',
                    )}
                  >
                    {item.changeType === 'increase' ? (
                      <ArrowUpIcon aria-hidden="true" className="size-5 shrink-0 self-center text-electric-600" />
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
        
        {/* Today's Tasks and Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-aura-600" />
              {profile?.firstName || user?.firstName || 'Your'}'s Tasks for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
          </div>
          
          <div className="relative overflow-hidden rounded-lg bg-white px-0 pt-0 pb-4 shadow-sm sm:px-0">
            {todaysObjective && (
              <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 mb-4">
                <div className="text-left">
                  
                  <div className="text-slate-800 text-base"><span className="font-semibold">Today you will</span> {todaysObjective?.charAt(0).toLowerCase() + todaysObjective?.slice(1)}</div>
                </div>
              </div>
            )}
            
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 px-4 sm:px-6">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No tasks scheduled for today</p>
              </div>
            ) : (
              <TaskList
                tasks={todayTasks}
                expandedTaskId={expandedTaskId}
                completingTaskId={completingTaskId}
                onTaskClick={handleTaskClick}
                onTaskComplete={handleTaskComplete}
                variant="dashboard"
              />
            )}
          </div>
          
          {/* Quick Actions - Below tasks on large screens */}
          <div className="lg:block hidden">
            <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Send className="w-5 h-5 text-aura-600" />
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                className="h-auto p-4 flex flex-col items-center gap-3 bg-white hover:bg-gray-50 border-0 shadow-sm"
                onClick={() => window.location.href = '/outreach'}
              >
                <Send className="w-6 h-6 text-aura-600" />
                <p className="text-sm font-medium text-gray-900">Browse Templates</p>
              </Button>
              
              <Button
                className="h-auto p-4 flex flex-col items-center gap-3 bg-white hover:bg-gray-50 border-0 shadow-sm"
                onClick={() => window.location.href = '/deal-coach'}
              >
                <UserCheck className="w-6 h-6 text-eclipse-600" />
                <p className="text-sm font-medium text-gray-900">Ask Deal Coach</p>
              </Button>
              
              <Button
                className="h-auto p-4 flex flex-col items-center gap-3 bg-white hover:bg-gray-50 border-0 shadow-sm"
                onClick={() => window.location.href = '/roadmap'}
              >
                <Map className="w-6 h-6 text-electric-600" />
                <p className="text-sm font-medium text-gray-900">View Roadmap</p>
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          
          {/* Client Connection and Loan Action Trackers - Side by Side on Medium+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-6">
            {/* Client Connection Tracker */}
            <ClientConnectionTracker />
            
            {/* Loan Action Tracker */}
            <LoanActionTracker />
          </div>

          {/* Quick Actions - Sidebar version for smaller screens */}
          <div className="lg:hidden">
            <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Send className="w-5 h-5 text-aura-600" />
              Quick Actions
            </h3>
            
            <div className="relative overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-sm sm:px-6 sm:pt-5">
              <div className="space-y-0">
                <div className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 rounded-lg" onClick={() => window.location.href = '/outreach'}>
                  <div className="flex items-center gap-3">
                    <div className="absolute p-2">
                      <Send aria-hidden="true" className="size-5 text-aura-600" />
                    </div>
                    <div className="ml-14">
                      <p className="text-sm font-medium text-gray-500">Email & outreach</p>
                      <p className="text-lg font-semibold text-gray-900">Browse Templates</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-100"></div>
                
                <div className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 rounded-lg" onClick={() => window.location.href = '/deal-coach'}>
                  <div className="flex items-center gap-3">
                    <div className="absolute p-2">
                      <UserCheck aria-hidden="true" className="size-5 text-eclipse-600" />
                    </div>
                    <div className="ml-14">
                      <p className="text-sm font-medium text-gray-500">AI Assistant</p>
                      <p className="text-lg font-semibold text-gray-900">Ask Deal Coach</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-100"></div>
                
                <div className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 rounded-lg" onClick={() => window.location.href = '/roadmap'}>
                  <div className="flex items-center gap-3">
                    <div className="absolute p-2">
                      <Map aria-hidden="true" className="size-5 text-electric-600" />
                    </div>
                    <div className="ml-14">
                      <p className="text-sm font-medium text-gray-500">Progress</p>
                      <p className="text-lg font-semibold text-gray-900">View Roadmap</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}