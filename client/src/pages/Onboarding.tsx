import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  const [, setLocation] = useLocation();
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
    clientListOther: "",
    socialChannelsUsed: [] as string[],
    socialLinks: {} as Record<string, string>,
    networkSources: [] as string[], // Include insurance agents, lawyers
    tonePreference: "",
    preferredChannels: [] as string[], // Tag-based, max 3
    goals: "",
    otherFocus: "",
    otherBorrowerType: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showOnboardingComplete, setShowOnboardingComplete] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const { toast } = useToast();

  const loadingMessages = [
    "Setting up your account...",
    "Analyzing your experience...",
    "Building your personalized ramp plan...",
    "Preparing your templates & resources..."
  ];

  const totalSteps = 7; // Reduced from 9 since we removed licensing step
  const progress = (step / totalSteps) * 100;

  const getHeaderText = () => {
    const firstName = formData.firstName || "there";
    switch (step) {
      case 1: return "First, let's personalize your 90-day ramp plan.";
      case 2: return `${firstName}, we're excited to start ramping!`;
      case 3: return `Great! Now let's focus on your loan expertise, ${firstName}.`;
      case 4: return "Perfect! Let's talk about your target borrowers.";
      case 5: return `Now, let's plan your daily schedule, ${firstName}.`;
      case 6: return "Almost there! Let's set your communication style.";
      case 7: return `Last step, ${firstName}! What are your 90-day goals?`;
      default: return "Let's continue building your ramp plan.";
    }
  };

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
    
    // Only allow submission on the final step
    if (step !== totalSteps) {
      return;
    }
    
    setIsLoading(true);
    setShowOnboardingComplete(true);

    // Cycle through loading messages
    const stepDuration = 5000; // 5 seconds per step
    const messageInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(messageInterval);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    try {
      await apiRequest("POST", "/api/onboarding", formData);
      
      // Invalidate user data to refresh profile
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Wait for loading animation to complete
      setTimeout(() => {
        clearInterval(messageInterval);
        setLocation("/dashboard");
      }, stepDuration * loadingMessages.length + 500);
      
    } catch (error) {
      clearInterval(messageInterval);
      setShowOnboardingComplete(false);
      setLoadingStep(0);
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
    { value: "not-sure", label: "Not Sure" },
    { value: "other", label: "Other" },
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

  // Loading screen component
  if (showOnboardingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hang tight — we're building your ramp to success!</h2>
            <div className="space-y-3">
              {loadingMessages.map((message, index) => (
                <div key={index} className={`flex items-center justify-center space-x-2 text-sm ${
                  index < loadingStep ? 'text-green-600' : 
                  index === loadingStep ? 'text-primary' : 'text-gray-400'
                }`}>
                  {index < loadingStep && (
                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                  {index === loadingStep && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {index > loadingStep && (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span>{message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-800 to-tealwave-800">
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
          <div className="flex items-center justify-center mb-10">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center mr-3">
              <span className="text-forest-800 font-bold text-xl">R</span>
            </div>
            <span className="text-white font-bold text-2xl">RampLO</span>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-2xl mb-6">
          <div className="text-center mb-4">
            <p className="text-xl font-semibold text-white">{getHeaderText()}</p>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20 [&>div]:bg-limeglow-400" />
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
          <div className="bg-white rounded-lg p-8 shadow-xl">

            <form onSubmit={handleSubmit} onKeyDown={(e) => {
              // Prevent Enter key from submitting form unless on final step
              // But allow Enter in text inputs and textareas
              if (e.key === 'Enter' && step !== totalSteps) {
                const target = e.target as HTMLElement;
                const isTextInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
                if (!isTextInput) {
                  e.preventDefault();
                }
              }
            }} className="space-y-4">
              {/* Step Content */}
                {/* Step 1: Personal Info with Multiple Cities */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <User className="w-6 h-6 text-forest-800 mr-3" />
                    <Label className="text-lg font-medium text-gray-900">
                      Let's start with your basic information
                    </Label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm/6 font-medium text-gray-900">
                        First Name
                      </label>
                      <div className="mt-2">
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Riley"
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-slate-400 placeholder:text-gray-400 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 sm:text-sm/6"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm/6 font-medium text-gray-900">
                        Last Name
                      </label>
                      <div className="mt-2">
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Parker"
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-slate-400 placeholder:text-gray-400 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-medium block mb-2">Up To 4 Markets You Serve Or Want To Serve</Label>
                    <div className="max-w-md">
                      <TagInput
                        value={formData.markets}
                        onChange={(values) => handleTaggedArrayChange("markets", values)}
                        placeholder="Enter city or market area (e.g., Los Angeles)"
                        maxTags={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Experience Level */}
              {step === 2 && (
                <div>
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-6 h-6 text-forest-800 mr-3" />
                    <Label className="text-lg font-medium text-gray-900">
                      What's your experience level as a mortgage loan officer?
                    </Label>
                  </div>
                  <fieldset aria-label="Experience level">
                    <div className="space-y-2">
                      {[
                        { value: "new", label: "New to the industry. I'm just getting started" },
                        { value: "<1y", label: "Less than 1 year. I'm building foundational skills" },
                        { value: "1-3y", label: "1-3 years. I'm growing my experience" },
                        { value: "3+", label: "3+ years. I'm a seasoned professional" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          aria-label={option.label}
                          className={`group relative block rounded-lg border px-6 py-3 cursor-pointer transition-colors ${
                            formData.experienceLevel === option.value 
                              ? 'border-forest-600 bg-forest-50 ring-2 ring-forest-600' 
                              : 'border-slate-400 bg-white hover:border-forest-400'
                          }`}
                        >
                          <input
                            value={option.value}
                            checked={formData.experienceLevel === option.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                            name="experience"
                            type="radio"
                            className="absolute inset-0 appearance-none focus:outline-none"
                          />
                          <span className="text-sm font-normal text-gray-900">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
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
                        { value: "purchase", label: "Purchase Loans" },
                        { value: "refi", label: "Refinancing" },
                        { value: "heloc", label: "HELOC" },
                        { value: "investor-dscr", label: "Investor (DSCR)" },
                        { value: "non-qm", label: "Non-QM" },
                        { value: "not-sure", label: "Not Sure" },
                        { value: "other", label: "Other" },
                      ].map((focus) => (
                        <div
                          key={focus.value}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            formData.focus.includes(focus.value)
                              ? "border-forest-600 bg-forest-50"
                              : "border-gray-200 hover:border-forest-400"
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
                              <div className="text-sm font-normal">{focus.label}</div>
                            </div>
                            {formData.focus.includes(focus.value) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArrayChange("focus", focus.value, false);
                                }}
                                className="p-1 hover:bg-forest-400/20 rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {formData.focus.includes("other") && (
                      <div className="mt-4">
                        <label htmlFor="otherFocus" className="block text-sm/6 font-medium text-gray-900">
                          Please specify your other loan focus
                        </label>
                        <div className="mt-2 max-w-md">
                          <input
                            id="otherFocus"
                            name="otherFocus"
                            type="text"
                            value={formData.otherFocus}
                            onChange={(e) => setFormData(prev => ({ ...prev, otherFocus: e.target.value }))}
                            placeholder="e.g., Bridge loans, Construction loans, Jumbo loans"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-slate-400 placeholder:text-gray-400 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 sm:text-sm/6"
                          />
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      {formData.focus.length}/3 loan types selected
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.focus.map((focusType) => {
                        const option = [
                          { value: "purchase", label: "Purchase Loans" },
                          { value: "refi", label: "Refinancing" },
                          { value: "heloc", label: "HELOC" },
                          { value: "investor-dscr", label: "Investor (DSCR)" },
                          { value: "non-qm", label: "Non-QM" },
                          { value: "not-sure", label: "Not Sure" },
                          { value: "other", label: "Other" },
                        ].find(opt => opt.value === focusType);
                        
                        // Use custom input for "other" if available
                        const displayLabel = focusType === "other" && formData.otherFocus 
                          ? formData.otherFocus 
                          : option?.label;
                        
                        return (
                          <div
                            key={focusType}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-forest-200 text-forest-800 rounded-full text-sm"
                          >
                            {displayLabel}
                            <button
                              type="button"
                              onClick={() => handleArrayChange("focus", focusType, false)}
                              className="p-0.5 hover:bg-forest-400/20 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
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
                              ? "border-forest-600 bg-forest-50"
                              : "border-gray-200 hover:border-forest-400"
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
                            <span className="text-sm font-normal">{type.label}</span>
                            {formData.borrowerTypes.includes(type.value) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArrayChange("borrowerTypes", type.value, false);
                                }}
                                className="p-1 hover:bg-forest-400/20 rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {formData.borrowerTypes.includes("other") && (
                      <div className="mt-4">
                        <label htmlFor="otherBorrowerType" className="block text-sm/6 font-medium text-gray-900">
                          Please specify your other borrower type
                        </label>
                        <div className="mt-2 max-w-md">
                          <input
                            id="otherBorrowerType"
                            name="otherBorrowerType"
                            type="text"
                            value={formData.otherBorrowerType}
                            onChange={(e) => setFormData(prev => ({ ...prev, otherBorrowerType: e.target.value }))}
                            placeholder="e.g., Foreign nationals, Self-employed, Bank statement loans"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-slate-400 placeholder:text-gray-400 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 sm:text-sm/6"
                          />
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      {formData.borrowerTypes.length}/4 types selected
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.borrowerTypes.map((type) => {
                        const option = borrowerTypeOptions.find(opt => opt.value === type);
                        
                        // Use custom input for "other" if available
                        const displayLabel = type === "other" && formData.otherBorrowerType 
                          ? formData.otherBorrowerType 
                          : option?.label;
                        
                        return (
                          <div
                            key={type}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-forest-200 text-forest-800 rounded-full text-sm"
                          >
                            {displayLabel}
                            <button
                              type="button"
                              onClick={() => handleArrayChange("borrowerTypes", type, false)}
                              className="p-0.5 hover:bg-forest-400/20 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Time & Comfort */}
              {step === 5 && (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center mb-4">
                      <Clock className="w-6 h-6 text-forest-800 mr-3" />
                      <Label className="text-lg font-medium text-gray-900">
                        How much time can you dedicate to prospecting per weekday?
                      </Label>
                    </div>
                    <fieldset aria-label="Time available">
                      <div className="space-y-2">
                        {[
                          { value: "30", first: "30 minutes.", second: "Quick daily activities" },
                          { value: "60", first: "60 minutes.", second: "Focused prospecting time" },
                          { value: "90+", first: "90+ minutes.", second: "Deep relationship building" },
                        ].map((time) => (
                          <label
                            key={time.value}
                            aria-label={`${time.first} ${time.second}`}
                            className={`group relative block rounded-lg border px-6 py-3 cursor-pointer transition-colors ${
                              formData.timeAvailableWeekday === time.value 
                                ? 'border-forest-600 bg-forest-50 ring-2 ring-forest-600' 
                                : 'border-slate-400 bg-white hover:border-forest-400'
                            }`}
                          >
                            <input
                              value={time.value}
                              checked={formData.timeAvailableWeekday === time.value}
                              onChange={(e) => setFormData(prev => ({ ...prev, timeAvailableWeekday: e.target.value }))}
                              name="timeAvailable"
                              type="radio"
                              className="absolute inset-0 appearance-none focus:outline-none"
                            />
                            <span className="text-sm text-gray-900">
                              <span className="font-medium">{time.first}</span>
                              <span className="font-normal"> {time.second}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-900 mb-4 block">
                      How comfortable are you with outreach activities?
                    </Label>
                    <fieldset aria-label="Outreach comfort">
                      <div className="space-y-2">
                        {[
                          { value: "low", first: "Low.", second: "I prefer warm introductions" },
                          { value: "medium", first: "Medium.", second: "I'm willing to reach out with preparation" },
                          { value: "high", first: "High.", second: "I'm comfortable with cold outreach" },
                        ].map((comfort) => (
                          <label
                            key={comfort.value}
                            aria-label={`${comfort.first} ${comfort.second}`}
                            className={`group relative block rounded-lg border px-6 py-3 cursor-pointer transition-colors ${
                              formData.outreachComfort === comfort.value 
                                ? 'border-forest-600 bg-forest-50 ring-2 ring-forest-600' 
                                : 'border-slate-400 bg-white hover:border-forest-400'
                            }`}
                          >
                            <input
                              value={comfort.value}
                              checked={formData.outreachComfort === comfort.value}
                              onChange={(e) => setFormData(prev => ({ ...prev, outreachComfort: e.target.value }))}
                              name="outreachComfort"
                              type="radio"
                              className="absolute inset-0 appearance-none focus:outline-none"
                            />
                            <span className="text-sm text-gray-900">
                              <span className="font-medium">{comfort.first}</span>
                              <span className="font-normal"> {comfort.second}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center mb-4">
                      <Users className="w-6 h-6 text-forest-800 mr-3" />
                      <Label className="text-lg font-medium text-gray-900">
                        Tell us about your existing network assets
                      </Label>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-4 border-2 border-gray-200 rounded-lg">
                        <div className="mb-4">
                          <Label className="text-base font-medium mb-3 block">Do you have a client list?</Label>
                          <p className="text-sm text-gray-600 mb-3">Database of previous customers for referrals and repeat business</p>
                          <RadioGroup 
                            value={formData.hasPastClientList ? "yes" : "no"}
                            onValueChange={(value) => setFormData(prev => ({ 
                              ...prev, 
                              hasPastClientList: value === "yes",
                              // Reset dependent fields when changing to no
                              clientListLocation: value === "yes" ? prev.clientListLocation : "",
                              crmName: value === "yes" ? prev.crmName : "",
                              clientListOther: value === "yes" ? prev.clientListOther : ""
                            }))}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="client-list-yes" />
                              <Label htmlFor="client-list-yes" className="text-sm cursor-pointer">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="client-list-no" />
                              <Label htmlFor="client-list-no" className="text-sm cursor-pointer">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        {formData.hasPastClientList && (
                          <div className="space-y-4 ml-6 border-l-2 border-primary/20 pl-4">
                            <div>
                              <Label className="font-medium block mb-2">Where does your client list live?</Label>
                              <fieldset aria-label="Client list location">
                                <div className="space-y-2">
                                  {[
                                    { value: "crm", label: "CRM System" },
                                    { value: "excel", label: "Excel File" },
                                    { value: "email", label: "Email Contacts" },
                                    { value: "other", label: "Other" },
                                  ].map((option) => (
                                    <label
                                      key={option.value}
                                      aria-label={option.label}
                                      className={`group relative block rounded-lg border px-6 py-3 cursor-pointer transition-colors ${
                                        formData.clientListLocation === option.value 
                                          ? 'border-forest-600 bg-forest-50 ring-2 ring-forest-600' 
                                          : 'border-slate-400 bg-white hover:border-forest-400'
                                      }`}
                                    >
                                      <input
                                        value={option.value}
                                        checked={formData.clientListLocation === option.value}
                                        onChange={(e) => setFormData(prev => ({ ...prev, clientListLocation: e.target.value }))}
                                        name="clientListLocation"
                                        type="radio"
                                        className="absolute inset-0 appearance-none focus:outline-none"
                                      />
                                      <span className="text-sm font-normal text-gray-900">{option.label}</span>
                                    </label>
                                  ))}
                                </div>
                              </fieldset>
                            </div>
                            
                            {formData.clientListLocation === "crm" && (
                              <div>
                                <label htmlFor="crmName" className="block text-sm/6 font-medium text-gray-900">What CRM do you use?</label>
                                <div className="mt-2">
                                  <input
                                    id="crmName"
                                    name="crmName"
                                    type="text"
                                    value={formData.crmName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, crmName: e.target.value }))}
                                    placeholder="e.g., Salesforce, HubSpot, Top Producer"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-slate-400 placeholder:text-gray-400 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 sm:text-sm/6"
                                  />
                                </div>
                              </div>
                            )}
                            
                            {formData.clientListLocation === "other" && (
                              <div>
                                <label htmlFor="clientListOther" className="block text-sm/6 font-medium text-gray-900">Please explain where your client list lives</label>
                                <div className="mt-2">
                                  <input
                                    id="clientListOther"
                                    name="clientListOther"
                                    type="text"
                                    value={formData.clientListOther}
                                    onChange={(e) => setFormData(prev => ({ ...prev, clientListOther: e.target.value }))}
                                    placeholder="e.g., In my head, business cards, notebook, Google Docs"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-slate-400 placeholder:text-gray-400 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 sm:text-sm/6"
                                  />
                                </div>
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
                                  ? "border-forest-600 bg-forest-50"
                                  : "border-gray-200 hover:border-forest-400"
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
                                <span className="text-sm font-normal">{source.label}</span>
                                {formData.networkSources.includes(source.value) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleArrayChange("networkSources", source.value, false);
                                    }}
                                    className="p-1 hover:bg-forest-400/20 rounded-full"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {formData.networkSources.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.networkSources.map((source) => {
                              const option = networkSourceOptions.find(opt => opt.value === source);
                              return (
                                <div
                                  key={source}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-forest-200 text-forest-800 rounded-full text-sm"
                                >
                                  {option?.label}
                                  <button
                                    type="button"
                                    onClick={() => handleArrayChange("networkSources", source, false)}
                                    className="p-0.5 hover:bg-forest-400/20 rounded-full"
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
                                <label htmlFor={`social-${channel}`} className="block text-sm/6 font-medium text-gray-900 capitalize">
                                  {channel} Profile URL
                                </label>
                                <div className="mt-2">
                                  <input
                                    id={`social-${channel}`}
                                    name={`social-${channel}`}
                                    type="url"
                                    value={formData.socialLinks[channel] ?? ""}
                                    onChange={(e) => setFormData(prev => ({
                                      ...prev,
                                      socialLinks: { ...prev.socialLinks, [channel]: e.target.value }
                                    }))}
                                    placeholder={`https://${channel}.com/yourprofile`}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-slate-400 placeholder:text-gray-400 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 sm:text-sm/6"
                                  />
                                </div>
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
                      <MessageSquare className="w-6 h-6 text-forest-800 mr-3" />
                      <Label className="text-lg font-medium text-gray-900">
                        What's your preferred communication tone?
                      </Label>
                    </div>
                    <fieldset aria-label="Communication tone">
                      <div className="space-y-2">
                        {[
                          { value: "professional", first: "Professional.", second: "Formal and business-focused" },
                          { value: "friendly", first: "Friendly.", second: "Warm and approachable" },
                          { value: "direct", first: "Direct.", second: "Straight to the point" },
                        ].map((tone) => (
                          <label
                            key={tone.value}
                            aria-label={`${tone.first} ${tone.second}`}
                            className={`group relative block rounded-lg border px-6 py-3 cursor-pointer transition-colors ${
                              formData.tonePreference === tone.value 
                                ? 'border-forest-600 bg-forest-50 ring-2 ring-forest-600' 
                                : 'border-slate-400 bg-white hover:border-forest-400'
                            }`}
                          >
                            <input
                              value={tone.value}
                              checked={formData.tonePreference === tone.value}
                              onChange={(e) => setFormData(prev => ({ ...prev, tonePreference: e.target.value }))}
                              name="tonePreference"
                              type="radio"
                              className="absolute inset-0 appearance-none focus:outline-none"
                            />
                            <span className="text-sm text-gray-900">
                              <span className="font-medium">{tone.first}</span>
                              <span className="font-normal"> {tone.second}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
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
                                ? "border-forest-600 bg-forest-50"
                                : "border-gray-200 hover:border-forest-400"
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
                              <span className="text-sm font-normal">{channel.label}</span>
                              {formData.preferredChannels.includes(channel.value) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArrayChange("preferredChannels", channel.value, false);
                                  }}
                                  className="p-1 hover:bg-forest-400/20 rounded-full"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        {formData.preferredChannels.length}/3 channels selected
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.preferredChannels.map((channel) => {
                          const option = communicationChannelOptions.find(opt => opt.value === channel);
                          return (
                            <div
                              key={channel}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-forest-200 text-forest-800 rounded-full text-sm"
                            >
                              {option?.label}
                              <button
                                type="button"
                                onClick={() => handleArrayChange("preferredChannels", channel, false)}
                                className="p-0.5 hover:bg-forest-400/20 rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Goals */}
              {step === 7 && (
                <div>
                  <label htmlFor="goals" className="block text-sm/6 font-medium text-gray-900 mb-4">
                    What are your main goals for the next 90 days?
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="goals"
                      name="goals"
                      value={formData.goals}
                      onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                      placeholder="e.g., Close my first 3 loans, build relationships with 20 realtors, establish a consistent social media presence..."
                      rows={4}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-slate-400 placeholder:text-gray-400 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 sm:text-sm/6"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Be specific about what success looks like for you. This helps us tailor your daily tasks and priorities.
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center">
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
                    type="button"
                    disabled={!canProceed() || isLoading}
                    className="ml-auto"
                    onClick={(e) => {
                      // Explicitly handle final submission
                      handleSubmit(e as any);
                    }}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Complete Setup
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}