import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, FileArchive, CheckCircle, AlertCircle } from "lucide-react";
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

interface ZipUploaderProps {
  onExtractionComplete: (result: ExtractionResult) => void;
}

export function ZipUploader({ onExtractionComplete }: ZipUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Please select a ZIP file');
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('File is too large. Please select a ZIP file smaller than 50MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a ZIP file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('zipFile', selectedFile);

      const response = await fetch('/api/templates/extract-zip', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process ZIP file');
      }

      const result: ExtractionResult = await response.json();
      
      // Brief delay to show 100% progress
      setTimeout(() => {
        onExtractionComplete(result);
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('zip-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }, 500);

    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload and process the ZIP file');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileArchive className="w-6 h-6" />
          <span>Upload Tailwind Template ZIP</span>
        </CardTitle>
        <CardDescription>
          Upload a ZIP file containing Tailwind templates. We'll extract the relevant components and styling for your public site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="zip-file-input">Select ZIP File</Label>
          <Input
            id="zip-file-input"
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="cursor-pointer"
          />
          {selectedFile && (
            <div className="text-sm text-gray-600 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing ZIP file...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Extract Templates
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Supported formats: .zip files up to 50MB</p>
          <p>• We'll extract HTML, CSS, JSX, TSX, and Vue components</p>
          <p>• Only files with Tailwind classes will be processed</p>
          <p>• Node modules and build files will be automatically skipped</p>
        </div>
      </CardContent>
    </Card>
  );
}