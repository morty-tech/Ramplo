import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const { toast } = useToast();
  const [location] = useLocation();

  // Handle magic link verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token && location.includes('/auth/verify')) {
      // The server will handle the redirect
      window.location.href = `/api/auth/verify?token=${token}`;
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/auth/send-magic-link", { email });
      setLinkSent(true);
      toast({
        title: "Magic link sent!",
        description: "Check your email for the login link.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send magic link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (linkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-forest-800 to-tealwave-800 px-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-limeglow-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-forest-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a secure login link to <strong>{email}</strong>
            </p>
            <Button 
              variant="outline" 
              onClick={() => setLinkSent(false)}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Send another link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-forest-800 to-tealwave-800 px-4">
      <div
        className="absolute inset-0 bg-gradient-to-r from-forest-800/90 to-tealwave-800/90 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}
      />
      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">RampLO</CardTitle>
          <p className="text-gray-600">AI-Powered 90-Day Training for Mortgage Loan Officers</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="mt-2 border-gray-300 focus:border-forest-600 focus:ring-forest-600"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || !email}
              className="w-full bg-forest-800 hover:bg-forest-600 text-white font-semibold py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Sign In with Magic Link"
              )}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-600">
            We'll send you a secure link to access your dashboard.
          </p>
          
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-sm text-gray-500 hover:text-forest-600 transition-colors duration-200"
            >
              ← Back to homepage
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
