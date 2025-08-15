import { useState, useEffect, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Copy, Wand2, Edit, Plus, Download, BarChart3, X, Save, Loader2, Mail, MessageSquare, Phone, Image, Upload, Palette, Type, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import { ImageEditor } from "@/components/ImageEditor";
import type { UploadResult } from "@uppy/core";

type TemplateType = "email" | "social-media" | "phone-script";

type MarketingTemplate = {
  id: string;
  name: string;
  templateType: TemplateType;
  category: string;
  subject?: string;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  platform?: string;
  scriptType?: string;
  isDefault: boolean;
  createdAt: Date;
};

type TemplateImage = {
  id: string;
  name: string;
  imageUrl: string;
  imageAlt?: string;
  category: string;
  tags: string[];
  isDefault: boolean;
};

// Character limits for social media platforms
const PLATFORM_LIMITS = {
  'Twitter/X': 280,
  'LinkedIn': 3000,
  'Instagram': 125,
  'Facebook': 3000,
  'General': 1000 // Default for unspecified platforms
} as const;

// Helper function to clean content (remove \n characters for display)
const cleanContentForDisplay = (content: string): string => {
  return content.replace(/\\n/g, '').replace(/\n/g, ' ').trim();
};

// Helper function to get character limit for platform
const getCharacterLimit = (platform?: string): number => {
  if (!platform) return PLATFORM_LIMITS.General;
  const matchedPlatform = Object.keys(PLATFORM_LIMITS).find(p => 
    platform.toLowerCase().includes(p.toLowerCase().split('/')[0])
  );
  return matchedPlatform ? PLATFORM_LIMITS[matchedPlatform as keyof typeof PLATFORM_LIMITS] : PLATFORM_LIMITS.General;
};

// Generate random background color
const generateRandomColor = (): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FCEA2B', '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Get default text based on template
const getDefaultText = (templateName?: string): string => {
  if (!templateName) return 'Your Mortgage Partner';
  if (templateName.toLowerCase().includes('realtor')) return 'Partner with Us';
  if (templateName.toLowerCase().includes('first-time')) return 'First Home Dreams';
  if (templateName.toLowerCase().includes('rate')) return 'Great Rates Available';
  return 'Your Mortgage Partner';
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
  const [activeTemplateType, setActiveTemplateType] = useState<TemplateType>("email");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<MarketingTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MarketingTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string>("");
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<TemplateImage | null>(null);
  const [inlineImageSettings, setInlineImageSettings] = useState({
    text: '',
    textColor: '#ffffff',
    backgroundColor: generateRandomColor(),
    fontSize: 24,
    textX: 50,
    textY: 50
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [editedBody, setEditedBody] = useState('');
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [editedScript, setEditedScript] = useState('');
  const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
  const [isAICustomizationOpen, setIsAICustomizationOpen] = useState(false);
  const [animatingFields, setAnimatingFields] = useState<{
    subject?: boolean;
    body?: boolean;
    script?: boolean;
    content?: boolean;
  }>({});
  const [aiCustomizedFields, setAiCustomizedFields] = useState<{
    subject?: boolean;
    body?: boolean;
    script?: boolean;
    content?: boolean;
  }>({});
  const [customizationForm, setCustomizationForm] = useState({
    recipientType: "realtor",
    tone: "professional",
    keyPoints: ""
  });
  const [isAICustomizationSuccess, setIsAICustomizationSuccess] = useState(false);
  const { toast } = useToast();

  // Fetch templates from API filtered by type
  const { data: templates = [], isLoading } = useQuery<MarketingTemplate[]>({
    queryKey: ['/api/templates', activeTemplateType],
    queryFn: async () => {
      const response = await fetch(`/api/templates?templateType=${activeTemplateType}`);
      return response.json();
    }
  });

  // Fetch template images
  const { data: templateImages = [] } = useQuery<TemplateImage[]>({
    queryKey: ['/api/template-images'],
    enabled: activeTemplateType === "social-media"
  });

  // Set default selected template when templates load
  useEffect(() => {
    if (templates.length > 0 && !templates.find(t => t.id === selectedTemplateId)) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  // Update selected template when template ID changes
  useEffect(() => {
    const template = templates.find(t => t.id === selectedTemplateId);
    setSelectedTemplate(template || null);
    
    // Auto-select matching image if available
    if (template?.imageUrl && templateImages.length > 0) {
      const imageMatch = templateImages.find(img => img.imageUrl === template.imageUrl);
      if (imageMatch) {
        setSelectedImageId(imageMatch.id);
      } else {
        // Clear selection if no match found
        setSelectedImageId("");
      }
    } else if (!template?.imageUrl) {
      // Clear image selection for templates without images
      setSelectedImageId("");
    }
  }, [selectedTemplateId, templates, templateImages]);

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

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (data: { imageURL: string; name: string; category: string; imageAlt: string }) => {
      const response = await apiRequest("PUT", "/api/template-images", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/template-images'] });
      toast({
        title: "Image Uploaded",
        description: "Your image has been added to the library.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
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
      // Auto-save the changes first
      if (selectedTemplate) {
        const updates: any = {};
        if (data.subject) updates.subject = data.subject;
        if (data.content) updates.content = data.content;
        
        updateTemplateMutation.mutate({
          id: selectedTemplate.id,
          updates
        });
        
        // Determine which fields were changed for animation
        const newAnimatingFields: typeof animatingFields = {};
        
        if (activeTemplateType === "email") {
          if (data.subject) newAnimatingFields.subject = true;
          if (data.content) newAnimatingFields.body = true;
        } else if (activeTemplateType === "phone-script") {
          if (data.content) newAnimatingFields.script = true;
        } else if (activeTemplateType === "social-media") {
          if (data.content) newAnimatingFields.content = true;
        }
        
        // Trigger animation with a slight delay to see the flash
        setTimeout(() => {
          setAnimatingFields(newAnimatingFields);
        }, 100);
        
        // Set AI customized indicators (persist)
        setAiCustomizedFields(prev => ({ ...prev, ...newAnimatingFields }));
        
        // Clear animation after 3 seconds
        setTimeout(() => {
          setAnimatingFields({});
        }, 3100);
      }
      
      // Show success state on the customize button
      setIsAICustomizationSuccess(true);
      
      // Close the AI customization modal
      setIsAICustomizationOpen(false);
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
      const selectedImage = templateImages.find(img => img.id === selectedImageId);
      updateTemplateMutation.mutate({
        id: editingTemplate.id,
        updates: {
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          content: editingTemplate.content,
          imageUrl: selectedImage?.imageUrl || editingTemplate.imageUrl,
          imageAlt: selectedImage?.imageAlt || editingTemplate.imageAlt,
        }
      });
    }
  };

  const handleImageUpload = async () => {
    try {
      const response = await fetch('/api/objects/upload', { method: 'POST' });
      const data = await response.json();
      return { method: 'PUT' as const, url: data.uploadURL };
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleImageUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const upload = result.successful[0];
      uploadImageMutation.mutate({
        imageURL: upload.uploadURL || '',
        name: upload.name || 'Custom Upload',
        category: 'user-upload',
        imageAlt: 'User uploaded image'
      });
    }
  };

  // Update canvas with customized image
  const updateCanvasImage = () => {
    if (!selectedTemplate?.imageUrl) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new window.Image() as HTMLImageElement;
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Set canvas size
      canvas.width = Math.min(img.width, 400);
      canvas.height = (canvas.width / img.width) * img.height;
      
      // Clear and set background
      ctx.fillStyle = inlineImageSettings.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image smaller (80% size) and centered to show background
      const imageScale = 0.8;
      const scaledWidth = canvas.width * imageScale;
      const scaledHeight = canvas.height * imageScale;
      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;
      
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      
      // Draw text if provided
      if (inlineImageSettings.text.trim()) {
        ctx.font = `bold ${inlineImageSettings.fontSize}px Arial`;
        ctx.fillStyle = inlineImageSettings.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calculate text position
        const x = (inlineImageSettings.textX / 100) * canvas.width;
        const y = (inlineImageSettings.textY / 100) * canvas.height;
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(inlineImageSettings.text, x, y);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      // Convert canvas to data URL and set as custom image
      setCustomImageUrl(canvas.toDataURL('image/png'));
    };
    
    img.src = selectedTemplate.imageUrl;
  };

  // Reset image customization
  const resetImageCustomization = () => {
    setInlineImageSettings({
      text: '',
      textColor: '#ffffff',
      backgroundColor: generateRandomColor(),
      fontSize: 24,
      textX: 50,
      textY: 50
    });
    setCustomImageUrl('');
  };

  // Set defaults and auto-apply when template changes
  useEffect(() => {
    if (selectedTemplate && activeTemplateType === 'social-media') {
      setInlineImageSettings(prev => ({
        ...prev,
        text: prev.text || getDefaultText(selectedTemplate.name),
        backgroundColor: prev.backgroundColor || generateRandomColor()
      }));
      
      // Auto-apply changes after a short delay to ensure state is updated
      setTimeout(() => {
        updateCanvasImage();
      }, 100);
    }
    
    // Reset editing state when template changes
    setIsEditingContent(false);
    setEditedContent('');
    setIsEditingSubject(false);
    setEditedSubject('');
    setIsEditingBody(false);
    setEditedBody('');
    setIsEditingScript(false);
    setEditedScript('');
    // Clear AI customized indicators and success state when template changes
    setAiCustomizedFields({});
    setIsAICustomizationSuccess(false);
  }, [selectedTemplate, activeTemplateType]);

  // Auto-apply changes when inline settings change
  useEffect(() => {
    if (selectedTemplate?.imageUrl && activeTemplateType === 'social-media') {
      updateCanvasImage();
    }
  }, [inlineImageSettings, selectedTemplate?.imageUrl, activeTemplateType]);

  // Download customized image
  const downloadCustomizedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !customImageUrl) return;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'custom'}_social_post.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your customized image is being downloaded.",
      });
    }, 'image/png');
  };

  // Save edited content
  const saveEditedContent = () => {
    if (selectedTemplate && editedContent.trim()) {
      updateTemplateMutation.mutate({
        id: selectedTemplate.id,
        updates: { content: editedContent }
      });
      setIsEditingContent(false);
    }
  };

  // Start editing content
  const startEditingContent = () => {
    if (selectedTemplate) {
      setEditedContent(selectedTemplate.content);
      setIsEditingContent(true);
    }
  };

  // Reset content editing
  const resetContentEditing = () => {
    setIsEditingContent(false);
    setEditedContent('');
  };

  // Save edited subject
  const saveEditedSubject = () => {
    if (selectedTemplate && editedSubject.trim()) {
      updateTemplateMutation.mutate({
        id: selectedTemplate.id,
        updates: { subject: editedSubject }
      });
      setIsEditingSubject(false);
    }
  };

  // Start editing subject
  const startEditingSubject = () => {
    if (selectedTemplate) {
      setEditedSubject(selectedTemplate.subject || '');
      setIsEditingSubject(true);
    }
  };

  // Reset subject editing
  const resetSubjectEditing = () => {
    setIsEditingSubject(false);
    setEditedSubject('');
  };

  // Save edited body
  const saveEditedBody = () => {
    if (selectedTemplate && editedBody.trim()) {
      updateTemplateMutation.mutate({
        id: selectedTemplate.id,
        updates: { content: editedBody }
      });
      setIsEditingBody(false);
    }
  };

  // Start editing body
  const startEditingBody = () => {
    if (selectedTemplate) {
      setEditedBody(selectedTemplate.content);
      setIsEditingBody(true);
    }
  };

  // Reset body editing
  const resetBodyEditing = () => {
    setIsEditingBody(false);
    setEditedBody('');
  };

  // Save edited script
  const saveEditedScript = () => {
    if (selectedTemplate && editedScript.trim()) {
      updateTemplateMutation.mutate({
        id: selectedTemplate.id,
        updates: { content: editedScript }
      });
      setIsEditingScript(false);
    }
  };

  // Start editing script
  const startEditingScript = () => {
    if (selectedTemplate) {
      setEditedScript(selectedTemplate.content);
      setIsEditingScript(true);
    }
  };

  // Reset script editing
  const resetScriptEditing = () => {
    setIsEditingScript(false);
    setEditedScript('');
  };

  const templateTypeIcons = {
    email: Mail,
    "social-media": MessageSquare,
    "phone-script": Phone,
  };

  const templateTypeLabels = {
    email: "Email Templates",
    "social-media": "Social Media Templates", 
    "phone-script": "Phone Scripts",
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const selectedImage = templateImages.find(img => img.id === selectedImageId);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Outreach Templates</h1>
        <p className="text-gray-600">Professional templates to help you connect with prospects and partners.</p>
      </div>

      {/* Template Type Tabs */}
      <Tabs value={activeTemplateType} onValueChange={(value) => setActiveTemplateType(value as TemplateType)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          {Object.entries(templateTypeLabels).map(([type, label]) => {
            const Icon = templateTypeIcons[type as TemplateType];
            return (
              <TabsTrigger key={type} value={type} className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Template Library */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="mb-4">
                <CardTitle>{templateTypeLabels[activeTemplateType]}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Select a template to customize and use</p>
              </div>
            </CardHeader>

            <CardContent>
              {selectedTemplate && (
                <>
                  <div className="mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                          <SelectTrigger className="w-full max-w-md h-12 text-lg font-semibold bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-blue-500">
                            <SelectValue placeholder="Choose template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id} className="text-base py-3">
                                <div className="flex flex-col">
                                  <span className="font-medium">{template.name}</span>
                                  <span className="text-xs text-gray-500">{template.category}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {isAICustomizationSuccess ? (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          AI Customized
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsAICustomizationOpen(true)}
                          className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
                        >
                          <Wand2 className="w-3 h-3" />
                          Customize with AI
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    {/* Email Template View */}
                    {activeTemplateType === "email" && (
                      <>
                        <div className="space-y-6">
                          {/* Subject Line */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium text-gray-900">Subject Line:</div>
                                  {aiCustomizedFields.subject && (
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      AI Customized
                                    </div>
                                  )}
                                </div>
                                {!isEditingSubject && (
                                  <Button
                                    onClick={() => copyToClipboard(selectedTemplate.subject || '')}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6 px-2"
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy Subject
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {isEditingSubject && (
                                  <button
                                    onClick={resetSubjectEditing}
                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    Reset
                                  </button>
                                )}
                                <div className="text-xs text-gray-500">
                                  {(selectedTemplate.subject || '').length} characters
                                </div>
                              </div>
                            </div>
                            {isEditingSubject ? (
                              <div className="space-y-2">
                                <Input
                                  value={editedSubject}
                                  onChange={(e) => setEditedSubject(e.target.value)}
                                  className={`text-sm transition-all duration-1000 ${
                                    animatingFields.subject 
                                      ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                      : ''
                                  }`}
                                  placeholder="Enter subject line..."
                                />
                                <div className="flex justify-end">
                                  <Button
                                    onClick={saveEditedSubject}
                                    size="sm"
                                    disabled={updateTemplateMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {updateTemplateMutation.isPending ? (
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                      <Save className="w-3 h-3 mr-1" />
                                    )}
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div 
                                  className="text-sm text-gray-900 bg-white p-3 rounded border cursor-pointer hover:bg-gray-50 transition-colors italic"
                                  onClick={startEditingSubject}
                                >
                                  {selectedTemplate.subject || 'No subject line'}
                                  <div className="text-xs text-gray-400 mt-1 opacity-0 hover:opacity-100 transition-opacity not-italic">
                                    Click to edit
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Email Body */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium text-gray-900">Email Body:</div>
                                  {aiCustomizedFields.body && (
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      AI Customized
                                    </div>
                                  )}
                                </div>
                                {!isEditingBody && (
                                  <Button
                                    onClick={() => copyToClipboard(selectedTemplate.content)}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6 px-2"
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy Body
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {isEditingBody && (
                                  <button
                                    onClick={resetBodyEditing}
                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    Reset
                                  </button>
                                )}
                                <div className="text-xs text-gray-500">
                                  {selectedTemplate.content.split(/\s+/).length} words
                                </div>
                              </div>
                            </div>
                            {isEditingBody ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editedBody}
                                  onChange={(e) => setEditedBody(e.target.value)}
                                  className={`text-sm min-h-[400px] resize-none font-mono transition-all duration-1000 ${
                                    animatingFields.body 
                                      ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                      : ''
                                  }`}
                                  placeholder="Enter email content..."
                                />
                                <div className="flex justify-end">
                                  <Button
                                    onClick={saveEditedBody}
                                    size="sm"
                                    disabled={updateTemplateMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {updateTemplateMutation.isPending ? (
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                      <Save className="w-3 h-3 mr-1" />
                                    )}
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div 
                                  className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-4 rounded border min-h-[200px] cursor-pointer hover:bg-gray-50 transition-colors font-mono"
                                  onClick={startEditingBody}
                                >
                                  {selectedTemplate.content}
                                  <div className="text-xs text-gray-400 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                                    Click to edit
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Social Media Template View */}
                    {activeTemplateType === "social-media" && (
                      <>
                        <div className="space-y-6">
                          {/* Image Preview with Inline Customization - Above content */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-medium text-gray-900">Image Preview:</div>
                                {selectedTemplate?.imageUrl && (
                                  <Button
                                    onClick={downloadCustomizedImage}
                                    size="sm"
                                    disabled={!customImageUrl}
                                    variant="outline"
                                    className="text-xs h-6 px-2"
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setIsImageLibraryOpen(true)}
                                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                  <Image className="w-3 h-3" />
                                  Change Image
                                </button>
                                <button
                                  onClick={resetImageCustomization}
                                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Reset
                                </button>
                              </div>
                            </div>
                            {selectedTemplate.imageUrl ? (
                              <div className="bg-white p-4 rounded border space-y-4">
                                {/* Canvas for customized image */}
                                <div className="flex justify-center relative">
                                  <canvas 
                                    ref={canvasRef}
                                    className="max-w-md h-48 border rounded shadow-sm"
                                    style={{ display: customImageUrl ? 'block' : 'none' }}
                                  />
                                  {!customImageUrl && (
                                    <div className="relative">
                                      <img 
                                        src={selectedTemplate.imageUrl} 
                                        alt={selectedTemplate.imageAlt || "Template image"}
                                        className="w-full max-w-md h-48 object-cover rounded mx-auto"
                                      />
                                      {updateTemplateMutation.isPending && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Inline Image Customization Controls */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
                                  <div className="space-y-3">
                                    <div>
                                      <Label className="text-xs font-medium flex items-center gap-1">
                                        <Type className="w-3 h-3" />
                                        Text Overlay
                                      </Label>
                                      <Input
                                        value={inlineImageSettings.text}
                                        onChange={(e) => setInlineImageSettings(prev => ({...prev, text: e.target.value}))}
                                        placeholder="Add text..."
                                        className="text-sm h-8"
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label className="text-xs font-medium">Text Color</Label>
                                      <div className="flex gap-2">
                                        <input
                                          type="color"
                                          value={inlineImageSettings.textColor}
                                          onChange={(e) => setInlineImageSettings(prev => ({...prev, textColor: e.target.value}))}
                                          className="w-8 h-8 border rounded cursor-pointer"
                                        />
                                        <Input
                                          value={inlineImageSettings.textColor}
                                          onChange={(e) => setInlineImageSettings(prev => ({...prev, textColor: e.target.value}))}
                                          className="text-xs h-8 flex-1"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <div>
                                      <Label className="text-xs font-medium flex items-center gap-1">
                                        <Palette className="w-3 h-3" />
                                        Background
                                      </Label>
                                      <div className="flex gap-2">
                                        <input
                                          type="color"
                                          value={inlineImageSettings.backgroundColor}
                                          onChange={(e) => setInlineImageSettings(prev => ({...prev, backgroundColor: e.target.value}))}
                                          className="w-8 h-8 border rounded cursor-pointer"
                                        />
                                        <Input
                                          value={inlineImageSettings.backgroundColor}
                                          onChange={(e) => setInlineImageSettings(prev => ({...prev, backgroundColor: e.target.value}))}
                                          className="text-xs h-8 flex-1"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label className="text-xs font-medium">
                                        Font Size: {inlineImageSettings.fontSize}px
                                      </Label>
                                      <Slider
                                        value={[inlineImageSettings.fontSize]}
                                        onValueChange={([value]) => setInlineImageSettings(prev => ({...prev, fontSize: value}))}
                                        min={12}
                                        max={48}
                                        step={2}
                                        className="w-full"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                              </div>
                            ) : (
                              <div className="bg-white p-4 rounded border h-48 flex items-center justify-center text-gray-400 relative">
                                <div className="text-center">
                                  <Image className="w-8 h-8 mx-auto mb-2" />
                                  <p className="text-sm">No image selected</p>
                                </div>
                                {updateTemplateMutation.isPending && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Post Content - Below image */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium text-gray-900">Post Content:</div>
                                  {aiCustomizedFields.content && (
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      AI Customized
                                    </div>
                                  )}
                                </div>
                                {!isEditingContent && (
                                  <Button
                                    onClick={() => copyToClipboard(cleanContentForDisplay(selectedTemplate.content))}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6 px-2"
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy Content
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {isEditingContent && (
                                  <button
                                    onClick={resetContentEditing}
                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    Reset
                                  </button>
                                )}
                                <div className="text-xs text-gray-500">
                                  {(() => {
                                    const cleanContent = cleanContentForDisplay(selectedTemplate.content);
                                    const charLimit = getCharacterLimit(selectedTemplate.platform);
                                    const isOverLimit = cleanContent.length > charLimit;
                                    return (
                                      <span className={isOverLimit ? 'text-red-600 font-medium' : 'text-gray-500'}>
                                        {cleanContent.length}/{charLimit} characters
                                        {selectedTemplate.platform && ` (${selectedTemplate.platform})`}
                                      </span>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                            {isEditingContent ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                  className={`text-sm min-h-[120px] resize-none transition-all duration-1000 ${
                                    animatingFields.content 
                                      ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                      : ''
                                  }`}
                                  placeholder="Edit your post content..."
                                />
                                <div className="flex justify-end">
                                  <Button
                                    onClick={saveEditedContent}
                                    size="sm"
                                    disabled={updateTemplateMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {updateTemplateMutation.isPending ? (
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                      <Save className="w-3 h-3 mr-1" />
                                    )}
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div 
                                  className="text-sm text-gray-900 bg-white p-4 rounded border min-h-[120px] cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={startEditingContent}
                                >
                                  {cleanContentForDisplay(selectedTemplate.content)}
                                  <div className="text-xs text-gray-400 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                                    Click to edit
                                  </div>
                                </div>
                              </div>
                            )}
                            {(() => {
                              const cleanContent = cleanContentForDisplay(selectedTemplate.content);
                              const charLimit = getCharacterLimit(selectedTemplate.platform);
                              if (cleanContent.length > charLimit) {
                                return (
                                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                    ⚠️ This post exceeds the {selectedTemplate.platform || 'recommended'} character limit by {cleanContent.length - charLimit} characters.
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Phone Script Template View */}
                    {activeTemplateType === "phone-script" && (
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-gray-900">Call Script:</div>
                                {aiCustomizedFields.script && (
                                  <div className="flex items-center gap-1 text-xs text-green-600">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    AI Customized
                                  </div>
                                )}
                              </div>
                              {!isEditingScript && (
                                <Button
                                  onClick={() => copyToClipboard(selectedTemplate.content)}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6 px-2"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy Script
                                </Button>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {isEditingScript && (
                                <button
                                  onClick={resetScriptEditing}
                                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Reset
                                </button>
                              )}
                              <div className="text-xs text-gray-500">
                                {selectedTemplate.content.split(/\s+/).length} words • ~{Math.ceil(selectedTemplate.content.split(/\s+/).length / 150)} min read
                              </div>
                            </div>
                          </div>
                          {isEditingScript ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editedScript}
                                onChange={(e) => setEditedScript(e.target.value)}
                                className={`text-sm min-h-[300px] resize-none font-mono transition-all duration-1000 ${
                                  animatingFields.script 
                                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                    : ''
                                }`}
                                placeholder="Enter your phone script..."
                              />
                              <div className="flex justify-end">
                                <Button
                                  onClick={saveEditedScript}
                                  size="sm"
                                  disabled={updateTemplateMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {updateTemplateMutation.isPending ? (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  ) : (
                                    <Save className="w-3 h-3 mr-1" />
                                  )}
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div 
                                className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-4 rounded border min-h-[300px] cursor-pointer hover:bg-gray-50 transition-colors font-mono"
                                onClick={startEditingScript}
                              >
                                {selectedTemplate.content}
                                <div className="text-xs text-gray-400 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                                  Click to edit
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Image Library Modal */}
                  <Dialog open={isImageLibraryOpen} onOpenChange={setIsImageLibraryOpen}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Select an Image</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                        {templateImages.map((image) => (
                          <div
                            key={image.id}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                              selectedTemplate?.imageUrl === image.imageUrl
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              if (selectedTemplate) {
                                updateTemplateMutation.mutate({
                                  id: selectedTemplate.id,
                                  updates: {
                                    imageUrl: image.imageUrl,
                                    imageAlt: image.imageAlt
                                  }
                                });
                                setIsImageLibraryOpen(false);
                              }
                            }}
                          >
                            <img
                              src={image.imageUrl}
                              alt={image.imageAlt || image.name}
                              className="w-full h-32 object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                              <p className="text-xs font-medium truncate">{image.name}</p>
                            </div>
                            {selectedTemplate?.imageUrl === image.imageUrl && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="flex items-center space-x-4">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
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
                            
                            {activeTemplateType === "email" && (
                              <div>
                                <Label htmlFor="template-subject">Subject Line</Label>
                                <Input
                                  id="template-subject"
                                  value={editingTemplate.subject || ''}
                                  onChange={(e) => setEditingTemplate(prev => prev ? {...prev, subject: e.target.value} : null)}
                                />
                              </div>
                            )}

                            {activeTemplateType === "social-media" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="template-content">Post Content</Label>
                                    <Textarea
                                      id="template-content"
                                      value={editingTemplate.content}
                                      onChange={(e) => setEditingTemplate(prev => prev ? {...prev, content: e.target.value} : null)}
                                      rows={8}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Select Image</Label>
                                    <Select value={selectedImageId} onValueChange={setSelectedImageId}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Choose an image" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {templateImages.map((image) => (
                                          <SelectItem key={image.id} value={image.id}>
                                            {image.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {selectedImage && (
                                    <div className="space-y-3">
                                      <img 
                                        src={selectedImage.imageUrl} 
                                        alt={selectedImage.imageAlt}
                                        className="w-full h-32 object-cover rounded border"
                                      />
                                      <Button 
                                        onClick={() => {
                                          if (selectedImage) {
                                            setEditingImage(selectedImage);
                                            setIsImageEditorOpen(true);
                                          }
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center space-x-2 w-full"
                                        disabled={!selectedImage?.imageUrl}
                                      >
                                        <Palette className="w-4 h-4" />
                                        <span>
                                          {selectedImage?.imageUrl ? "Customize Image" : "No Image Available"}
                                        </span>
                                      </Button>
                                    </div>
                                  )}
                                  <div>
                                    <ObjectUploader
                                      onGetUploadParameters={handleImageUpload}
                                      onComplete={handleImageUploadComplete}
                                      maxNumberOfFiles={1}
                                      buttonClassName="w-full"
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload Custom Image
                                    </ObjectUploader>
                                  </div>
                                </div>
                              </div>
                            )}

                            {activeTemplateType === "phone-script" && (
                              <div>
                                <Label htmlFor="template-content">Script Content</Label>
                                <Textarea
                                  id="template-content"
                                  value={editingTemplate.content}
                                  onChange={(e) => setEditingTemplate(prev => prev ? {...prev, content: e.target.value} : null)}
                                  rows={15}
                                  className="font-mono text-sm"
                                />
                              </div>
                            )}

                            {activeTemplateType === "email" && (
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
                            )}

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
          

          {/* Template Analysis */}
          {selectedTemplate && activeTemplateType === "email" && (
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

          {/* Social Media Insights */}
          {selectedTemplate && activeTemplateType === "social-media" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Social Media Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Character Count</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {selectedTemplate?.content ? selectedTemplate.content.length : 0} chars
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedTemplate?.platform === "linkedin" ? "Max 3,000" :
                         selectedTemplate?.platform === "facebook" ? "Max 63,206" :
                         selectedTemplate?.platform === "instagram" ? "Max 2,200" : "Platform optimized"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hashtags</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {(selectedTemplate?.content?.match(/#\w+/g) || []).length}
                      </div>
                      <div className="text-xs text-gray-500">Engagement tags</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Platform</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {selectedTemplate?.platform || "Universal"}
                      </div>
                      <div className="text-xs text-gray-500">Target platform</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phone Script Guide */}
          {selectedTemplate && activeTemplateType === "phone-script" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Script Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Script Type</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {selectedTemplate?.scriptType || "General"}
                      </div>
                      <div className="text-xs text-gray-500">Call purpose</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estimated Duration</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {Math.ceil((selectedTemplate?.content || "").split(' ').length / 150)} - {Math.ceil((selectedTemplate?.content || "").split(' ').length / 120)} min
                      </div>
                      <div className="text-xs text-gray-500">Speaking time</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pause Points</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {(selectedTemplate?.content?.match(/\[PAUSE/g) || []).length}
                      </div>
                      <div className="text-xs text-gray-500">Response opportunities</div>
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
      
      {/* AI Customization Modal */}
      <Dialog open={isAICustomizationOpen} onOpenChange={setIsAICustomizationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-orange-600" />
              AI Customization
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-1">
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
            
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleCustomize}
                disabled={customizeTemplateMutation.isPending || !customizationForm.keyPoints.trim()}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400"
              >
                {customizeTemplateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                {customizeTemplateMutation.isPending ? 'Generating...' : 'Customize My Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Editor */}
      <ImageEditor
        isOpen={isImageEditorOpen}
        onClose={() => {
          setIsImageEditorOpen(false);
          setEditingImage(null);
        }}
        imageUrl={editingImage?.imageUrl || ""}
        imageName={editingImage?.name || ""}
      />
    </div>
  );
}