import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Shield, 
  Check, 
  Infinity, 
  Database,
  CreditCard,
  Download,
  AlertCircle,
  Mail
} from "lucide-react";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

function SubscriptionForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/billing",
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
        description: "Welcome to Ramplo Professional!",
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

export default function Billing() {
  const { user, isMortyUser } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  const createSubscriptionMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/create-subscription"),
    onSuccess: async (response) => {
      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPaymentModal(true);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start subscription process",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = () => {
    if (!stripePromise) {
      toast({
        title: "Payment Not Available",
        description: "Payment processing is not configured.",
        variant: "destructive",
      });
      return;
    }
    createSubscriptionMutation.mutate();
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Cancel Subscription",
      description: "Cancellation feature coming soon.",
    });
  };

  const mockBillingHistory = [
    {
      date: "March 15, 2024",
      description: "March 2024 - Professional Plan",
      amount: "$49.00",
      status: "Paid"
    },
    {
      date: "February 15, 2024", 
      description: "February 2024 - Professional Plan",
      amount: "$49.00",
      status: "Paid"
    },
    {
      date: "January 15, 2024",
      description: "January 2024 - Professional Plan", 
      amount: "$49.00",
      status: "Paid"
    }
  ];

  return (
    <div className="p-6 mx-4 md:mx-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your Ramplo subscription and billing information.</p>
      </div>

      {/* Morty User Section */}
      {isMortyUser && (
        <>
          <Card className="mb-6">
            <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Powered by Morty</h2>
                  <p className="text-gray-600">Your subscription is included at no cost</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">FREE</div>
                <div className="text-sm text-gray-600">Morty Platform Benefit</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Full Access</div>
                  <div className="text-xs text-gray-600">All features included</div>
                </div>
                <div className="text-center">
                  <Infinity className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">No Limits</div>
                  <div className="text-xs text-gray-600">Unlimited usage</div>
                </div>
                <div className="text-center">
                  <Database className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">CMS Integration</div>
                  <div className="text-xs text-gray-600">Coming soon</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </>
      )}

      {/* Non-Morty User Section */}
      {!isMortyUser && (
        <>
          {/* Current Plan */}
          {user?.stripeSubscriptionId ? (
            <>
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5">
                <Check className="w-5 h-5" />
                Current Plan
              </h3>
              <Card className="mb-6">
                <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      $49<span className="text-lg font-normal text-gray-600">/month</span>
                    </div>
                    <div className="text-gray-600 mb-4">Professional Plan</div>
                    
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-3" />
                        Personalized 90-day roadmap
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-3" />
                        Daily task tracking
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-3" />
                        AI-powered deal coaching
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-3" />
                        Marketing template library
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-3" />
                        Progress analytics
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">Next Billing Date</div>
                      <div className="text-lg font-bold text-gray-900">
                        {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button className="w-full bg-primary hover:bg-blue-700">
                        Update Payment Method
                      </Button>
                      <Button variant="outline" className="w-full">
                        Download Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </>
          ) : (
            /* Subscription Signup */
            <>
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5" />
                Upgrade to Professional
              </h3>
              <Card className="mb-6">
                <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="text-3xl font-bold text-gray-900">$49</div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>
                    
                    <ul className="space-y-3">
                      <li className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-3" />
                        Personalized 90-day roadmap
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-3" />
                        Daily task tracking & streaks
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-3" />
                        AI-powered deal coaching
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-3" />
                        Marketing template library
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex items-center">
                    <Button 
                      onClick={handleSubscribe}
                      disabled={createSubscriptionMutation.isPending}
                      className="w-full bg-orange-600 hover:bg-orange-700 py-3"
                    >
                      {createSubscriptionMutation.isPending ? "Loading..." : "Subscribe Now"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </>
          )}

          {/* Payment Method */}
          {user?.stripeSubscriptionId && (
            <>
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h3>
              <Card className="mb-6">
                <CardContent className="pt-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-6 bg-blue-600 rounded mr-4 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VISA</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</div>
                      <div className="text-xs text-gray-600">Expires 12/25</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </CardContent>
            </Card>
            </>
          )}

          {/* Billing History */}
          {user?.stripeSubscriptionId && (
            <>
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5">
                <Download className="w-5 h-5" />
                Billing History
              </h3>
              <Card className="mb-6">
                <CardContent className="pt-6">
                <div className="space-y-4">
                  {mockBillingHistory.map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.description}</div>
                        <div className="text-xs text-gray-600">Paid on {invoice.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{invoice.amount}</div>
                        <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-blue-700">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </>
          )}

          {/* Cancel Subscription */}
          {user?.stripeSubscriptionId && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-800 mb-2">Cancel Subscription</h3>
                    <p className="text-red-700 text-sm mb-4">
                      Canceling will end your access to all Ramplo features at the end of your current billing period.
                    </p>
                    <Button 
                      onClick={handleCancelSubscription}
                      variant="destructive"
                      size="sm"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Support Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Need Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-3">
            For billing questions, subscription changes, or account support, please contact our team:
          </p>
          <div className="flex items-center">
            <Mail className="w-4 h-4 text-blue-600 mr-2" />
            <a 
              href="mailto:memberships@morty.com" 
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              memberships@morty.com
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
          </DialogHeader>
          
          {stripePromise && clientSecret && (
            <Elements 
              stripe={stripePromise} 
              options={{ clientSecret }}
            >
              <SubscriptionForm 
                clientSecret={clientSecret}
                onSuccess={() => setShowPaymentModal(false)}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
