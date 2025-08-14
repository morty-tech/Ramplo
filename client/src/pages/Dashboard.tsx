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
import ClientConnectionTracker from "@/components/ClientConnectionTracker";
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
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task completed!",
        description: "Great job staying on track!",
      });
    },
  });

  const completedTasks = todayTasks.filter((task: Task) => task.completed);
  const progressPercentage = todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0;

  const todayTasksCompleted = todayTasks.filter((task: Task) => task.completed).length;
  const todayTasksTotal = todayTasks.length;

  const stats = [
    {
      title: "Today's Tasks",
      value: `${todayTasksCompleted}/${todayTasksTotal}`,
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || 'there'}!
        </h1>
        <p className="text-gray-600">Here's your progress on your 90-day ramp plan.</p>
      </div>

      {/* Week Progress Banner */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Week {progress?.currentWeek || 1} of 13
              </h2>
              <p className="text-gray-600">Progress for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{Math.round(((progress?.currentWeek || 1) - 1) / 13 * 100)}%</div>
              <div className="text-sm text-gray-600">Program Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
          
          {/* Client Connection Tracker */}
          <ClientConnectionTracker />
          


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
