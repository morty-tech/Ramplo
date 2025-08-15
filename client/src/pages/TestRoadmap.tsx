import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Target, Mail } from "lucide-react";

export default function TestRoadmap() {
  const [roadmapResult, setRoadmapResult] = useState<any>(null);
  const [templateResult, setTemplateResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testRoadmapSelection = async () => {
    setLoading(true);
    try {
      const result = await apiRequest("POST", "/api/roadmap/select", {});
      setRoadmapResult(result);
      toast({
        title: "Roadmap Selected!",
        description: "AI has analyzed your profile and selected an optimal roadmap.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to select roadmap",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testTemplateSelection = async () => {
    setLoading(true);
    try {
      const result = await apiRequest("POST", "/api/templates/select", { limit: 3 });
      setTemplateResult(result);
      toast({
        title: "Templates Selected!",
        description: "AI has found the most relevant email templates for you.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to select templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AI Roadmap & Template Testing
        </h1>
        <p className="text-lg text-gray-600">
          Test the AI-powered roadmap and email template selection system
        </p>
      </div>

      {/* Test Buttons */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-6 h-6 mr-2 text-blue-600" />
              Roadmap Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Test AI analysis of your profile to select the optimal 90-day roadmap
            </p>
            <Button 
              onClick={testRoadmapSelection} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Bot className="w-4 h-4 mr-2 animate-pulse" />
                  Analyzing Profile...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2" />
                  Select My Roadmap
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-6 h-6 mr-2 text-green-600" />
              Template Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Test AI matching of email templates to your focus areas and style
            </p>
            <Button 
              onClick={testTemplateSelection} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Bot className="w-4 h-4 mr-2 animate-pulse" />
                  Finding Templates...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2" />
                  Find My Templates
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Roadmap Results */}
      {roadmapResult && (
        <Card>
          <CardHeader>
            <CardTitle>🎯 Recommended Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="font-semibold text-blue-900">{roadmapResult.selectedRoadmap?.name}</h3>
              <p className="text-blue-800 mt-2">{roadmapResult.selectedRoadmap?.description}</p>
              <div className="mt-3 space-y-1 text-sm text-blue-700">
                <p><strong>Focus:</strong> {roadmapResult.selectedRoadmap?.focus}</p>
                <p><strong>Experience Level:</strong> {roadmapResult.selectedRoadmap?.experienceLevel}</p>
                <p><strong>Time Commitment:</strong> {roadmapResult.selectedRoadmap?.timeCommitment} minutes/day</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">AI Reasoning:</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{roadmapResult.reasoning}</p>
            </div>

            {roadmapResult.alternativeOptions?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Alternative Options:</h4>
                <div className="space-y-2">
                  {roadmapResult.alternativeOptions.map((alt: any, index: number) => (
                    <div key={index} className="border border-gray-200 p-3 rounded">
                      <h5 className="font-medium">{alt.name}</h5>
                      <p className="text-sm text-gray-600">{alt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Results */}
      {templateResult && (
        <Card>
          <CardHeader>
            <CardTitle>📧 Recommended Email Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">AI Reasoning:</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{templateResult.reasoning}</p>
            </div>

            <div className="space-y-4">
              {templateResult.selectedTemplates?.map((template: any, index: number) => (
                <div key={index} className="border border-gray-200 p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium">{template.name}</h5>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Focus:</strong> {template.focus?.join(", ")}</p>
                    <p><strong>Borrower Types:</strong> {template.borrowerTypes?.join(", ")}</p>
                    <p><strong>Tone:</strong> {template.tone}</p>
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-blue-600">
                      View Template
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      <p><strong>Subject:</strong> {template.subject}</p>
                      <div className="mt-2 whitespace-pre-line">{template.content}</div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}