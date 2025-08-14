import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Calendar } from "lucide-react";

const TOTAL_WEEKS = 13;

export default function Roadmap() {
  const { progress } = useAuth();
  
  const currentWeek = progress?.currentWeek || 1;
  const completedTasks = progress?.tasksCompleted || 0;
  const totalTasks = 155; // Mock total tasks for 13 weeks
  const overallProgress = (completedTasks / totalTasks) * 100;
  const daysRemaining = 90 - ((currentWeek - 1) * 7 + (progress?.currentDay || 1));

  const weeks = [
    {
      week: 1,
      title: "Foundation",
      description: "Set up your systems, CRM, and basic marketing materials.",
      tasks: [
        "Complete CRM setup",
        "Create professional email signature", 
        "Build initial contact list",
        "Set up social media profiles",
        "Create first week of content"
      ],
      status: currentWeek > 1 ? "completed" : currentWeek === 1 ? "current" : "upcoming"
    },
    {
      week: 2,
      title: "Network Building",
      description: "Begin outreach to realtors and build your professional network.",
      tasks: [
        "Send 15 realtor introduction emails",
        "Attend 2 networking events",
        "Create LinkedIn content plan",
        "Schedule follow-up calls",
        "Join local real estate groups"
      ],
      status: currentWeek > 2 ? "completed" : currentWeek === 2 ? "current" : "upcoming"
    },
    {
      week: 3,
      title: "Marketing Launch",
      description: "Launch your marketing campaigns and start generating leads.",
      tasks: [
        "Launch first-time buyer campaign",
        "Create educational content series",
        "Set up referral partner program",
        "Track and optimize campaigns",
        "Schedule client consultations"
      ],
      status: currentWeek > 3 ? "completed" : currentWeek === 3 ? "current" : "upcoming"
    },
    {
      week: 4,
      title: "Pipeline Development",
      description: "Focus on converting leads into applications and building your pipeline.",
      tasks: [
        "Follow up with all warm leads",
        "Process 3 loan applications",
        "Expand realtor partnerships",
        "Launch HELOC campaign",
        "Optimize conversion rates"
      ],
      status: currentWeek > 4 ? "completed" : currentWeek === 4 ? "current" : "upcoming"
    },
    {
      week: 5,
      title: "Relationship Nurturing",
      description: "Strengthen existing relationships and continue building new connections.",
      tasks: [
        "Host client appreciation event",
        "Create referral incentive program",
        "Develop strategic partnerships"
      ],
      status: currentWeek > 5 ? "completed" : currentWeek === 5 ? "current" : "upcoming"
    },
    {
      week: 6,
      title: "Advanced Strategies",
      description: "Implement advanced marketing tactics and refine your approach.",
      tasks: [
        "Launch video marketing campaign",
        "Analyze and optimize processes",
        "Expand market reach"
      ],
      status: currentWeek > 6 ? "completed" : currentWeek === 6 ? "current" : "upcoming"
    }
  ];

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
        {weeks.map((week) => (
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
                {week.tasks.map((task, index) => (
                  <div key={index} className="flex items-center text-sm">
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
                ))}
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

        {/* Preview cards for remaining weeks */}
        {Array.from({ length: Math.max(0, TOTAL_WEEKS - weeks.length) }, (_, i) => (
          <Card key={weeks.length + i + 1} className="opacity-75">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Week {weeks.length + i + 1}: Advanced Training
                </CardTitle>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{weeks.length + i + 1}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Advanced strategies and techniques for scaling your business.
              </p>
              <div className="space-y-2">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="h-2 w-2 bg-gray-300 rounded-full mr-2" />
                    <span className="text-gray-500">Advanced strategy {index}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
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
    </div>
  );
}
