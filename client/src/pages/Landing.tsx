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
  Star
} from "lucide-react";

// Import new design system components
import { Container } from "@/components/design-system/container";
import { Gradient, GradientBackground } from "@/components/design-system/gradient";
import { PlusGrid } from "@/components/design-system/plus-grid";
import { Navbar } from "@/components/design-system/navbar";
import { Heading, Subheading, Lead } from "@/components/design-system/text";
import { BentoCard } from "@/components/design-system/bento-card";
import { Testimonials, type Testimonial } from "@/components/design-system/testimonials";
import { Footer } from "@/components/design-system/footer";
import { AnimatedNumber } from "@/components/design-system/animated-number";

// Sample testimonials data
const testimonials: Testimonial[] = [
  {
    author: {
      name: "Sarah Chen",
      title: "Mortgage Loan Officer, Wells Fargo",
      image: "https://images.unsplash.com/photo-1494790108755-2616b9f44862?w=150&h=150&fit=crop&crop=face"
    },
    body: "RampLO helped me close my first 3 deals in just 2 months. The daily tasks kept me focused and the AI coaching was invaluable for difficult situations."
  },
  {
    author: {
      name: "Marcus Rodriguez",
      title: "Senior Loan Officer, Quicken Loans",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    body: "The personalized roadmap made all the difference. Instead of guessing what to do next, I had clear daily actions that built real momentum."
  },
  {
    author: {
      name: "Jennifer Kim",
      title: "Mortgage Professional, Chase Bank",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    body: "The email templates and social media content saved me hours each week. Everything is customized to sound like me, not generic marketing."
  }
];

export default function Landing() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const { toast } = useToast();

  const handleGetStarted = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="relative">
          <Gradient className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-black/5 ring-inset" />
          <Card className="w-full max-w-md relative">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        <Gradient className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-black/5 ring-inset" />
        <Container className="relative">
          <Navbar 
            banner={
              <p className="text-sm text-white">
                <strong className="font-semibold">New:</strong> AI Deal Coach now available for complex scenarios
              </p>
            }
            onGetStarted={handleGetStarted}
          />
          <div className="pb-24 pt-16 sm:pb-32 sm:pt-24 md:pb-48 md:pt-32">
            <Heading className="text-center mb-8">
              Get Your First 3 Deals in{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                90 Days
              </span>
            </Heading>
            <Lead className="mx-auto max-w-2xl text-center mb-8">
              RampLO is an AI-powered 90-day training program designed to help mortgage loan officers 
              secure their first deals through personalized daily tasks, client tracking, and expert coaching.
            </Lead>
            
            {/* Email Signup */}
            <form onSubmit={handleGetStarted} className="max-w-md mx-auto mb-8">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 px-4 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gray-950 hover:bg-gray-800 px-8 h-12 rounded-lg font-semibold"
                >
                  {isLoading ? "Sending..." : "Get Started"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>

            <p className="text-sm text-gray-600 text-center">
              Free for Morty users • $49/month for others • No commitment required
            </p>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
              <div>
                <div className="text-4xl font-bold text-gray-900">
                  <AnimatedNumber value={90} />%
                </div>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">
                  <AnimatedNumber value={1200} />+
                </div>
                <p className="text-sm text-gray-600">LOs Trained</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">
                  <AnimatedNumber value={47} />
                </div>
                <p className="text-sm text-gray-600">Avg Days to First Deal</p>
              </div>
            </div>
          </div>
        </Container>
        <PlusGrid className="text-gray-300" />
        <GradientBackground />
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Subheading>Everything You Need to Succeed</Subheading>
            <Lead className="mt-6">
              A complete system to guide your journey from new loan officer to closing deals
            </Lead>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <BentoCard
              eyebrow="Daily Planning"
              title="AI-Powered Daily Tasks"
              description="Personalized daily action plans based on your experience level, market focus, and available time. Never wonder what to do next."
              graphic={
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <Calendar className="w-24 h-24 text-blue-600" />
                </div>
              }
              fade={['bottom']}
            />
            
            <BentoCard
              eyebrow="Relationship Building"
              title="Client Connection Tracking"
              description="Track daily phone calls, emails, and text messages. Build consistent outreach habits that lead to real relationships."
              graphic={
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                  <Users className="w-24 h-24 text-green-600" />
                </div>
              }
              fade={['bottom']}
            />
            
            <BentoCard
              eyebrow="Expert Guidance"
              title="AI Deal Coach"
              description="Get instant expert guidance on challenging deals. Upload scenarios and receive personalized strategies to move deals forward."
              graphic={
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                  <Bot className="w-24 h-24 text-purple-600" />
                </div>
              }
              fade={['bottom']}
            />
            
            <BentoCard
              eyebrow="Analytics"
              title="Progress Tracking"
              description="Monitor your ramp progress with detailed analytics. Track applications, preapprovals, and closed loans over your 90-day journey."
              graphic={
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                  <TrendingUp className="w-24 h-24 text-orange-600" />
                </div>
              }
              fade={['bottom']}
            />
            
            <BentoCard
              eyebrow="Marketing Tools"
              title="Custom Templates"
              description="Access proven email and social media templates. Customize them with AI to match your tone and market focus."
              graphic={
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                  <Target className="w-24 h-24 text-red-600" />
                </div>
              }
              fade={['bottom']}
            />
            
            <BentoCard
              eyebrow="Proven System"
              title="Framework That Works"
              description="Based on successful loan officer strategies. Follow the same steps that have helped hundreds of LOs launch their careers."
              graphic={
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                  <Star className="w-24 h-24 text-yellow-600" />
                </div>
              }
              fade={['bottom']}
            />
          </div>
        </Container>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="bg-gray-50 py-24 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Subheading>How It Works</Subheading>
            <Lead className="mt-6">
              Simple steps to launch your mortgage career
            </Lead>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white mb-6">
                1
              </div>
              <h3 className="text-xl/7 font-semibold tracking-tight text-gray-950 mb-4">
                Complete Your Profile
              </h3>
              <p className="text-gray-600">
                Tell us about your experience, market focus, and goals. Our AI creates a personalized 90-day plan just for you.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white mb-6">
                2
              </div>
              <h3 className="text-xl/7 font-semibold tracking-tight text-gray-950 mb-4">
                Follow Daily Tasks
              </h3>
              <p className="text-gray-600">
                Complete 3-5 personalized tasks each day. Track your connections and watch your pipeline grow consistently.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white mb-6">
                3
              </div>
              <h3 className="text-xl/7 font-semibold tracking-tight text-gray-950 mb-4">
                Close Your First Deals
              </h3>
              <p className="text-gray-600">
                Use AI coaching and proven templates to convert leads into closed loans. Achieve your first 1-3 deals in 90 days.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Testimonials */}
      <Testimonials testimonials={testimonials} />
      
      {/* Footer with CTA */}
      <Footer onGetStarted={handleGetStarted} />
    </div>
  );
}