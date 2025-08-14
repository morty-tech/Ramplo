import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Crown, Check } from "lucide-react";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
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
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full bg-orange-600 hover:bg-orange-700"
      >
        {isLoading ? "Processing..." : "Subscribe Now"}
      </Button>
    </form>
  );
}

export default function PaywallOverlay() {
  const [isOpen, setIsOpen] = useState(false);
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
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPayment(true);
      }
    } catch (error) {
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
    <>
      {/* Trigger - this could be shown based on usage limits */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="h-8 w-8 text-orange-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Unlock Your Full Potential
            </h3>
            <p className="text-gray-600 mb-6">
              Get unlimited access to your personalized ramp plan and all features.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-3xl font-bold text-gray-900">$49</div>
              <div className="text-sm text-gray-600">per month</div>
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
              <Elements 
                stripe={stripePromise} 
                options={{ clientSecret }}
              >
                <CheckoutForm onSuccess={() => setIsOpen(false)} />
              </Elements>
            ) : (
              <div className="space-y-3">
                <Button 
                  onClick={handleSubscribe}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Subscribe Now
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-gray-600"
                >
                  Maybe Later
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
