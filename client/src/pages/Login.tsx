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
    <div className="min-h-screen bg-gradient-to-br from-forest-800 to-tealwave-800 relative isolate">
      {/* Top lime glow gradient burst */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#84cc16] to-[#22c55e] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>
      
      {/* Bottom lime glow gradient burst */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#65a30d] to-[#16a34a] opacity-25 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
        />
      </div>
      
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 relative z-10">
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

          <p className="mt-6 text-center text-sm/6 text-gray-300">
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
