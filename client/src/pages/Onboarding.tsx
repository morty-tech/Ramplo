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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, MapPin, Clock, Target, Users, MessageSquare, TrendingUp } from "lucide-react";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

export default function Onboarding() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    market: "",
    statesLicensed: [] as string[],
    nmlsId: "",
    experienceLevel: "",
    focus: [] as string[],
    borrowerTypes: [] as string[],
    timeAvailableWeekday: "",
    outreachComfort: "",
    hasRealtorRelationships: false,
    hasPastClientList: false,
    socialChannelsUsed: [] as string[],
    tonePreference: "",
    preferredChannels: [] as string[],
    goals: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const totalSteps = 9;
  const progress = (step / totalSteps) * 100;

  const handleArrayChange = (field: keyof typeof formData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
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
      case 1: return formData.fullName && formData.email && formData.market;
      case 2: return formData.statesLicensed.length > 0;
      case 3: return formData.experienceLevel;
      case 4: return formData.focus.length > 0;
      case 5: return formData.borrowerTypes.length > 0;
      case 6: return formData.timeAvailableWeekday && formData.outreachComfort;
      case 7: return true; // Network assets are optional
      case 8: return formData.tonePreference && formData.preferredChannels.length > 0;
      case 9: return formData.goals.trim();
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
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    <Label className="text-lg font-medium text-gray-900">
                      Let's start with your basic information
                    </Label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="font-medium">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-medium">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="market" className="font-medium">Market/City</Label>
                    <Input
                      id="market"
                      value={formData.market}
                      onChange={(e) => setFormData(prev => ({ ...prev, market: e.target.value }))}
                      placeholder="Los Angeles, CA"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      What city or market area do you primarily serve?
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Licensing */}
              {step === 2 && (
                <div>
                  <div className="flex items-center mb-4">
                    <MapPin className="w-6 h-6 text-green-600 mr-3" />
                    <Label className="text-lg font-medium text-gray-900">
                      What states are you licensed in?
                    </Label>
                  </div>
                  
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {US_STATES.map((state) => (
                      <Label
                        key={state}
                        className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <Checkbox
                          checked={formData.statesLicensed.includes(state)}
                          onCheckedChange={(checked) => handleArrayChange("statesLicensed", state, checked as boolean)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">{state}</span>
                      </Label>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Label htmlFor="nmlsId" className="font-medium">NMLS ID (Optional)</Label>
                    <Input
                      id="nmlsId"
                      value={formData.nmlsId}
                      onChange={(e) => setFormData(prev => ({ ...prev, nmlsId: e.target.value }))}
                      placeholder="123456"
                      className="w-48"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Experience Level */}
              {step === 3 && (
                <div>
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-6 h-6 text-purple-600 mr-3" />
                    <Label className="text-lg font-medium text-gray-900">
                      What's your experience level as a mortgage loan officer?
                    </Label>
                  </div>
                  <RadioGroup
                    value={formData.experienceLevel}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {[
                      { value: "new", label: "New to the industry", desc: "Just getting started" },
                      { value: "<1y", label: "Less than 1 year", desc: "Building foundational skills" },
                      { value: "1-3y", label: "1-3 years", desc: "Growing experience" },
                      { value: "3+", label: "3+ years", desc: "Seasoned professional" },
                    ].map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`exp-${option.value}`}
                        className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <RadioGroupItem value={option.value} id={`exp-${option.value}`} className="mr-3" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.desc}</div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Step 4: Focus Areas */}
              {step === 4 && (
                <div>
                  <div className="flex items-center mb-4">
                    <Target className="w-6 h-6 text-blue-600 mr-3" />
                    <Label className="text-lg font-medium text-gray-900">
                      What's your focus? (Select all that apply)
                    </Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: "purchase", label: "Purchase Loans", desc: "Home buying transactions" },
                      { value: "refi", label: "Refinancing", desc: "Rate & term, cash-out refis" },
                      { value: "heloc", label: "HELOC", desc: "Home equity lines of credit" },
                      { value: "investor-dscr", label: "Investor (DSCR)", desc: "Investment property loans" },
                      { value: "non-qm", label: "Non-QM", desc: "Non-qualified mortgages" },
                    ].map((focus) => (
                      <Label
                        key={focus.value}
                        className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <Checkbox
                          checked={formData.focus.includes(focus.value)}
                          onCheckedChange={(checked) => handleArrayChange("focus", focus.value, checked as boolean)}
                          className="mr-3 mt-0.5"
                        />
                        <div>
                          <div className="font-medium">{focus.label}</div>
                          <div className="text-sm text-gray-600">{focus.desc}</div>
                        </div>
                      </Label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Borrower Types */}
              {step === 5 && (
                <div>
                  <Label className="text-lg font-medium text-gray-900 mb-4 block">
                    What types of borrowers do you typically work with?
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: "fthb", label: "First-Time Home Buyers (FTHB)", desc: "New to homeownership" },
                      { value: "move-up", label: "Move-Up Buyers", desc: "Upgrading to larger homes" },
                      { value: "cash-out", label: "Cash-Out Refinance", desc: "Extracting equity" },
                      { value: "investor", label: "Real Estate Investors", desc: "Investment properties" },
                    ].map((type) => (
                      <Label
                        key={type.value}
                        className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <Checkbox
                          checked={formData.borrowerTypes.includes(type.value)}
                          onCheckedChange={(checked) => handleArrayChange("borrowerTypes", type.value, checked as boolean)}
                          className="mr-3 mt-0.5"
                        />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-600">{type.desc}</div>
                        </div>
                      </Label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Time & Comfort */}
              {step === 6 && (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center mb-4">
                      <Clock className="w-6 h-6 text-orange-600 mr-3" />
                      <Label className="text-lg font-medium text-gray-900">
                        How much time can you dedicate to prospecting per weekday?
                      </Label>
                    </div>
                    <RadioGroup
                      value={formData.timeAvailableWeekday}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, timeAvailableWeekday: value }))}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {[
                        { value: "30", label: "30 minutes", desc: "Quick daily activities" },
                        { value: "60", label: "60 minutes", desc: "Focused prospecting time" },
                        { value: "90+", label: "90+ minutes", desc: "Deep relationship building" },
                      ].map((time) => (
                        <Label
                          key={time.value}
                          htmlFor={`time-${time.value}`}
                          className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          <RadioGroupItem value={time.value} id={`time-${time.value}`} className="mr-3" />
                          <div>
                            <div className="font-medium">{time.label}</div>
                            <div className="text-sm text-gray-600">{time.desc}</div>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-900 mb-4 block">
                      How comfortable are you with outreach activities?
                    </Label>
                    <RadioGroup
                      value={formData.outreachComfort}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, outreachComfort: value }))}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {[
                        { value: "low", label: "Low", desc: "Prefer warm introductions" },
                        { value: "medium", label: "Medium", desc: "Willing to reach out with preparation" },
                        { value: "high", label: "High", desc: "Comfortable with cold outreach" },
                      ].map((comfort) => (
                        <Label
                          key={comfort.value}
                          htmlFor={`comfort-${comfort.value}`}
                          className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          <RadioGroupItem value={comfort.value} id={`comfort-${comfort.value}`} className="mr-3" />
                          <div>
                            <div className="font-medium">{comfort.label}</div>
                            <div className="text-sm text-gray-600">{comfort.desc}</div>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 7: Network Assets */}
              {step === 7 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <Users className="w-6 h-6 text-green-600 mr-3" />
                    <Label className="text-lg font-medium text-gray-900">
                      Tell us about your existing network assets
                    </Label>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg">
                      <Checkbox
                        id="hasRealtorRelationships"
                        checked={formData.hasRealtorRelationships}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasRealtorRelationships: checked as boolean }))}
                      />
                      <div>
                        <Label htmlFor="hasRealtorRelationships" className="font-medium">
                          I have established realtor relationships
                        </Label>
                        <p className="text-sm text-gray-600">Active referral partnerships with real estate agents</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg">
                      <Checkbox
                        id="hasPastClientList"
                        checked={formData.hasPastClientList}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasPastClientList: checked as boolean }))}
                      />
                      <div>
                        <Label htmlFor="hasPastClientList" className="font-medium">
                          I have a past client list
                        </Label>
                        <p className="text-sm text-gray-600">Database of previous customers for referrals and repeat business</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium block mb-3">What social channels do you use for business?</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: "linkedin", label: "LinkedIn" },
                        { value: "facebook", label: "Facebook" },
                        { value: "instagram", label: "Instagram" },
                        { value: "youtube", label: "YouTube" },
                        { value: "tiktok", label: "TikTok" },
                        { value: "twitter", label: "Twitter/X" },
                      ].map((channel) => (
                        <Label
                          key={channel.value}
                          className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          <Checkbox
                            checked={formData.socialChannelsUsed.includes(channel.value)}
                            onCheckedChange={(checked) => handleArrayChange("socialChannelsUsed", channel.value, checked as boolean)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium">{channel.label}</span>
                        </Label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 8: Communication Preferences */}
              {step === 8 && (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center mb-4">
                      <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
                      <Label className="text-lg font-medium text-gray-900">
                        What's your preferred communication tone?
                      </Label>
                    </div>
                    <RadioGroup
                      value={formData.tonePreference}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tonePreference: value }))}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {[
                        { value: "professional", label: "Professional", desc: "Formal and business-focused" },
                        { value: "friendly", label: "Friendly", desc: "Warm and approachable" },
                        { value: "direct", label: "Direct", desc: "Straight to the point" },
                      ].map((tone) => (
                        <Label
                          key={tone.value}
                          htmlFor={`tone-${tone.value}`}
                          className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          <RadioGroupItem value={tone.value} id={`tone-${tone.value}`} className="mr-3" />
                          <div>
                            <div className="font-medium">{tone.label}</div>
                            <div className="text-sm text-gray-600">{tone.desc}</div>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-900 mb-4 block">
                      What are your preferred communication channels?
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { value: "email", label: "Email", desc: "Professional and trackable" },
                        { value: "phone", label: "Phone Calls", desc: "Direct and personal" },
                        { value: "text", label: "Text/SMS", desc: "Quick and convenient" },
                        { value: "social", label: "Social Media", desc: "LinkedIn, Facebook messaging" },
                        { value: "video", label: "Video Calls", desc: "Personal yet convenient" },
                        { value: "inperson", label: "In-Person", desc: "Face-to-face meetings" },
                      ].map((channel) => (
                        <Label
                          key={channel.value}
                          className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          <Checkbox
                            checked={formData.preferredChannels.includes(channel.value)}
                            onCheckedChange={(checked) => handleArrayChange("preferredChannels", channel.value, checked as boolean)}
                            className="mr-3 mt-0.5"
                          />
                          <div>
                            <div className="font-medium">{channel.label}</div>
                            <div className="text-sm text-gray-600">{channel.desc}</div>
                          </div>
                        </Label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 9: Goals */}
              {step === 9 && (
                <div>
                  <Label htmlFor="goals" className="text-lg font-medium text-gray-900 mb-4 block">
                    What are your main goals for the next 90 days?
                  </Label>
                  <Textarea
                    id="goals"
                    value={formData.goals}
                    onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                    placeholder="e.g., Close my first 3 loans, build relationships with 20 realtors, establish a consistent social media presence..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Be specific about what success looks like for you. This helps us tailor your daily tasks and priorities.
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Previous
                  </Button>
                )}
                {step < totalSteps ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="ml-auto"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!canProceed() || isLoading}
                    className="ml-auto"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Complete Setup
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}