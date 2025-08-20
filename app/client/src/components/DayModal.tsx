import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Plus } from "lucide-react";

interface DayTask {
  title: string;
  category: string;
  estimatedMinutes: number;
}

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: {
    day: number;
    week: number;
    objective: string;
    extraTimeActivity: string;
    tasks: DayTask[];
    weekTheme: string;
  } | null;
}

export default function DayModal({ isOpen, onClose, day }: DayModalProps) {
  if (!day) return null;

  const totalMinutes = day.tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Week {day.week}, Day {day.day}
          </DialogTitle>
          <p className="text-sm text-gray-600">{day.weekTheme}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Daily Objective */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-900">Today's Objective</h3>
            </div>
            <p className="text-blue-800">{day.objective}</p>
          </div>

          {/* Time Estimate */}
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Estimated time: {totalHours > 0 && `${totalHours}h `}{remainingMinutes}m
            </span>
          </div>

          {/* Tasks */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Daily Tasks</h3>
            <div className="space-y-3">
              {day.tasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white"
                >
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center mt-1 space-x-3">
                      <Badge variant="secondary" className="text-xs">
                        {task.category}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.estimatedMinutes} min
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Time Activity */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Plus className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-900">If You Have Extra Time</h3>
            </div>
            <p className="text-green-800">{day.extraTimeActivity}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}