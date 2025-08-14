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
import { TagInput } from "@/components/ui/tag-input";
import { Loader2, User, Clock, Target, Users, MessageSquare, TrendingUp, X } from "lucide-react";

export default function Onboarding() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    markets: [] as string[], // Multiple cities as tags, max 4
    experienceLevel: "",
    focus: [] as string[], // Max 3 loan types
    borrowerTypes: [] as string[], // Include veterans, new construction, commercial as tags, max 4
    timeAvailableWeekday: "",
    outreachComfort: "",
    hasPastClientList: false,
    clientListLocation: "",
    crmName: "",
    socialChannelsUsed: [] as string[],
    socialLinks: {} as Record<string, string>,
    networkSources: [] as string[], // Include insurance agents, lawyers
    tonePreference: "",
    preferredChannels: [] as string[], // Tag-based, max 3
    goals: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const totalSteps = 7; // Reduced from 9 since we removed licensing step
  const progress = (step / totalSteps) * 100;

  const handleArrayChange = (field: keyof typeof formData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const handleTaggedArrayChange = (field: keyof typeof formData, values: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: values
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
      case 1: return formData.firstName && formData.lastName && formData.markets.length > 0;
      case 2: return formData.experienceLevel;
      case 3: return formData.focus.length > 0;
      case 4: return formData.borrowerTypes.length > 0;
      case 5: return formData.timeAvailableWeekday && formData.outreachComfort;
      case 6: return formData.tonePreference && formData.preferredChannels.length > 0;
      case 7: return formData.goals.trim();
      default: return false;
    }
  };

  const borrowerTypeOptions = [
    { value: "fthb", label: "First-Time Home Buyers (FTHB)" },
    { value: "move-up", label: "Move-Up Buyers" },
    { value: "cash-out", label: "Cash-Out Refinance" },
    { value: "investor", label: "Real Estate Investors" },
    { value: "veterans", label: "Veterans" },
    { value: "new-construction", label: "New Construction" },
    { value: "commercial", label: "Commercial" },
  ];

  const networkSourceOptions = [
    { value: "realtors", label: "Real Estate Agents" },
    { value: "past-clients", label: "Past Clients" },
    { value: "insurance-agents", label: "Insurance Agents" },
    { value: "lawyers", label: "Lawyers/Attorneys" },
    { value: "financial-advisors", label: "Financial Advisors" },
    { value: "builders", label: "Home Builders" },
    { value: "contractors", label: "Contractors" },
    { value: "cpas", label: "CPAs & Accountants" },
  ];

  const communicationChannelOptions = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone Calls" },
    { value: "text", label: "Text/SMS" },
    { value: "social", label: "Social Media" },
    { value: "video", label: "Video Calls" },
    { value: "inperson", label: "In-Person" },
  ];

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
              {/* Step 1: Personal Info with Multiple Cities */}
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
                      <Label htmlFor="firstName" className="font-medium">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="font-medium">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-medium block mb-2">Markets/Cities You Serve</Label>
                    <TagInput
                      value={formData.markets}
                      onChange={(values) => handleTaggedArrayChange("markets", values)}
                      placeholder="Enter city or market area (e.g., Los Angeles)"
                      maxTags={4}
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Add up to 4 cities or market areas where you primarily work
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Experience Level */}
              {step === 2 && (
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

              {/* Step 3: Focus Areas - Limited to 3 with tags */}
              {step === 3 && (
                <div>
                  <Label className="text-lg font-medium text-gray-900 mb-4 block">
                    What's your focus? (Select up to 3 loan types)
                  </Label>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { value: "purchase", label: "Purchase Loans", desc: "Home buying transactions" },
                        { value: "refi", label: "Refinancing", desc: "Rate & term, cash-out refis" },
                        { value: "heloc", label: "HELOC", desc: "Home equity lines of credit" },
                        { value: "investor-dscr", label: "Investor (DSCR)", desc: "Investment property loans" },
                        { value: "non-qm", label: "Non-QM", desc: "Non-qualified mortgages" },
                      ].map((focus) => (
                        <div
                          key={focus.value}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            formData.focus.includes(focus.value)
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-primary/50"
                          } ${formData.focus.length >= 3 && !formData.focus.includes(focus.value) ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={() => {
                            if (formData.focus.includes(focus.value)) {
                              handleArrayChange("focus", focus.value, false);
                            } else if (formData.focus.length < 3) {
                              handleArrayChange("focus", focus.value, true);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{focus.label}</div>
                              <div className="text-sm text-gray-600">{focus.desc}</div>
                            </div>
                            {formData.focus.includes(focus.value) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArrayChange("focus", focus.value, false);
                                }}
                                className="p-1 hover:bg-primary/20 rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.focus.map((focusType) => {
                        const option = [
                          { value: "purchase", label: "Purchase Loans" },
                          { value: "refi", label: "Refinancing" },
                          { value: "heloc", label: "HELOC" },
                          { value: "investor-dscr", label: "Investor (DSCR)" },
                          { value: "non-qm", label: "Non-QM" },
                        ].find(opt => opt.value === focusType);
                        return (
                          <div
                            key={focusType}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {option?.label}
                            <button
                              type="button"
                              onClick={() => handleArrayChange("focus", focusType, false)}
                              className="p-0.5 hover:bg-primary/20 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {formData.focus.length}/3 loan types selected
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Borrower Types with Tags */}
              {step === 4 && (
                <div>
                  <Label className="text-lg font-medium text-gray-900 mb-4 block">
                    What types of borrowers do you typically work with?
                  </Label>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {borrowerTypeOptions.map((type) => (
                        <div
                          key={type.value}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                            formData.borrowerTypes.includes(type.value)
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-primary/50"
                          } ${formData.borrowerTypes.length >= 4 && !formData.borrowerTypes.includes(type.value) ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={() => {
                            if (formData.borrowerTypes.includes(type.value)) {
                              handleArrayChange("borrowerTypes", type.value, false);
                            } else if (formData.borrowerTypes.length < 4) {
                              handleArrayChange("borrowerTypes", type.value, true);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{type.label}</span>
                            {formData.borrowerTypes.includes(type.value) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArrayChange("borrowerTypes", type.value, false);
                                }}
                                className="p-1 hover:bg-primary/20 rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.borrowerTypes.map((type) => {
                        const option = borrowerTypeOptions.find(opt => opt.value === type);
                        return (
                          <div
                            key={type}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {option?.label}
                            <button
                              type="button"
                              onClick={() => handleArrayChange("borrowerTypes", type, false)}
                              className="p-0.5 hover:bg-primary/20 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {formData.borrowerTypes.length}/4 types selected
                    </p>
                  </div>
                </div>
              )}

              {/* Step 5: Time & Comfort */}
              {step === 5 && (
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

                  <div className="space-y-6">
                    <div className="flex items-center mb-4">
                      <Users className="w-6 h-6 text-green-600 mr-3" />
                      <Label className="text-lg font-medium text-gray-900">
                        Tell us about your existing network assets
                      </Label>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-4 border-2 border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <Checkbox
                            id="hasPastClientList"
                            checked={formData.hasPastClientList}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasPastClientList: checked as boolean }))}
                          />
                          <div>
                            <Label htmlFor="hasPastClientList" className="font-medium">
                              Do you have a client list?
                            </Label>
                            <p className="text-sm text-gray-600">Database of previous customers for referrals and repeat business</p>
                          </div>
                        </div>
                        
                        {formData.hasPastClientList && (
                          <div className="space-y-4 ml-6 border-l-2 border-primary/20 pl-4">
                            <div>
                              <Label className="font-medium block mb-2">Where does your client list live?</Label>
                              <RadioGroup
                                value={formData.clientListLocation}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, clientListLocation: value }))}
                                className="grid grid-cols-2 gap-2"
                              >
                                {[
                                  { value: "crm", label: "CRM System" },
                                  { value: "excel", label: "Excel File" },
                                  { value: "email", label: "Email Contacts" },
                                  { value: "my-head", label: "In My Head" },
                                ].map((option) => (
                                  <Label
                                    key={option.value}
                                    htmlFor={`client-${option.value}`}
                                    className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                                  >
                                    <RadioGroupItem value={option.value} id={`client-${option.value}`} className="mr-2" />
                                    <span className="text-sm font-medium">{option.label}</span>
                                  </Label>
                                ))}
                              </RadioGroup>
                            </div>
                            
                            {formData.clientListLocation === "crm" && (
                              <div>
                                <Label htmlFor="crmName" className="font-medium">What CRM do you use?</Label>
                                <Input
                                  id="crmName"
                                  value={formData.crmName}
                                  onChange={(e) => setFormData(prev => ({ ...prev, crmName: e.target.value }))}
                                  placeholder="e.g., Salesforce, HubSpot, Top Producer"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="font-medium block mb-3">Do you source referrals from any of these?</Label>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {networkSourceOptions.map((source) => (
                            <div
                              key={source.value}
                              className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                formData.networkSources.includes(source.value)
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-primary/50"
                              }`}
                              onClick={() => {
                                if (formData.networkSources.includes(source.value)) {
                                  handleArrayChange("networkSources", source.value, false);
                                } else {
                                  handleArrayChange("networkSources", source.value, true);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{source.label}</span>
                                {formData.networkSources.includes(source.value) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleArrayChange("networkSources", source.value, false);
                                    }}
                                    className="p-1 hover:bg-primary/20 rounded-full"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {formData.networkSources.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {formData.networkSources.map((source) => {
                              const option = networkSourceOptions.find(opt => opt.value === source);
                              return (
                                <div
                                  key={source}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                >
                                  {option?.label}
                                  <button
                                    type="button"
                                    onClick={() => handleArrayChange("networkSources", source, false)}
                                    className="p-0.5 hover:bg-primary/20 rounded-full"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label className="font-medium block mb-3">What social channels do you use for business?</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

                      {formData.socialChannelsUsed.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <Label className="font-medium block mb-3">Share your social links (optional)</Label>
                          <div className="space-y-3">
                            {formData.socialChannelsUsed.map((channel) => (
                              <div key={channel}>
                                <Label htmlFor={`social-${channel}`} className="text-sm font-medium capitalize">
                                  {channel} Profile URL
                                </Label>
                                <Input
                                  id={`social-${channel}`}
                                  value={formData.socialLinks[channel] ?? ""}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    socialLinks: { ...prev.socialLinks, [channel]: e.target.value }
                                  }))}
                                  placeholder={`https://${channel}.com/yourprofile`}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            These links help us personalize your social media task recommendations
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Communication Preferences with Tags */}
              {step === 6 && (
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
                      What are your preferred communication channels? (Select up to 3)
                    </Label>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {communicationChannelOptions.map((channel) => (
                          <div
                            key={channel.value}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              formData.preferredChannels.includes(channel.value)
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-primary/50"
                            } ${formData.preferredChannels.length >= 3 && !formData.preferredChannels.includes(channel.value) ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => {
                              if (formData.preferredChannels.includes(channel.value)) {
                                handleArrayChange("preferredChannels", channel.value, false);
                              } else if (formData.preferredChannels.length < 3) {
                                handleArrayChange("preferredChannels", channel.value, true);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{channel.label}</span>
                              {formData.preferredChannels.includes(channel.value) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArrayChange("preferredChannels", channel.value, false);
                                  }}
                                  className="p-1 hover:bg-primary/20 rounded-full"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {formData.preferredChannels.map((channel) => {
                          const option = communicationChannelOptions.find(opt => opt.value === channel);
                          return (
                            <div
                              key={channel}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                            >
                              {option?.label}
                              <button
                                type="button"
                                onClick={() => handleArrayChange("preferredChannels", channel, false)}
                                className="p-0.5 hover:bg-primary/20 rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        {formData.preferredChannels.length}/3 channels selected
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Goals */}
              {step === 7 && (
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