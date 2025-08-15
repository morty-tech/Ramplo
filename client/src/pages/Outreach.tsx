import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Wand2, Edit, Plus, Download, BarChart3, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type MarketingTemplate = {
  id: string;
  name: string;
  type: string;
  subject?: string;
  content: string;
  isDefault: boolean;
  createdAt: Date;
};

// Email analysis functions
const getReadabilityScore = (content: string): string => {
  if (!content || typeof content !== 'string') return "N/A";
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).length;
  
  if (sentences.length === 0) return "N/A";
  
  const avgWordsPerSentence = words / sentences.length;
  
  if (avgWordsPerSentence < 15) return "Easy";
  if (avgWordsPerSentence < 20) return "Good";
  return "Complex";
};

const getSpamRisk = (content: string, subject: string): string => {
  if (!content || typeof content !== 'string') return "N/A";
  if (!subject || typeof subject !== 'string') subject = "";
  
  const spamWords = [
    'free', 'guarantee', 'no obligation', 'act now', 'limited time', 
    'urgent', 'exclusive', 'amazing', 'incredible', 'unbelievable',
    'cash', 'money back', 'risk free', 'no risk', 'winner', 'congratulations'
  ];
  
  const text = (content + ' ' + subject).toLowerCase();
  const spamCount = spamWords.filter(word => text.includes(word)).length;
  
  if (spamCount === 0) return "Low";
  if (spamCount <= 2) return "Medium";
  return "High";
};

const getCTAStrength = (content: string): string => {
  if (!content || typeof content !== 'string') return "N/A";
  
  const strongCTAs = ['call', 'schedule', 'book', 'contact', 'apply', 'get started', 'learn more'];
  const weakCTAs = ['available', 'interested', 'questions', 'thoughts'];
  
  const text = content.toLowerCase();
  const hasStrongCTA = strongCTAs.some(cta => text.includes(cta));
  const hasWeakCTA = weakCTAs.some(cta => text.includes(cta));
  
  if (hasStrongCTA) return "Strong";
  if (hasWeakCTA) return "Weak";
  return "None";
};

export default function Outreach() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<MarketingTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MarketingTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [customizationForm, setCustomizationForm] = useState({
    recipientType: "realtor",
    tone: "professional",
    keyPoints: ""
  });
  const { toast } = useToast();

  // Fetch templates from API
  const { data: templates = [], isLoading } = useQuery<MarketingTemplate[]>({
    queryKey: ['/api/templates'],
  });

  // Set default selected template when templates load
  if (templates.length > 0 && !selectedTemplateId) {
    setSelectedTemplateId(templates[0].id);
  }

  // Update selected template when template ID changes
  useEffect(() => {
    const template = templates.find(t => t.id === selectedTemplateId);
    setSelectedTemplate(template || null);
  }, [selectedTemplateId, templates]);

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<MarketingTemplate> }) => {
      await apiRequest("PUT", `/api/templates/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Template Updated",
        description: "Your template has been saved successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Template copied to clipboard.",
    });
  };

  // AI customization mutation
  const customizeTemplateMutation = useMutation({
    mutationFn: async (data: { templateId: string; customization: typeof customizationForm }) => {
      const response = await apiRequest("POST", `/api/templates/${data.templateId}/customize`, data.customization);
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Template Customized",
        description: "Opening customized template for editing...",
      });
      
      // Immediately open edit dialog with customized content
      if (selectedTemplate) {
        setEditingTemplate({
          ...selectedTemplate,
          subject: data.subject || selectedTemplate.subject,
          content: data.content || selectedTemplate.content
        });
        setIsEditDialogOpen(true);
      }
    },
    onError: (error) => {
      toast({
        title: "Customization Failed",
        description: error.message || "Failed to customize template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCustomize = () => {
    if (selectedTemplate && customizationForm.keyPoints.trim()) {
      customizeTemplateMutation.mutate({
        templateId: selectedTemplate.id,
        customization: customizationForm
      });
    } else {
      toast({
        title: "Missing Information",
        description: "Please add some key points you'd like to include in the customization.",
        variant: "destructive",
      });
    }
  };

  const handleEditTemplate = () => {
    if (selectedTemplate) {
      setEditingTemplate({ ...selectedTemplate });
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({
        id: editingTemplate.id,
        updates: {
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          content: editingTemplate.content,
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Outreach Templates</h1>
        <p className="text-gray-600">Professional templates to help you connect with prospects and partners.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Template Library */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Select a template to customize and use</p>
                </div>
                <div className="w-64">
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose template type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {selectedTemplate && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h3>
                      <p className="text-sm text-gray-600">Template Type: {selectedTemplate.type}</p>
                    </div>
                    <Button 
                      onClick={() => copyToClipboard(`Subject: ${selectedTemplate.subject}\n\n${selectedTemplate.content}`)}
                      className="bg-primary hover:bg-blue-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Template
                    </Button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="text-sm font-medium text-gray-900 mb-2">Subject Line:</div>
                    <div className="text-sm text-gray-700 mb-4 italic">{selectedTemplate.subject}</div>
                    
                    <div className="text-sm font-medium text-gray-900 mb-2">Email Body:</div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap font-mono bg-white p-4 rounded border">
                      {selectedTemplate.content}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={handleCustomize}
                      disabled={customizeTemplateMutation.isPending || !customizationForm.keyPoints.trim()}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      {customizeTemplateMutation.isPending ? 'Customizing...' : 'Customize & Edit'}
                    </Button>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={handleEditTemplate}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Template
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Template</DialogTitle>
                        </DialogHeader>
                        {editingTemplate && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="template-name">Template Name</Label>
                              <Input
                                id="template-name"
                                value={editingTemplate.name}
                                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="template-subject">Subject Line</Label>
                              <Input
                                id="template-subject"
                                value={editingTemplate.subject || ''}
                                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, subject: e.target.value} : null)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="template-content">Email Content</Label>
                              <Textarea
                                id="template-content"
                                value={editingTemplate.content}
                                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, content: e.target.value} : null)}
                                rows={15}
                                className="font-mono text-sm"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleSaveTemplate}
                                disabled={updateTemplateMutation.isPending}
                              >
                                <Save className="w-4 h-4 mr-2" />
                                {updateTemplateMutation.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* AI Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Wand2 className="w-5 h-5 text-orange-600 mr-2" />
                AI Customization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient-type">Recipient Type</Label>
                  <Select 
                    value={customizationForm.recipientType}
                    onValueChange={(value) => setCustomizationForm(prev => ({ ...prev, recipientType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtor">Real Estate Agent</SelectItem>
                      <SelectItem value="past-client">Past Client</SelectItem>
                      <SelectItem value="prospect">New Prospect</SelectItem>
                      <SelectItem value="referral">Referral Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select
                    value={customizationForm.tone}
                    onValueChange={(value) => setCustomizationForm(prev => ({ ...prev, tone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="key-points">Key Points to Include</Label>
                  <Textarea
                    id="key-points"
                    value={customizationForm.keyPoints}
                    onChange={(e) => setCustomizationForm(prev => ({ ...prev, keyPoints: e.target.value }))}
                    placeholder="e.g., Quick turnaround times, competitive rates, local market expertise..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <Button 
                  onClick={handleCustomize}
                  disabled={customizeTemplateMutation.isPending || !customizationForm.keyPoints.trim()}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {customizeTemplateMutation.isPending ? 'Customizing...' : 'Customize & Edit'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Analysis */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Word Count</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {selectedTemplate?.content ? selectedTemplate.content.split(/\s+/).length : 0} words
                      </div>
                      <div className="text-xs text-gray-500">
                        {!selectedTemplate?.content ? "No content" :
                         selectedTemplate.content.split(/\s+/).length < 150 ? "Good length" : 
                         selectedTemplate.content.split(/\s+/).length < 250 ? "Moderate length" : "Long - consider shortening"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Readability</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {getReadabilityScore(selectedTemplate?.content || "")}
                      </div>
                      <div className="text-xs text-gray-500">Professional level</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Spam Risk</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {getSpamRisk(selectedTemplate?.content || "", selectedTemplate?.subject || "")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getSpamRisk(selectedTemplate?.content || "", selectedTemplate?.subject || "") === "Low" ? "Inbox friendly" :
                         getSpamRisk(selectedTemplate?.content || "", selectedTemplate?.subject || "") === "Medium" ? "Review wording" : 
                         getSpamRisk(selectedTemplate?.content || "", selectedTemplate?.subject || "") === "High" ? "High risk phrases detected" : "No analysis"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Call-to-Action</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {getCTAStrength(selectedTemplate?.content || "")}
                      </div>
                      <div className="text-xs text-gray-500">Action clarity</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-3" />
                  Create New Template
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-3" />
                  Export All Templates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-3" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
