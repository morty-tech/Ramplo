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
import { Loader2, Globe, Users, Target, TrendingUp, Building, Network } from "lucide-react";

export default function Onboarding() {
  const [formData, setFormData] = useState({
    experienceLevel: "",
    markets: [] as string[],
    primaryMarket: "",
    networkSize: "",
    networkGrowthStrategy: "",
    connectionTypes: [] as string[],
    preferredChannels: [] as string[],
    hasOnlinePresence: false,
    socialMediaLinks: {} as Record<string, string>,
    loansClosedCount: "",
    goals: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  const handleArrayChange = (field: keyof typeof formData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const handleSocialMediaChange = (platform: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      socialMediaLinks: {
        ...prev.socialMediaLinks,
        [platform]: url
      }
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
      case 1: return formData.experienceLevel && formData.loansClosedCount;
      case 2: return formData.markets.length > 0;
      case 3: return formData.primaryMarket;
      case 4: return formData.networkSize;
      case 5: return formData.networkGrowthStrategy && formData.connectionTypes.length > 0;
      case 6: return formData.preferredChannels.length > 0;
      case 7: return true; // Social media step is optional
      case 8: return formData.goals.trim();
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
              {/* Step 1: Experience & Loan History */}
              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                      <Label className="text-lg font-medium text-gray-900">
                        What's your experience level as a mortgage loan officer?
                      </Label>
                    </div>
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

                  <div>
                    <div className="flex items-center mb-4">
                      <Target className="w-6 h-6 text-green-600 mr-3" />
                      <Label className="text-lg font-medium text-gray-900">
                        How many loans have you closed?
                      </Label>
                    </div>
                    <RadioGroup
                      value={formData.loansClosedCount}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, loansClosedCount: value }))}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {[
                        { value: "0", label: "0 loans", desc: "Just starting out" },
                        { value: "1-10", label: "1-10 loans", desc: "Building experience" },
                        { value: "11-50", label: "11-50 loans", desc: "Growing my book" },
                        { value: "51-100", label: "51-100 loans", desc: "Established track record" },
                        { value: "100+", label: "100+ loans", desc: "Seasoned professional" },
                      ].map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={`loans-${option.value}`}
                          className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          <RadioGroupItem value={option.value} id={`loans-${option.value}`} className="mr-3" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.desc}</div>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 2: Markets Served */}
              {step === 2 && (
                <div>
                  <div className="flex items-center mb-4">
                    <Building className="w-6 h-6 text-purple-600 mr-3" />
                    <Label className="text-lg font-medium text-gray-900">
                      What markets do you serve? (Select all that apply)
                    </Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: "first-time-buyers", label: "First-Time Homebuyers", desc: "New to homeownership" },
                      { value: "refinance", label: "Refinancing", desc: "Rate & term, cash-out" },
                      { value: "luxury", label: "Luxury/Jumbo", desc: "High-end properties" },
                      { value: "investment", label: "Investment Properties", desc: "Rental & flip properties" },
                      { value: "construction", label: "Construction Loans", desc: "New builds & renovations" },
                      { value: "commercial", label: "Commercial", desc: "Business properties" },
                      { value: "va-loans", label: "VA Loans", desc: "Veterans & military" },
                      { value: "fha-loans", label: "FHA Loans", desc: "Government-backed loans" },
                    ].map((market) => (
                      <Label
                        key={market.value}
                        className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <Checkbox
                          checked={formData.markets.includes(market.value)}
                          onCheckedChange={(checked) => handleArrayChange("markets", market.value, checked as boolean)}
                          className="mr-3 mt-0.5"
                        />
                        <div>
                          <div className="font-medium">{market.label}</div>
                          <div className="text-sm text-gray-600">{market.desc}</div>
                        </div>
                      </Label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Primary Market Focus */}
              {step === 3 && (
                <div>
                  <div className="flex items-center mb-4">
                    <Target className="w-6 h-6 text-blue-600 mr-3" />
                    <Label className="text-lg font-medium text-gray-900">
                      What's your primary market focus?
                    </Label>
                  </div>
                  <Select
                    value={formData.primaryMarket}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, primaryMarket: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose your main market focus" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.markets.map((market) => {
                        const marketLabels: Record<string, string> = {
                          "first-time-buyers": "First-Time Homebuyers",
                          "refinance": "Refinancing", 
                          "luxury": "Luxury/Jumbo",
                          "investment": "Investment Properties",
                          "construction": "Construction Loans",
                          "commercial": "Commercial",
                          "va-loans": "VA Loans",
                          "fha-loans": "FHA Loans"
                        };
                        return (
                          <SelectItem key={market} value={market}>
                            {marketLabels[market]}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-2">
                    This will help us prioritize tasks and templates for your main focus area.
                  </p>
                </div>
              )}

              {/* Step 4: Network Size */}
              {step === 4 && (
                <div>
                  <div className="flex items-center mb-4">
                    <Users className="w-6 h-6 text-green-600 mr-3" />
                    <Label className="text-lg font-medium text-gray-900">
                      How would you describe your current network size?
                    </Label>
                  </div>
                  <RadioGroup
                    value={formData.networkSize}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, networkSize: value }))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {[
                      { value: "small", label: "Small Network", desc: "0-50 professional contacts" },
                      { value: "medium", label: "Medium Network", desc: "50-200 contacts" },
                      { value: "large", label: "Large Network", desc: "200+ contacts" },
                      { value: "starting", label: "Just Starting", desc: "Building from scratch" },
                    ].map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`network-${option.value}`}
                        className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <RadioGroupItem value={option.value} id={`network-${option.value}`} className="mr-3" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.desc}</div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Step 5: Network Growth Strategy */}
              {step === 5 && (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center mb-4">
                      <Network className="w-6 h-6 text-orange-600 mr-3" />
                      <Label className="text-lg font-medium text-gray-900">
                        How do you plan to grow your network?
                      </Label>
                    </div>
                    <RadioGroup
                      value={formData.networkGrowthStrategy}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, networkGrowthStrategy: value }))}
                      className="grid grid-cols-1 gap-3"
                    >
                      {[
                        { value: "social-media", label: "Social Media & Online Presence", desc: "LinkedIn, Facebook, Instagram outreach" },
                        { value: "referrals", label: "Referral Partnerships", desc: "Build relationships with realtors, builders, advisors" },
                        { value: "cold-outreach", label: "Cold Outreach", desc: "Direct calls, emails, door-to-door" },
                        { value: "events", label: "Networking Events", desc: "Industry events, local meetups, seminars" },
                        { value: "partnerships", label: "Strategic Partnerships", desc: "Real estate teams, financial planners, attorneys" },
                      ].map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={`strategy-${option.value}`}
                          className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          <RadioGroupItem value={option.value} id={`strategy-${option.value}`} className="mr-3 mt-0.5" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.desc}</div>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-900 mb-4 block">
                      What types of connections are you targeting?
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { value: "realtors", label: "Real Estate Agents" },
                        { value: "builders", label: "Home Builders" },
                        { value: "financial-advisors", label: "Financial Advisors" },
                        { value: "past-clients", label: "Past Clients" },
                        { value: "attorneys", label: "Real Estate Attorneys" },
                        { value: "contractors", label: "Contractors" },
                        { value: "insurance-agents", label: "Insurance Agents" },
                        { value: "cpas", label: "CPAs & Accountants" },
                      ].map((connection) => (
                        <Label
                          key={connection.value}
                          className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          <Checkbox
                            checked={formData.connectionTypes.includes(connection.value)}
                            onCheckedChange={(checked) => handleArrayChange("connectionTypes", connection.value, checked as boolean)}
                            className="mr-3"
                          />
                          <div className="font-medium">{connection.label}</div>
                        </Label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Communication Preferences */}
              {step === 6 && (
                <div>
                  <Label className="text-lg font-medium text-gray-900 mb-4 block">
                    What are your preferred communication channels?
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: "email", label: "Email", desc: "Professional and trackable" },
                      { value: "phone", label: "Phone Calls", desc: "Direct and personal" },
                      { value: "social", label: "Social Media", desc: "LinkedIn, Facebook messaging" },
                      { value: "inperson", label: "In-Person Meetings", desc: "Face-to-face networking" },
                      { value: "text", label: "Text/SMS", desc: "Quick and convenient" },
                      { value: "video", label: "Video Calls", desc: "Personal yet convenient" },
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
              )}

              {/* Step 7: Social Media & Online Presence */}
              {step === 7 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <Globe className="w-6 h-6 text-blue-600 mr-3" />
                    <Label className="text-lg font-medium text-gray-900">
                      Do you have an online presence or social media for business?
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasOnlinePresence"
                      checked={formData.hasOnlinePresence}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasOnlinePresence: checked as boolean }))}
                    />
                    <Label htmlFor="hasOnlinePresence">
                      Yes, I have business social media accounts or website
                    </Label>
                  </div>

                  {formData.hasOnlinePresence && (
                    <div className="space-y-4 border-l-4 border-blue-200 pl-6">
                      <p className="text-sm text-gray-600">
                        Share your social media links so we can help optimize your online presence:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { platform: "linkedin", label: "LinkedIn Profile" },
                          { platform: "facebook", label: "Facebook Business Page" },
                          { platform: "instagram", label: "Instagram Business" },
                          { platform: "website", label: "Personal Website" },
                          { platform: "youtube", label: "YouTube Channel" },
                          { platform: "tiktok", label: "TikTok Business" },
                        ].map(({ platform, label }) => (
                          <div key={platform} className="space-y-1">
                            <Label htmlFor={platform} className="text-sm font-medium">
                              {label}
                            </Label>
                            <Input
                              id={platform}
                              type="url"
                              placeholder={`https://${platform}.com/...`}
                              value={formData.socialMediaLinks[platform] || ''}
                              onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 8: Goals */}
              {step === 8 && (
                <div>
                  <Label htmlFor="goals" className="text-lg font-medium text-gray-900 mb-4 block">
                    What are your main goals for the next 90 days?
                  </Label>
                  <Textarea
                    id="goals"
                    value={formData.goals}
                    onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                    placeholder="e.g., Close my first 3 loans, build a network of 50 realtors, establish online presence..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Be specific about what success looks like for you. This helps us tailor your daily tasks.
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