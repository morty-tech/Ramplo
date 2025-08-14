import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

export default function Onboarding() {
  const [formData, setFormData] = useState({
    experienceLevel: "",
    market: "",
    networkSize: "",
    preferredChannels: [] as string[],
    goals: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredChannels: checked 
        ? [...prev.preferredChannels, channel]
        : prev.preferredChannels.filter(c => c !== channel)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/onboarding", formData);
      toast({
        title: "Welcome to RampLO!",
        description: "Your personalized ramp plan is being created.",
      });
      // Redirect will happen automatically via App.tsx
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.experienceLevel;
      case 2: return formData.market;
      case 3: return formData.networkSize;
      case 4: return formData.preferredChannels.length > 0;
      case 5: return formData.goals.trim();
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to RampLO!</h1>
              <p className="text-gray-600">Help us personalize your 90-day ramp plan with a few quick questions.</p>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 1 && (
                <div>
                  <Label className="text-lg font-medium text-gray-900 mb-4 block">
                    What's your experience level as a mortgage loan officer?
                  </Label>
                  <RadioGroup
                    value={formData.experienceLevel}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {[
                      { value: "beginner", label: "Beginner", desc: "0-6 months" },
                      { value: "intermediate", label: "Intermediate", desc: "6-24 months" },
                      { value: "experienced", label: "Experienced", desc: "2+ years" },
                    ].map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="mr-3" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.desc}</div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step === 2 && (
                <div>
                  <Label htmlFor="market" className="text-lg font-medium text-gray-900 mb-4 block">
                    What market do you primarily serve?
                  </Label>
                  <RadioGroup
                    value={formData.market}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, market: value }))}
                    className="space-y-3"
                  >
                    {[
                      { value: "first-time-buyers", label: "First-Time Home Buyers" },
                      { value: "refinance", label: "Refinance" },
                      { value: "luxury", label: "Luxury/Jumbo Loans" },
                      { value: "investment", label: "Investment Properties" },
                      { value: "mixed", label: "Mixed Market" },
                    ].map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="mr-3" />
                        {option.label}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step === 3 && (
                <div>
                  <Label className="text-lg font-medium text-gray-900 mb-4 block">
                    How large is your current professional network?
                  </Label>
                  <RadioGroup
                    value={formData.networkSize}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, networkSize: value }))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {[
                      { value: "small", label: "Small", desc: "0-50 contacts" },
                      { value: "medium", label: "Medium", desc: "50-200 contacts" },
                      { value: "large", label: "Large", desc: "200+ contacts" },
                      { value: "starting", label: "Just Starting", desc: "Building from scratch" },
                    ].map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="mr-3" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.desc}</div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step === 4 && (
                <div>
                  <Label className="text-lg font-medium text-gray-900 mb-4 block">
                    What outreach channels do you prefer? (Select all that apply)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: "email", label: "Email", icon: "📧" },
                      { value: "phone", label: "Phone", icon: "📞" },
                      { value: "social", label: "Social Media", icon: "📱" },
                      { value: "inperson", label: "In-Person", icon: "🤝" },
                    ].map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors text-center"
                      >
                        <Checkbox
                          id={option.value}
                          checked={formData.preferredChannels.includes(option.value)}
                          onCheckedChange={(checked) => handleChannelChange(option.value, !!checked)}
                          className="mb-2"
                        />
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="font-medium">{option.label}</div>
                      </Label>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div>
                  <Label htmlFor="goals" className="text-lg font-medium text-gray-900 mb-4 block">
                    What's your primary goal for the next 90 days?
                  </Label>
                  <Textarea
                    id="goals"
                    value={formData.goals}
                    onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                    placeholder="Describe your goals, target number of deals, specific challenges you want to overcome..."
                    rows={6}
                    className="resize-none"
                  />
                </div>
              )}

              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Previous
                  </Button>
                )}
                
                <div className="ml-auto">
                  {step < totalSteps ? (
                    <Button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      disabled={!canProceed()}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!canProceed() || isLoading}
                      className="bg-primary hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Plan...
                        </>
                      ) : (
                        "Create My Ramp Plan"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
