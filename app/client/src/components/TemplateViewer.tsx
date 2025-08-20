import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  Copy, 
  Code, 
  FileText, 
  Palette, 
  Eye,
  Search,
  Filter,
  CheckCircle
} from "lucide-react";

interface ExtractedTemplate {
  id: string;
  name: string;
  type: 'component' | 'page' | 'style';
  content: string;
  fileName: string;
  description?: string;
  dependencies?: string[];
  tailwindClasses?: string[];
}

interface ExtractionResult {
  templates: ExtractedTemplate[];
  extractedFiles: number;
  skippedFiles: number;
  extractionSummary: string;
}

interface TemplateViewerProps {
  extractionResult: ExtractionResult;
  onStartNew: () => void;
}

export function TemplateViewer({ extractionResult, onStartNew }: TemplateViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const { templates, extractionSummary } = extractionResult;

  // Filter templates based on search and type
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "all" || template.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleCopyToClipboard = async (content: string, templateId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTemplate(templateId);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDownloadTemplate = (template: ExtractedTemplate) => {
    const extension = template.type === 'style' ? '.css' : 
                     template.fileName.endsWith('.tsx') ? '.tsx' :
                     template.fileName.endsWith('.jsx') ? '.jsx' :
                     template.fileName.endsWith('.vue') ? '.vue' : '.html';
    
    const blob = new Blob([template.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'component': return <Code className="w-4 h-4" />;
      case 'page': return <FileText className="w-4 h-4" />;
      case 'style': return <Palette className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'component': return 'bg-blue-100 text-blue-800';
      case 'page': return 'bg-green-100 text-green-800';
      case 'style': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const typeCounts = {
    all: templates.length,
    component: templates.filter(t => t.type === 'component').length,
    page: templates.filter(t => t.type === 'page').length,
    style: templates.filter(t => t.type === 'style').length,
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Extracted Templates</h1>
          <p className="text-gray-600 mt-1">
            Found {templates.length} templates ready for your public site
          </p>
        </div>
        <Button onClick={onStartNew} variant="outline">
          Upload Another ZIP
        </Button>
      </div>

      {/* Extraction Summary */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="whitespace-pre-line">{extractionSummary}</div>
        </AlertDescription>
      </Alert>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("all")}
          >
            All ({typeCounts.all})
          </Button>
          <Button
            variant={selectedType === "component" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("component")}
          >
            Components ({typeCounts.component})
          </Button>
          <Button
            variant={selectedType === "page" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("page")}
          >
            Pages ({typeCounts.page})
          </Button>
          <Button
            variant={selectedType === "style" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("style")}
          >
            Styles ({typeCounts.style})
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  {getTypeIcon(template.type)}
                  <span className="truncate">{template.name}</span>
                </CardTitle>
                <Badge className={getTypeColor(template.type)}>
                  {template.type}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
              <div className="text-xs text-gray-500">
                {template.fileName}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-4">
              {/* Tailwind Classes Preview */}
              {template.tailwindClasses && template.tailwindClasses.length > 0 && (
                <div>
                  <Label className="text-xs font-medium text-gray-600">
                    Tailwind Classes ({template.tailwindClasses.length})
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.tailwindClasses.slice(0, 6).map((cls, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {cls}
                      </Badge>
                    ))}
                    {template.tailwindClasses.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tailwindClasses.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        {getTypeIcon(template.type)}
                        <span>{template.name}</span>
                      </DialogTitle>
                      <DialogDescription>
                        {template.fileName} • {template.description}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="code" className="w-full">
                      <TabsList>
                        <TabsTrigger value="code">Code</TabsTrigger>
                        {template.tailwindClasses && template.tailwindClasses.length > 0 && (
                          <TabsTrigger value="classes">Tailwind Classes</TabsTrigger>
                        )}
                      </TabsList>
                      
                      <TabsContent value="code">
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyToClipboard(template.content, template.id)}
                            className="absolute top-2 right-2 z-10"
                          >
                            {copiedTemplate === template.id ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-auto max-h-96">
                            <code>{template.content}</code>
                          </pre>
                        </div>
                      </TabsContent>
                      
                      {template.tailwindClasses && (
                        <TabsContent value="classes">
                          <div className="space-y-4">
                            <div>
                              <Label className="font-medium">
                                All Tailwind Classes ({template.tailwindClasses.length})
                              </Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {template.tailwindClasses.map((cls, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {cls}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyToClipboard(template.content, template.id)}
                >
                  {copiedTemplate === template.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadTemplate(template)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedType !== "all" 
              ? "Try adjusting your search or filter criteria."
              : "Upload a ZIP file containing Tailwind templates to get started."
            }
          </p>
        </div>
      )}
    </div>
  );
}