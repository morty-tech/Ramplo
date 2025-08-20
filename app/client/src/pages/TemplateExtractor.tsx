import { useState } from "react";
import { ZipUploader } from "@/components/ZipUploader";
import { TemplateViewer } from "@/components/TemplateViewer";

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

export default function TemplateExtractor() {
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);

  const handleExtractionComplete = (result: ExtractionResult) => {
    setExtractionResult(result);
  };

  const handleStartNew = () => {
    setExtractionResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {!extractionResult ? (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Tailwind Template Extractor
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Upload a ZIP file containing Tailwind templates and we'll extract the relevant 
                components and styling for your public site. Perfect for integrating purchased 
                templates or design systems.
              </p>
            </div>
            <ZipUploader onExtractionComplete={handleExtractionComplete} />
          </div>
        ) : (
          <TemplateViewer 
            extractionResult={extractionResult} 
            onStartNew={handleStartNew}
          />
        )}
      </div>
    </div>
  );
}