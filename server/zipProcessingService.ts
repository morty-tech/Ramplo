import AdmZip from 'adm-zip';
import path from 'path';

export interface ExtractedTemplate {
  id: string;
  name: string;
  type: 'component' | 'page' | 'style';
  content: string;
  fileName: string;
  description?: string;
  dependencies?: string[];
  tailwindClasses?: string[];
}

export interface ExtractionResult {
  templates: ExtractedTemplate[];
  extractedFiles: number;
  skippedFiles: number;
  extractionSummary: string;
}

export class ZipProcessingService {
  private static readonly RELEVANT_EXTENSIONS = [
    '.html', '.htm', '.jsx', '.tsx', '.js', '.ts', '.css', '.scss', '.sass', '.vue'
  ];

  private static readonly COMPONENT_PATTERNS = [
    /components?/i,
    /templates?/i,
    /layouts?/i,
    /blocks?/i,
    /sections?/i,
    /widgets?/i
  ];

  private static readonly SKIP_PATTERNS = [
    /node_modules/i,
    /\.git/i,
    /dist/i,
    /build/i,
    /\.next/i,
    /\.nuxt/i,
    /vendor/i,
    /packages?/i,
    /tests?/i,
    /__tests__/i,
    /\.test\./i,
    /\.spec\./i,
    /\.d\.ts$/i,
    /package\.json$/i,
    /package-lock\.json$/i,
    /yarn\.lock$/i,
    /\.gitignore$/i,
    /readme/i,
    /license/i,
    /changelog/i
  ];

  static async processZipFile(zipBuffer: Buffer): Promise<ExtractionResult> {
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();
    
    const templates: ExtractedTemplate[] = [];
    let extractedFiles = 0;
    let skippedFiles = 0;

    console.log(`Processing zip file with ${entries.length} entries...`);

    for (const entry of entries) {
      if (entry.isDirectory) {
        continue;
      }

      const fileName = entry.entryName;
      const extension = path.extname(fileName).toLowerCase();

      // Skip irrelevant files
      if (this.shouldSkipFile(fileName)) {
        skippedFiles++;
        continue;
      }

      // Only process relevant file types
      if (!this.RELEVANT_EXTENSIONS.includes(extension)) {
        skippedFiles++;
        continue;
      }

      try {
        const content = entry.getData().toString('utf8');
        
        // Skip very small files (likely not templates)
        if (content.length < 50) {
          skippedFiles++;
          continue;
        }

        // Check if file contains Tailwind classes or relevant content
        if (this.containsRelevantContent(content)) {
          const template = this.createTemplateFromFile(fileName, content, extractedFiles);
          templates.push(template);
          extractedFiles++;
        } else {
          skippedFiles++;
        }
      } catch (error) {
        console.warn(`Failed to process file ${fileName}:`, error);
        skippedFiles++;
      }
    }

    const extractionSummary = this.generateExtractionSummary(templates, extractedFiles, skippedFiles);

    return {
      templates,
      extractedFiles,
      skippedFiles,
      extractionSummary
    };
  }

  private static shouldSkipFile(fileName: string): boolean {
    return this.SKIP_PATTERNS.some(pattern => pattern.test(fileName));
  }

  private static containsRelevantContent(content: string): boolean {
    // Check for Tailwind classes
    const tailwindClassPattern = /\b(bg-|text-|border-|rounded-|p-|m-|w-|h-|flex|grid|hidden|block|inline|absolute|relative|fixed|sticky)/;
    
    // Check for component-like structure
    const componentPatterns = [
      /<div\s+class/i,
      /<section\s+class/i,
      /<header\s+class/i,
      /<footer\s+class/i,
      /<nav\s+class/i,
      /className=/i,
      /function\s+\w+Component/i,
      /export\s+(default\s+)?function/i,
      /const\s+\w+\s*=.*=>/i
    ];

    return tailwindClassPattern.test(content) || 
           componentPatterns.some(pattern => pattern.test(content));
  }

  private static createTemplateFromFile(fileName: string, content: string, index: number): ExtractedTemplate {
    const baseName = path.basename(fileName, path.extname(fileName));
    const extension = path.extname(fileName);
    
    // Determine template type
    const type = this.determineTemplateType(fileName, content);
    
    // Extract Tailwind classes
    const tailwindClasses = this.extractTailwindClasses(content);
    
    // Generate description
    const description = this.generateDescription(fileName, content, type);

    return {
      id: `extracted_${index}_${baseName}`.replace(/[^a-zA-Z0-9_]/g, '_'),
      name: this.generateFriendlyName(baseName, fileName),
      type,
      content,
      fileName,
      description,
      tailwindClasses
    };
  }

  private static determineTemplateType(fileName: string, content: string): 'component' | 'page' | 'style' {
    const extension = path.extname(fileName).toLowerCase();
    
    // Style files
    if (['.css', '.scss', '.sass'].includes(extension)) {
      return 'style';
    }

    // Check content for clues
    if (this.COMPONENT_PATTERNS.some(pattern => pattern.test(fileName))) {
      return 'component';
    }

    // Check if it looks like a full page
    if (content.includes('<!DOCTYPE') || content.includes('<html') || 
        content.includes('<head>') || content.includes('<body>')) {
      return 'page';
    }

    // Default to component for most cases
    return 'component';
  }

  private static extractTailwindClasses(content: string): string[] {
    const classMatches = content.match(/class(Name)?=["']([^"']*)["']/g) || [];
    const allClasses = classMatches
      .map(match => match.match(/["']([^"']*)["']/)?.[1] || '')
      .join(' ')
      .split(/\s+/)
      .filter(cls => cls.length > 0);

    // Filter for common Tailwind patterns
    const tailwindPatterns = [
      /^(bg|text|border|rounded|p|m|w|h|max-|min-|space-|gap-|flex|grid|hidden|block|inline|absolute|relative|fixed|sticky|top-|bottom-|left-|right-|z-|opacity-|shadow|hover:|focus:|active:|disabled:|sm:|md:|lg:|xl:|2xl:)/
    ];

    const uniqueClasses = new Set(allClasses.filter(cls => 
      tailwindPatterns.some(pattern => pattern.test(cls))
    ));
    return Array.from(uniqueClasses);
  }

  private static generateFriendlyName(baseName: string, fileName: string): string {
    // Convert camelCase and kebab-case to Title Case
    const name = baseName
      .replace(/([A-Z])/g, ' $1')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();

    return name || path.basename(fileName);
  }

  private static generateDescription(fileName: string, content: string, type: string): string {
    const baseName = path.basename(fileName);
    
    // Extract first comment or JSDoc comment as description
    const commentMatch = content.match(/\/\*\*?\s*\n?\s*\*?\s*([^\n\*]+)/);
    if (commentMatch) {
      return commentMatch[1].trim();
    }

    // Generate description based on file structure
    const elementCount = (content.match(/<[^>]+>/g) || []).length;
    const classCount = (content.match(/class(Name)?=/g) || []).length;

    if (type === 'page') {
      return `Full page template with ${elementCount} HTML elements and ${classCount} styled components`;
    } else if (type === 'component') {
      return `Reusable component with ${classCount} styled elements`;
    } else {
      return `Style sheet with custom CSS and Tailwind utilities`;
    }
  }

  private static generateExtractionSummary(templates: ExtractedTemplate[], extracted: number, skipped: number): string {
    const componentCount = templates.filter(t => t.type === 'component').length;
    const pageCount = templates.filter(t => t.type === 'page').length;
    const styleCount = templates.filter(t => t.type === 'style').length;

    let summary = `Extracted ${extracted} template files (${skipped} files skipped)\n`;
    
    if (componentCount > 0) summary += `• ${componentCount} Components\n`;
    if (pageCount > 0) summary += `• ${pageCount} Pages\n`;
    if (styleCount > 0) summary += `• ${styleCount} Style Files\n`;

    const uniqueTailwindClasses = new Set(
      templates.flatMap(t => t.tailwindClasses || [])
    );
    const allTailwindClasses = Array.from(uniqueTailwindClasses);

    if (allTailwindClasses.length > 0) {
      summary += `\nFound ${allTailwindClasses.length} unique Tailwind classes`;
    }

    return summary;
  }
}