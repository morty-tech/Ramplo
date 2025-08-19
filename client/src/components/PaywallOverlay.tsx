import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Crown, Check } from "lucide-react";
import rampLoWhiteLogo from "@assets/ramplo-log-white_1755552246908.png";
import { config } from "@/lib/config";

const stripePromise = config.stripe.publicKey 
  ? loadStripe(config.stripe.publicKey)
  : null;

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Welcome to Ramplo Pro!",
      });
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          layout: "tabs",
          fields: {
            billingDetails: {
              name: "auto",
              email: "auto"
            }
          }
        }}
      />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full bg-aura-600 hover:bg-aura-400"
      >
        {isLoading ? "Processing..." : "Subscribe for $49/month"}
      </Button>
    </form>
  );
}

export default function PaywallOverlay() {
  const [clientSecret, setClientSecret] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!stripePromise) {
      toast({
        title: "Payment Not Available",
        description: "Payment processing is not configured.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/create-subscription");
      const data = await response.json();
      console.log("Paywall subscription response:", data);
      
      if (data.clientSecret) {
        console.log("Paywall: Setting client secret and showing payment");
        setClientSecret(data.clientSecret);
        setShowPayment(true);
      } else if (data.subscriptionId && !data.clientSecret) {
        console.log("Paywall: No client secret in response - subscription already active");
        toast({
          title: "Subscription Active",
          description: "Your subscription is already active. Access granted!",
        });
        // Refresh user data to update UI
        window.location.reload();
      } else {
        console.log("Paywall: Unexpected response format:", data);
        toast({
          title: "Error",
          description: "Unexpected response from subscription service",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Paywall subscription error:", error);
      toast({
        title: "Error",
        description: "Failed to start subscription process",
        variant: "destructive",
      });
    }
  };

  if (!stripePromise) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Full screen paywall overlay */}
      <div className="min-h-screen bg-gradient-to-br from-aura-600 to-eclipse-800 relative isolate">
        {/* Gradient decorations */}
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
        
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 relative z-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <div className="flex items-center justify-center mb-10">
              <img 
                src={rampLoWhiteLogo} 
                alt="RampLO" 
                className="h-8 w-auto"
              />
            </div>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white rounded-lg p-8 shadow-xl text-center">
              <div className="w-16 h-16 bg-aura-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Unlock Your Full Potential
              </h3>
              <p className="text-gray-600 mb-6">
                Complete your subscription to access your personalized ramp plan and all features.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-3xl font-bold text-gray-900">$49</div>
                <div className="text-sm text-gray-600">per month for 3 months</div>
              </div>

              <div className="space-y-3 mb-6 text-left">
                {[
                  "Personalized 90-day roadmap",
                  "Daily task tracking & streaks", 
                  "AI-powered deal coaching",
                  "Marketing template library"
                ].map((feature) => (
                  <div key={feature} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              {showPayment && clientSecret ? (
                <div className="space-y-4">
                  <Elements 
                    stripe={stripePromise} 
                    options={{ clientSecret }}
                  >
                    <CheckoutForm onSuccess={() => window.location.reload()} />
                  </Elements>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="font-medium text-blue-800 mb-1">Test Mode</p>
                    <p className="text-blue-700">Use test card: 4242 4242 4242 4242</p>
                    <p className="text-blue-700">Any future date, any CVC</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button 
                    onClick={handleSubscribe}
                    className="w-full bg-aura-600 hover:bg-aura-400"
                  >
                    Subscribe Now
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/billing'}
                    className="w-full"
                  >
                    Manage Billing
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
