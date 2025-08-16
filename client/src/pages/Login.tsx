import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import EmailConfirmation from "@/components/EmailConfirmation";
import TransparentFooter from "@/components/TransparentFooter";

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
    return <EmailConfirmation email={email} onSendAnother={() => setLinkSent(false)} />;
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
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <h2 className="text-center text-2xl/9 font-bold tracking-tight text-gray-900 mb-8">Sign in to your account</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-700">
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
                    className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-500 focus:border-forest-600 focus:ring-1 focus:ring-forest-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="flex w-full justify-center rounded-md bg-limeglow-400 px-3 py-1.5 text-sm/6 font-semibold text-forest-800 hover:bg-limeglow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-limeglow-400 disabled:bg-limeglow-600 disabled:text-forest-800 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    "Sign in with Magic Link"
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-sm/6 text-gray-400">
            New to RampLO?{' '}
            <a href="/" className="font-semibold text-limeglow-400 hover:text-limeglow-300 ml-2">
              Learn more
            </a>
          </p>
        </div>
      </div>
      
      <TransparentFooter />
    </div>
  );
}
