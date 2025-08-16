import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
      <div className="min-h-screen bg-gradient-to-br from-forest-800 to-tealwave-800">
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
            <div className="w-16 h-16 bg-limeglow-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-forest-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Check your email</h2>
            <p className="text-gray-300 mb-8">
              We've sent a secure login link to <strong className="text-white">{email}</strong>
            </p>
            <button
              onClick={() => setLinkSent(false)}
              className="flex w-full justify-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Send another link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-800 to-tealwave-800">
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex items-center justify-center">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center mr-3">
              <span className="text-forest-800 font-bold text-xl">R</span>
            </div>
            <span className="text-white font-bold text-2xl">RampLO</span>
          </div>
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">Sign in to your account</h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="Enter your email address"
                  className="block w-full rounded-md bg-white/20 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/30 placeholder:text-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-limeglow-400 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="flex w-full justify-center rounded-md bg-forest-400 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-limeglow-600 hover:text-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-limeglow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Sign in with Magic Link"
                )}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-400">
            New to RampLO?{' '}
            <a href="/" className="font-semibold text-limeglow-400 hover:text-limeglow-300 ml-2">
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
