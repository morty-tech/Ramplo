import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { DealCoachSession } from "@shared/schema";
import { Lightbulb, Bot, ExternalLink, Clock } from "lucide-react";

const commonScenarios = [
  {
    id: "credit-issues",
    title: "Credit Score Issues",
    description: "Borrower has below 620 credit",
  },
  {
    id: "income-verification",
    title: "Income Verification",
    description: "Self-employed borrower",
  },
  {
    id: "appraisal-low",
    title: "Low Appraisal",
    description: "Property appraised below contract",
  },
  {
    id: "debt-ratio",
    title: "High Debt-to-Income",
    description: "DTI above 43%",
  },
  {
    id: "down-payment",
    title: "Down Payment Issues",
    description: "Insufficient funds for closing",
  },
];

export default function DealCoach() {
  const [formData, setFormData] = useState({
    loanStage: "",
    loanType: "",
    borrowerScenario: "",
    challenges: "",
    urgencyLevel: "",
  });
  const [showResponse, setShowResponse] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery<DealCoachSession[]>({
    queryKey: ["/api/deal-coach/sessions"],
  });

  const dealCoachMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/deal-coach", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deal-coach/sessions"] });
      setShowResponse(true);
      toast({
        title: "AI Analysis Complete",
        description: "Your deal guidance is ready below.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get deal advice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.challenges.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your challenges.",
        variant: "destructive",
      });
      return;
    }
    dealCoachMutation.mutate(formData);
  };

  const handleScenarioClick = (scenario: typeof commonScenarios[0]) => {
    setFormData(prev => ({
      ...prev,
      challenges: `${scenario.title}: ${scenario.description}`,
    }));
  };

  const latestSession = sessions[0];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Deal Coach</h1>
        <p className="text-gray-600">Get personalized guidance for any deal challenges you're facing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coach Input Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Describe Your Situation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Loan Stage */}
                <div>
                  <Label htmlFor="loan-stage">Current Loan Stage</Label>
                  <Select
                    value={formData.loanStage}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, loanStage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospecting">Prospecting</SelectItem>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="underwriting">Underwriting</SelectItem>
                      <SelectItem value="closing">Closing</SelectItem>
                      <SelectItem value="post-closing">Post-Closing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Loan Type */}
                <div>
                  <Label htmlFor="loan-type">Loan Type</Label>
                  <Select
                    value={formData.loanType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, loanType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conventional">Conventional</SelectItem>
                      <SelectItem value="fha">FHA</SelectItem>
                      <SelectItem value="va">VA</SelectItem>
                      <SelectItem value="usda">USDA</SelectItem>
                      <SelectItem value="jumbo">Jumbo</SelectItem>
                      <SelectItem value="heloc">HELOC</SelectItem>
                      <SelectItem value="refinance">Refinance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Borrower Scenario */}
                <div>
                  <Label htmlFor="borrower-scenario">Borrower Scenario</Label>
                  <Textarea
                    id="borrower-scenario"
                    value={formData.borrowerScenario}
                    onChange={(e) => setFormData(prev => ({ ...prev, borrowerScenario: e.target.value }))}
                    placeholder="Describe the borrower's situation (income, credit score, down payment, etc.)"
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Challenges */}
                <div>
                  <Label htmlFor="challenges">Specific Challenges</Label>
                  <Textarea
                    id="challenges"
                    value={formData.challenges}
                    onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                    placeholder="What specific challenges or questions do you have about this deal?"
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>

                {/* Urgency Level */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-4 block">Urgency Level</Label>
                  <RadioGroup
                    value={formData.urgencyLevel}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, urgencyLevel: value }))}
                    className="grid grid-cols-3 gap-4"
                  >
                    {[
                      { value: "low", label: "Low", desc: "General advice" },
                      { value: "medium", label: "Medium", desc: "Need guidance" },
                      { value: "high", label: "High", desc: "Urgent help" },
                    ].map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="mr-3" />
                        <div>
                          <div className="text-sm font-medium">{option.label}</div>
                          <div className="text-xs text-gray-600">{option.desc}</div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  disabled={dealCoachMutation.isPending}
                  className="w-full bg-primary hover:bg-blue-700 text-lg py-4"
                >
                  {dealCoachMutation.isPending ? (
                    <>
                      <Bot className="w-5 h-5 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5 mr-2" />
                      Get AI Guidance
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* AI Response */}
          {latestSession && showResponse && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>AI Deal Coach Response</CardTitle>
                    <p className="text-sm text-gray-600">Personalized guidance for your situation</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-blue-800 font-medium">Analysis:</p>
                    <p className="text-blue-700">{latestSession.aiResponse}</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Helpful Resources:</h4>
                  <div className="space-y-2">
                    <a href="#" className="flex items-center text-sm text-primary hover:text-blue-700 transition-colors">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Credit Score Improvement Guide
                    </a>
                    <a href="#" className="flex items-center text-sm text-primary hover:text-blue-700 transition-colors">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      FHA Loan Requirements Checklist
                    </a>
                    <a href="#" className="flex items-center text-sm text-primary hover:text-blue-700 transition-colors">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Gift Funds Documentation Template
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Common Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Common Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commonScenarios.map((scenario) => (
                  <Button
                    key={scenario.id}
                    variant="outline"
                    className="w-full text-left p-3 h-auto justify-start"
                    onClick={() => handleScenarioClick(scenario)}
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">{scenario.title}</div>
                      <div className="text-xs text-gray-600">{scenario.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.slice(0, 3).map((session: any, index) => (
                  <div key={session.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {session.challenges}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                
                {sessions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent questions yet
                  </p>
                )}
              </div>
              
              {sessions.length > 3 && (
                <Button variant="ghost" className="w-full mt-4 text-sm">
                  View All Questions
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Expert Tips */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Pro Tip
              </h3>
              <p className="text-sm opacity-90">
                Always have backup loan options ready before submitting the primary application. 
                This saves time if issues arise during underwriting.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
