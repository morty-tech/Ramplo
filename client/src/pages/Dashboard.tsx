import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Task } from "@shared/schema";
import { 
  Flame, 
  FileText, 
  Home, 
  Calendar,
  Send,
  UserCheck,
  Map,
  Trophy,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const { user, progress } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todayTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks", { week: progress?.currentWeek, day: progress?.currentDay }],
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiRequest("PATCH", `/api/tasks/${taskId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task completed!",
        description: "Great job staying on track!",
      });
    },
  });

  const completedTasks = todayTasks.filter((task: Task) => task.completed);
  const progressPercentage = todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0;

  const stats = [
    {
      title: "Day Streak",
      value: progress?.currentStreak || 0,
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Applications Submitted", 
      value: progress?.applicationsSubmitted || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Loans Closed",
      value: progress?.loansClosed || 0,
      icon: Home,
      color: "text-green-600", 
      bgColor: "bg-green-100",
    },
    {
      title: "Week Progress",
      value: `Week ${progress?.currentWeek || 1}`,
      subtitle: "of 13 Weeks",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || 'there'}!
        </h1>
        <p className="text-gray-600">Here's your progress on your 90-day ramp plan.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.subtitle || stat.title}</div>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <stat.icon className={`${stat.color} text-xl`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayTasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className={`flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors ${
                      task.completed ? 'opacity-50' : ''
                    }`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => {
                        if (!task.completed) {
                          completeTaskMutation.mutate(task.id);
                        }
                      }}
                      disabled={task.completed}
                      className="mt-1"
                    />
                    <div className="flex-grow">
                      <h3 className={`font-medium text-gray-900 ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <Badge variant="secondary" className="text-xs">
                          {task.category}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Est. {task.estimatedMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

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
          
          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => {
                  const dayNumber = index + 1;
                  const currentDay = progress?.currentDay || 1;
                  const isCompleted = dayNumber < currentDay;
                  const isCurrent = dayNumber === currentDay;
                  
                  return (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{day}</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-600 text-white' 
                          : isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200'
                      }`}>
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : isCurrent ? (
                          <span className="text-xs font-bold">{dayNumber}</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/outreach'}
                >
                  <Send className="w-4 h-4 mr-3" />
                  Browse Templates
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/deal-coach'}
                >
                  <UserCheck className="w-4 h-4 mr-3" />
                  Ask Deal Coach
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/roadmap'}
                >
                  <Map className="w-4 h-4 mr-3" />
                  View Roadmap
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Badge */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Streak Master!</h3>
              <p className="text-sm opacity-90">
                You've completed tasks for {progress?.currentStreak || 0} days straight. Keep it up!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
