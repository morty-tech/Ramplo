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
import { Lightbulb, Bot, ExternalLink, Clock, Loader2 } from "lucide-react";

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
    <div className="p-6 mx-4 md:mx-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Deal Coach</h1>
        <p className="text-gray-600">Get personalized guidance for any deal challenges you're facing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coach Input Form */}
        <div className="lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5">
            <Bot className="w-5 h-5" />
            Describe Your Situation
          </h3>
          <Card className="shadow-md border-none">
            <CardContent className="pt-6">
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



                <Button
                  type="submit"
                  disabled={dealCoachMutation.isPending}
                  className="w-full bg-gradient-to-r from-aura-600 to-electric-600 text-white hover:from-aura-500 hover:to-electric-500 transition-all duration-200 shadow-sm hover:shadow-md text-lg py-4 border-0"
                >
                  {dealCoachMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating your guidance...
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
            <>
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5 mt-6">
                <Lightbulb className="w-5 h-5" />
                AI Deal Coach Response
              </h3>
              <Card className="shadow-md border-none">
                <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-blue-800 font-medium">Some next steps:</p>
                    <div className="text-blue-700 whitespace-pre-line">{latestSession.aiResponse}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Common Scenarios */}
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5">
            <ExternalLink className="w-5 h-5" />
            Common Scenarios
          </h3>
          <Card className="shadow-md border-none">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {commonScenarios.map((scenario) => (
                  <Button
                    key={scenario.id}
                    variant="outline"
                    className="w-full text-left p-3 h-auto justify-start hover:bg-blue-50 hover:border-blue-300 transition-colors"
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
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5" />
            Recent Questions
          </h3>
          <Card className="shadow-md border-none">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {sessions.slice(0, 3).map((session: any, index) => (
                  <div key={session.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                      {session.challenges}
                    </div>
                    {session.aiResponse && (
                      <div className="text-xs text-blue-600 mb-2 line-clamp-3 bg-blue-50 p-2 rounded border-l-2 border-blue-300">
                        <strong>AI Response:</strong> {session.aiResponse}
                      </div>
                    )}
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


        </div>
      </div>
    </div>
  );
}
