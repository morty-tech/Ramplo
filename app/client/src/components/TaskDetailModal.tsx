import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Task } from "@shared/schema";
import { Clock, ExternalLink, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "wouter";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  isCompleting: boolean;
}

export default function TaskDetailModal({ 
  task, 
  isOpen, 
  onClose, 
  onComplete, 
  isCompleting 
}: TaskDetailModalProps) {
  if (!task) return null;

  const handleMarkComplete = () => {
    onComplete(task.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
              {task.completed && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {task.estimatedMinutes} min
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="capitalize">
              {task.category || 'General'}
            </Badge>
            <Badge variant="secondary">
              Week {task.week}, Day {task.day}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Basic Description */}
          {task.description && (
            <div>
              <h4 className="font-medium mb-2">Overview</h4>
              <p className="text-gray-700">{task.description}</p>
            </div>
          )}

          {/* Detailed Description */}
          {task.detailedDescription && (
            <div>
              <h4 className="font-medium mb-3">Detailed Instructions</h4>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {task.detailedDescription}
                </div>
              </div>
            </div>
          )}

          {/* Internal App Links */}
          {task.internalLinks && task.internalLinks.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Related Pages</h4>
              <div className="space-y-2">
                {task.internalLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.route}
                    className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer group"
                    onClick={onClose}
                  >
                    <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    <span className="text-blue-700 font-medium">{link.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* External Links */}
          {task.externalLinks && task.externalLinks.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Helpful Resources</h4>
              <div className="space-y-2">
                {task.externalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    <span className="text-gray-700 group-hover:text-blue-700 font-medium transition-colors">
                      {link.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            {!task.completed && (
              <Button 
                onClick={handleMarkComplete} 
                disabled={isCompleting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isCompleting ? "Completing..." : "Mark Complete"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}