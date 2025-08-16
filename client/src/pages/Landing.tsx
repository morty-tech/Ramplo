import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Target, 
  CheckCircle, 
  Bot,
  ArrowRight,
  Star,
  Send,
  User
} from "lucide-react";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const { toast } = useToast();

  const handleGetStarted = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/auth/send-magic-link", { email });
      setLinkSent(true);
      toast({
        title: "Magic link sent!",
        description: "Check your email to get started.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (linkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a secure login link to <strong>{email}</strong>
            </p>
            <Button 
              variant="outline" 
              onClick={() => setLinkSent(false)}
              className="w-full"
            >
              Send another link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-tealwave-800">
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-bounce"
            style={{ animationDuration: '6s' }}
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-forest-400 to-limeglow-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse"
            />
          </div>
          
          {/* Centered Logo */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-white">RampLO</h1>
          </div>

          <div className="mx-auto max-w-2xl py-8 sm:py-12 lg:py-16">
            <div className="text-center">
              <h1 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">
                Get Your First 3 Deals in
                <span className="text-limeglow-400"> 90 Days</span>
              </h1>
              <p className="mt-8 text-lg font-medium text-pretty text-slate-200 sm:text-xl/8">
                RampLO is an AI-powered 90-day training program designed to help mortgage loan officers 
                secure their first deals through personalized daily tasks, client tracking, and expert coaching.
              </p>
              
              {/* Email Signup */}
              <form onSubmit={handleGetStarted} className="mt-10 max-w-md mx-auto mb-8">
                <div className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-slate-300"
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-limeglow-600 text-forest-800 hover:bg-limeglow-500 px-8 font-semibold"
                  >
                    {isLoading ? "Sending..." : "Get Started"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>

              <p className="text-sm text-slate-300">
                Free for Morty users • $49/month for others • No commitment required
              </p>
            </div>
          </div>
          
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] animate-bounce"
            style={{ animationDuration: '8s', animationDelay: '2s' }}
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-tealwave-400 to-forest-600 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] animate-pulse"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative isolate overflow-hidden bg-white py-24 sm:py-32">
        <svg
          aria-hidden="true"
          className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-slate-200/30"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-slate-200/10">
            <path
              d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)" width="100%" height="100%" strokeWidth={0} />
        </svg>
        <div
          aria-hidden="true"
          className="absolute top-10 left-[calc(50%-4rem)] -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:top-[calc(50%-30rem)] lg:left-48 xl:left-[calc(50%-24rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-forest-400 to-tealwave-600 opacity-20"
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
              Everything you need to succeed
            </h2>
            <p className="mt-6 text-lg/8 text-gray-600">
              A complete AI-powered system to guide your journey from new loan officer to closing deals.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="text-base/7 font-semibold text-gray-900">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-forest-600">
                    <Calendar aria-hidden="true" className="size-6 text-white" />
                  </div>
                  AI Daily Action Plan
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-600">
                  <p className="flex-auto">
                    Wake up to a personalized action plan built just for you—tailored to your experience level, market focus, and available time. Know exactly what to do to move your business forward each day.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="text-base/7 font-semibold text-gray-900">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-tealwave-600">
                    <Send aria-hidden="true" className="size-6 text-white" />
                  </div>
                  AI Outreach & Marketing Templates
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-600">
                  <p className="flex-auto">
                    Access a library of email and social media templates generated by AI and customized to your style, audience, and goals. Build consistent, effective outreach without starting from scratch.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="text-base/7 font-semibold text-gray-900">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-limeglow-600">
                    <Bot aria-hidden="true" className="size-6 text-forest-800" />
                  </div>
                  AI Deal Coach
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-600">
                  <p className="flex-auto">
                    Upload tricky loan scenarios and get instant, expert-level strategies to structure the deal, overcome obstacles, and close with confidence.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-forest-800 px-6 py-20 sm:rounded-3xl sm:px-10 sm:py-24 lg:py-24 xl:px-24">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center lg:gap-y-0">
              <div className="lg:row-start-2 lg:max-w-md">
                <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
                  How It Works
                </h2>
                <p className="mt-6 text-lg/8 text-slate-300">
                  Simple steps to launch your mortgage career and secure your first deals in 90 days.
                </p>
              </div>
              <div className="relative -z-20 max-w-xl min-w-full min-h-[32rem] rounded-xl lg:row-span-4 lg:w-[64rem] lg:max-w-none flex items-center justify-center bg-gradient-to-br from-tealwave-600 to-limeglow-600 py-24 px-16 shadow-xl ring-1 ring-white/10">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-12 h-12 text-forest-800" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">90-Day Success Plan</h3>
                  <p className="text-limeglow-200">Your personalized roadmap to closing deals</p>
                </div>
              </div>
              <div className="max-w-xl lg:row-start-3 lg:mt-10 lg:max-w-md lg:border-t lg:border-white/10 lg:pt-10">
                <dl className="max-w-xl space-y-8 text-base/7 text-slate-300 lg:max-w-none">
                  <div className="relative">
                    <dt className="ml-9 inline-block font-semibold text-white">
                      <User
                        aria-hidden="true"
                        className="absolute top-1 left-1 size-5 text-limeglow-400"
                      />
                      Complete Your Profile
                    </dt>{' '}
                    <dd className="inline">Tell us about your experience, market focus, and goals. Our AI creates a personalized 90-day plan just for you.</dd>
                  </div>
                  <div className="relative">
                    <dt className="ml-9 inline-block font-semibold text-white">
                      <Calendar
                        aria-hidden="true"
                        className="absolute top-1 left-1 size-5 text-limeglow-400"
                      />
                      Follow Daily Tasks
                    </dt>{' '}
                    <dd className="inline">Complete 3-5 personalized tasks each day. Track your connections and watch your pipeline grow consistently.</dd>
                  </div>
                  <div className="relative">
                    <dt className="ml-9 inline-block font-semibold text-white">
                      <TrendingUp
                        aria-hidden="true"
                        className="absolute top-1 left-1 size-5 text-limeglow-400"
                      />
                      Close Your First Deals
                    </dt>{' '}
                    <dd className="inline">Use AI coaching and proven templates to convert leads into closed loans. Achieve your first 1-3 deals in 90 days.</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-12 -z-10 -translate-y-1/2 transform-gpu blur-3xl lg:top-auto lg:-bottom-48 lg:translate-y-0"
            >
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-tealwave-400 to-limeglow-600 opacity-25"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-tealwave-600">
        <div className="px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
              Ready to Launch Your Mortgage Career?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-tealwave-200">
              Join loan officers who are already using RampLO to build successful careers and secure their first deals.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <form onSubmit={handleGetStarted} className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white text-gray-900 placeholder:text-gray-500"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-tealwave-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {isLoading ? "Sending..." : "Get Started"}
                </Button>
              </form>
            </div>
            <p className="mt-6 text-sm text-tealwave-200">
              Free for Morty users • $49/month for others • No commitment required
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">RampLO</h3>
            <p className="text-gray-400">
              AI-powered 90-day ramp plan for mortgage loan officers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}