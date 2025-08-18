import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Task } from "@shared/schema";

interface TaskListProps {
  tasks: Task[];
  expandedTaskId: string | null;
  completingTaskId: string | null;
  onTaskClick: (task: Task) => void;
  onTaskComplete: (taskId: string) => void;
  variant?: 'dashboard' | 'roadmap';
}

export function TaskList({
  tasks,
  expandedTaskId,
  completingTaskId,
  onTaskClick,
  onTaskComplete,
  variant = 'dashboard'
}: TaskListProps) {
  const getCategoryStyle = (category: string) => {
    const categoryLower = category?.toLowerCase() || '';
    
    if (['outreach', 'client calls', 'follow-up'].includes(categoryLower)) {
      return 'bg-aura-50 text-aura-400 ring-aura-600/20';
    }
    if (['research', 'market analysis', 'lead generation'].includes(categoryLower)) {
      return 'bg-teal-50 text-teal-700 ring-teal-600/20';
    }
    if (['social media', 'content creation', 'marketing', 'branding'].includes(categoryLower)) {
      return 'bg-lime-50 text-lime-700 ring-lime-600/20';
    }
    if (['admin', 'planning', 'setup', 'organization'].includes(categoryLower)) {
      return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
    return 'bg-gray-50 text-gray-600 ring-gray-500/10';
  };

  const getNumberStyles = () => {
    if (variant === 'dashboard') {
      return {
        size: 'w-10 h-10',
        textSize: 'text-xl',
        topOffset: 'top-5',
        shadow: 'shadow-lg'
      };
    }
    return {
      size: 'w-8 h-8',
      textSize: 'text-sm',
      topOffset: 'top-4', 
      shadow: 'shadow-sm'
    };
  };

  const getTitleStyles = () => {
    return variant === 'dashboard' ? 'text-lg' : 'text-base';
  };

  const getPaddingStyles = () => {
    return variant === 'dashboard' ? 'py-5' : 'py-4';
  };

  const getExpandedPadding = () => {
    return variant === 'dashboard' ? 'pt-5 pb-2' : 'pt-4 pb-2';
  };

  const getExpandedMargin = () => {
    return variant === 'dashboard' ? 'ml-14' : 'ml-10';
  };

  const styles = getNumberStyles();

  return (
    <ul role="list" className="divide-y divide-gray-100 px-4 sm:px-6">
      {tasks.map((task: Task, index: number) => {
        const isCompleting = completingTaskId === task.id;
        const isCompleted = task.completed;
        const isExpanded = expandedTaskId === task.id;
        
        return (
          <li key={task.id} className="transition-all duration-200 group">
            <div className="flex items-start justify-between gap-x-2 md:gap-x-6">
              <div className="flex items-start gap-x-2 md:gap-x-4 flex-1 min-w-0">
                <div className={`flex-shrink-0 ${styles.size} rounded-md flex items-center justify-center ${styles.textSize} font-black relative ${styles.topOffset} ${styles.shadow} transition-all duration-300 cursor-pointer ${
                  isCompleted 
                    ? 'bg-aura-100 text-aura-600 shadow-gray-200' 
                    : 'bg-electric-400 text-aura-600 shadow-lg shadow-electric-200 group-hover:shadow-xl group-hover:scale-105'
                }`} onClick={() => onTaskClick(task)}>
                  {isCompleted ? (
                    <Check className={variant === 'dashboard' ? "w-5 h-5" : "w-4 h-4"} />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className={`min-w-0 flex-grow cursor-pointer ${isExpanded ? getExpandedPadding() : getPaddingStyles()}`} onClick={() => onTaskClick(task)}>
                  <div className="flex items-start gap-x-3">
                    <p className={`${getTitleStyles()} font-semibold transition-all duration-300 ${
                      isCompleting 
                        ? 'text-green-700' 
                        : isCompleted 
                        ? 'text-gray-500 line-through' 
                        : 'text-gray-900'
                    }`}>
                      {task.title}
                    </p>
                    <p className={`mt-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getCategoryStyle(task.category || '')}`}>
                      {task.category}
                    </p>
                  </div>
                  {!isExpanded && (
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-x-2 text-xs/5 text-gray-500">
                        <p className="whitespace-nowrap">
                          Est. {task.estimatedMinutes} min
                        </p>
                        <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                          <circle r={1} cx={1} cy={1} />
                        </svg>
                        <p className="truncate">{task.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={`flex flex-none items-center ${getPaddingStyles()} min-w-0 pb-0`}>
                {!isCompleted && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCompleting) {
                        onTaskComplete(task.id);
                      }
                    }}
                    disabled={isCompleting}
                    className={`rounded-md px-2 md:px-2.5 py-1.5 text-xs font-medium shadow-xs transition-all duration-200 border whitespace-nowrap ${
                      isCompleting
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-aura-600 border-aura-600 hover:bg-aura-200'
                    }`}
                  >
                    {isCompleting ? 'Completing...' : 'Mark Completed'}
                  </Button>
                )}
              </div>
            </div>
            
            {isExpanded && (
              <div className={`pb-4 ${getExpandedMargin()}`}>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                  {task.detailedDescription && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Details:</p>
                      <p className="text-sm text-gray-600">{task.detailedDescription}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Estimated time: {task.estimatedMinutes} minutes</span>
                  </div>                 
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}