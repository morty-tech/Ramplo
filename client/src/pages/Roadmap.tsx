import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Task } from "@shared/schema";
import TaskDetailModal from "@/components/TaskDetailModal";
import DayModal from "@/components/DayModal";
import { TaskList } from "@/components/TaskList";
import { useTaskManagement } from "@/hooks/useTaskManagement";
import { Check, Clock, Calendar, Eye, Lock, Target, Star, TrendingUp } from "lucide-react";

const TOTAL_WEEKS = 14;

export default function Roadmap() {
  const { progress } = useAuth();
  const { expandedTaskId, completingTaskId, handleTaskComplete, handleTaskClick } = useTaskManagement();
  
  const currentWeek = progress?.currentWeek || 1;
  const completedTasks = progress?.tasksCompleted || 0;
  const daysRemaining = 90 - ((currentWeek - 1) * 7 + (progress?.currentDay || 1));

  // Query for all tasks to enable detailed view
  const { data: allTasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/tasks");
      return response.json();
    },
  });

  // Query for the foundation roadmap structure
  const { data: roadmapData, isLoading: roadmapLoading } = useQuery({
    queryKey: ["/api/roadmap/select"],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/roadmap/select", {});
      return response.json();
    },
  });

  // Query for today's tasks specifically
  const { data: todayTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks", `week=${currentWeek}&day=${progress?.currentDay || 1}`],
    queryFn: async () => {
      const week = currentWeek;
      const day = progress?.currentDay || 1;
      const response = await apiRequest("GET", `/api/tasks?week=${week}&day=${day}`);
      return response.json();
    },
    enabled: !!progress,
  });



  const getTaskForTitle = (taskTitle: string) => {
    return allTasks.find(task => task.title.toLowerCase().includes(taskTitle.toLowerCase()));
  };

  // Calculate totals after allTasks is available
  const totalTasks = allTasks.length; // Actual number of tasks from foundation roadmap
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Generate weeks with days from foundation roadmap data - only show real data
  const weeks = React.useMemo(() => {
    if (roadmapData?.selectedRoadmap?.weeklyTasks?.length > 0) {
      return roadmapData.selectedRoadmap.weeklyTasks.map((weekData: any) => {
        let days = weekData.days || [];
        
        // Handle old dailyTasks format - convert to new days structure
        if (!weekData.days && weekData.dailyTasks) {
          // Group dailyTasks by day number
          const groupedByDay: { [key: number]: any[] } = {};
          weekData.dailyTasks.forEach((task: any) => {
            if (!groupedByDay[task.day]) {
              groupedByDay[task.day] = [];
            }
            groupedByDay[task.day].push(task);
          });
          
          // Convert to new days format
          days = Object.keys(groupedByDay).map(dayStr => {
            const dayNum = parseInt(dayStr);
            const dayTasks = groupedByDay[dayNum];
            return {
              day: dayNum,
              objective: `Day ${dayNum} objectives for ${weekData.theme}`,
              extraTimeActivity: "Additional research and networking",
              tasks: dayTasks
            };
          }).sort((a, b) => a.day - b.day);
        }
        
        return {
          week: weekData.week,
          title: weekData.theme,
          description: `Week ${weekData.week} focuses on ${weekData.theme.toLowerCase()}.`,
          days,
          status: currentWeek > weekData.week ? "completed" : currentWeek === weekData.week ? "current" : "upcoming"
        };
      });
    }
    
    // No fallback - only show real roadmap data
    return [];
  }, [roadmapData, currentWeek]);

  const handleDayClick = (week: any, day: any) => {
    // Allow clicking on current week, past weeks, and up to 2 weeks ahead
    const maxClickableWeek = currentWeek + 2;
    if (week.week > maxClickableWeek) return;
    
    // For now, we'll just expand the day view - this could be enhanced later
    console.log("Day clicked:", day, "Week:", week.week);
  };

  // Helper function to determine if a week should show daily objectives
  const shouldShowDailyObjectives = (weekNumber: number) => {
    // Show objectives for current week + next 2 weeks
    return weekNumber >= currentWeek && weekNumber <= currentWeek + 2;
  };

  // Calculate current day for highlighting
  const currentDay = progress?.currentDay || 1;
  
  // Calculate completion percentages for days
  const getDayCompletionPercentage = (week: number, day: number) => {
    const dayTasks = allTasks.filter(task => task.week === week && task.day === day);
    if (dayTasks.length === 0) return 0;
    const completedTasks = dayTasks.filter(task => task.completed);
    return Math.round((completedTasks.length / dayTasks.length) * 100);
  };
  
  // Get today's date info
  const today = new Date();
  const isToday = (week: number, day: number) => {
    return week === currentWeek && day === currentDay;
  };

  // Check if any critical data is still loading
  const isLoading = tasksLoading || roadmapLoading || !progress;

  // Loading screen matching dashboard style
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative">
            {/* Animated spinner */}
            <div className="w-12 h-12 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin mx-auto mb-4"></div>
            {/* Pulsing background ring */}
            <div className="absolute inset-0 w-12 h-12 border-2 border-forest-100 rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your Roadmap</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-4 md:mx-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your 90-Day Roadmap</h1>
        <p className="text-gray-600">A personalized plan to get your first 1-3 deals in 90 days.</p>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Overall Progress
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-sm sm:px-6 sm:pt-5">
          <dt>
            <div className="absolute rounded-md bg-forest-100 p-3">
              <Check aria-hidden="true" className="size-6 text-forest-600" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">Tasks Completed</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{completedTasks}</p>
          </dd>
        </div>
        <div className="relative overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-sm sm:px-6 sm:pt-5">
          <dt>
            <div className="absolute rounded-md bg-blue-500/15 p-3">
              <Target aria-hidden="true" className="size-6 text-blue-600" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">Total Tasks</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{totalTasks}</p>
          </dd>
        </div>
        <div className="relative overflow-hidden rounded-lg bg-white px-4 pt-4 pb-4 shadow-sm sm:px-6 sm:pt-5">
          <dt>
            <div className="absolute rounded-md bg-orange-500/15 p-3">
              <Calendar aria-hidden="true" className="size-6 text-orange-600" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">Days Remaining</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{daysRemaining}</p>
          </dd>
        </div>
        </div>
      </div>

      {/* Weekly Breakdown */}
      {roadmapLoading ? (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">Loading your personalized roadmap...</div>
        </div>
      ) : weeks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">Roadmap is loading. Please complete your onboarding to generate your personalized plan.</div>
        </div>
      ) : (
        <>
          {/* Current Week - Full Width at Top */}
          {weeks.filter((week: any) => week.status === 'current').map((week: any) => (
            <div key={`current-${week.week}`} className="mb-8">
              <Card className="border-2 border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      Week {week.week}: {week.title}
                    </CardTitle>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-6">{week.description}</p>
                  
                  {/* Today's Tasks Section */}
                  <div className="mb-6">
                    <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Today's Tasks
                    </h4>
                    
                    <div className="relative overflow-hidden rounded-lg bg-white border border-gray-200">
                      <TaskList
                        tasks={todayTasks}
                        expandedTaskId={expandedTaskId}
                        completingTaskId={completingTaskId}
                        onTaskClick={handleTaskClick}
                        onTaskComplete={handleTaskComplete}
                        variant="roadmap"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* Other Weeks - Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {weeks.filter((week: any) => week.status !== 'current').map((week: any) => (
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
                    ? 'bg-forest-600' 
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
              <div className="space-y-3">
                {week.days?.length > 0 ? (
                  week.days.map((day: any, index: number) => {
                    const isDayAccessible = week.status !== "upcoming" || shouldShowDailyObjectives(week.week);
                    const isCurrentDay = week.status === "current" && day.day === currentDay;
                    const isDayCompleted = week.status === "completed" || (week.status === "current" && day.day < currentDay);
                    const isTodayHighlight = isToday(week.week, day.day);
                    const completionPercentage = getDayCompletionPercentage(week.week, day.day);
                    
                    return (
                      <div 
                        key={day.day}
                        className={`p-3 rounded-lg border transition-all cursor-pointer group relative ${
                          isTodayHighlight
                            ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                            : isCurrentDay 
                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                            : isDayCompleted
                            ? 'border-forest-300 bg-forest-50' 
                            : isDayAccessible
                            ? week.status === "upcoming" && shouldShowDailyObjectives(week.week)
                              ? 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                              : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                            : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                        }`}
                        onClick={() => isDayAccessible && handleDayClick(week, day)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              isTodayHighlight
                                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                : isCurrentDay
                                ? 'bg-blue-600 text-white'
                                : isDayCompleted
                                ? 'bg-forest-600 text-white'
                                : isDayAccessible
                                ? week.status === "upcoming" && shouldShowDailyObjectives(week.week)
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-gray-200 text-gray-700'
                                : 'bg-gray-300 text-gray-500'
                            }`}>
                              {isDayCompleted ? (
                                <Check className="w-4 h-4" />
                              ) : isDayAccessible ? (
                                day.day
                              ) : (
                                <Lock className="w-3 h-3" />
                              )}
                              {isTodayHighlight && (
                                <Star className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400 fill-current" />
                              )}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-sm text-gray-900">
                                  Day {day.day}
                                  {isTodayHighlight && (
                                    <span className="ml-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
                                      TODAY
                                    </span>
                                  )}
                                </div>
                                {(isDayCompleted || isCurrentDay) && completionPercentage >= 0 && (
                                  <div className="text-xs text-gray-500 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {completionPercentage}%
                                  </div>
                                )}
                              </div>
                              <div className={`text-xs mt-1 ${
                                isTodayHighlight ? 'text-blue-700 font-medium' :
                                isCurrentDay ? 'text-blue-700' : 
                                isDayCompleted ? 'text-forest-700' : 
                                week.status === "upcoming" && shouldShowDailyObjectives(week.week) ? 'text-slate-700' : 
                                'text-gray-600'
                              }`}>
                                <Target className="w-3 h-3 inline mr-1" />
                                {day.objective}
                              </div>
                              {(isDayCompleted || isCurrentDay) && completionPercentage > 0 && (
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="h-1.5 rounded-full transition-all duration-300 bg-blue-500"
                                      style={{ width: `${completionPercentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {isDayAccessible && (
                            <div className="text-xs text-gray-500 group-hover:text-primary transition-colors text-right">
                              {isTodayHighlight ? (
                                <div className="text-blue-600 font-medium">Active</div>
                              ) : (
                                "Click to view"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : shouldShowDailyObjectives(week.week) ? (
                  <div className="text-sm text-gray-500 italic">
                    Daily objectives will be available when this week begins.
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Week details will be available soon.
                  </div>
                )}
              </div>
              {/* Only show badge section for weeks that need a badge - exclude upcoming weeks with objectives */}
              {(week.status === 'completed' || week.status === 'current' || (week.status === 'upcoming' && !shouldShowDailyObjectives(week.week))) && (
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
                    {week.status === 'upcoming' && !shouldShowDailyObjectives(week.week) && 'Coming Soon'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
          </div>
        </>
      )}

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


    </div>
  );
}
