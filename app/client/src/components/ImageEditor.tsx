import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Type, Palette } from "lucide-react";

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
}

export function ImageEditor({ isOpen, onClose, imageUrl, imageName }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState([32]);
  const [textX, setTextX] = useState([50]); // Percentage from left
  const [textY, setTextY] = useState([50]); // Percentage from top
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Load and draw image when dialog opens or settings change
  useEffect(() => {
    if (!isOpen || !imageUrl) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous"; // For CORS
    
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = Math.min(img.width, 800); // Max width 800px
      canvas.height = (canvas.width / img.width) * img.height;
      
      // Clear canvas and set background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw text if provided
      if (text.trim()) {
        ctx.font = `${fontSize[0]}px Arial`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Calculate text position
        const x = (textX[0] / 100) * canvas.width;
        const y = (textY[0] / 100) * canvas.height;
        
        // Add text shadow for better visibility
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(text, x, y);
        
        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      console.error("Failed to load image:", imageUrl);
    };
    
    img.src = imageUrl;
  }, [isOpen, imageUrl, backgroundColor, text, textColor, fontSize, textX, textY]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create download link
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${imageName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_custom.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const resetSettings = () => {
    setBackgroundColor("#ffffff");
    setText("");
    setTextColor("#000000");
    setFontSize([32]);
    setTextX([50]);
    setTextY([50]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Customize Image: {imageName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas Preview */}
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-4 bg-gray-50">
              <canvas 
                ref={canvasRef}
                className="max-w-full h-auto border rounded shadow-sm bg-white"
                style={{ display: imageLoaded ? 'block' : 'none' }}
              />
              {!imageLoaded && (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Loading image...
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button 
                onClick={handleDownload} 
                disabled={!imageLoaded}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Image</span>
              </Button>
              
              <Button 
                onClick={resetSettings} 
                variant="outline"
              >
                Reset
              </Button>
            </div>
          </div>
          
          {/* Controls */}
          <div className="space-y-6">
            {/* Background Color */}
            <div>
              <Label className="flex items-center space-x-2 mb-2">
                <Palette className="w-4 h-4" />
                <span>Background Color</span>
              </Label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
            
            {/* Text Overlay */}
            <div>
              <Label className="flex items-center space-x-2 mb-2">
                <Type className="w-4 h-4" />
                <span>Text Overlay</span>
              </Label>
              <Input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text (optional)"
                className="mb-3"
              />
              
              {/* Text Color */}
              <div className="mb-3">
                <Label className="text-sm text-gray-600 mb-1 block">Text Color</Label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-8 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
              
              {/* Font Size */}
              <div className="mb-3">
                <Label className="text-sm text-gray-600 mb-2 block">
                  Font Size: {fontSize[0]}px
                </Label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  min={12}
                  max={72}
                  step={2}
                  className="w-full"
                />
              </div>
              
              {/* Text Position */}
              <div className="mb-3">
                <Label className="text-sm text-gray-600 mb-2 block">
                  Horizontal Position: {textX[0]}%
                </Label>
                <Slider
                  value={textX}
                  onValueChange={setTextX}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full mb-3"
                />
                
                <Label className="text-sm text-gray-600 mb-2 block">
                  Vertical Position: {textY[0]}%
                </Label>
                <Slider
                  value={textY}
                  onValueChange={setTextY}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}