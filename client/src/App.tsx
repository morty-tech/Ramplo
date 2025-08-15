import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Roadmap from "@/pages/Roadmap";
import Outreach from "@/pages/Outreach";
import DealCoach from "@/pages/DealCoach";
import Billing from "@/pages/Billing";
import TestRoadmap from "@/pages/TestRoadmap";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/auth/verify" component={Login} />
        <Route path="/login" component={Login} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/" component={!profile?.onboardingCompleted ? Onboarding : Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/roadmap" component={Roadmap} />
        <Route path="/outreach" component={Outreach} />
        <Route path="/deal-coach" component={DealCoach} />
        <Route path="/billing" component={Billing} />
        <Route path="/test-roadmap" component={TestRoadmap} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
