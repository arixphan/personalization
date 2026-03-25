"use client";

import { ProgressTracker, ProgressItem } from "../_types/progress";
import { updateProgressTracker, updateProgressItem } from "../_lib/dal";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Book, Edit2, Trash2, ChevronRight, CheckCircle2, Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import { motion } from "motion/react";

interface ProgressCardProps {
  tracker: ProgressTracker;
  onRefresh: () => void;
  onUpdateEntry: (id: number, data: Partial<ProgressTracker>) => void;
  onViewDetails: () => void;
}

export default function ProgressCard({ tracker, onRefresh, onUpdateEntry, onViewDetails }: ProgressCardProps) {
  const progressPercent = tracker.totalValue 
    ? Math.round(((tracker.currentValue || 0) / tracker.totalValue) * 100) 
    : tracker.items?.length 
      ? Math.round((tracker.items.filter(i => i.isCompleted).length / tracker.items.length) * 100)
      : 0;

  const handleIncrement = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newValue = (tracker.currentValue || 0) + 1;
      if (tracker.totalValue && newValue > tracker.totalValue) return;
      
      // Optimistic update
      onUpdateEntry(tracker.id, { currentValue: newValue, updatedAt: new Date().toISOString() });
      
      await updateProgressTracker(tracker.id, { currentValue: newValue });
      // No need to refresh the whole list!
    } catch (error) {
      console.error(error);
      // Rollback on error
      onRefresh(); 
    }
  };

  const handleToggleItem = async (itemId: number, isCompleted: boolean) => {
    try {
      await updateProgressItem(tracker.id, itemId, { isCompleted: !isCompleted });
      onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onViewDetails}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="mb-2 uppercase text-[10px] tracking-wider">
              {tracker.type.replace('_', ' ')}
            </Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-xl line-clamp-1">{tracker.title}</CardTitle>
          {tracker.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {tracker.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>{progressPercent}% Complete</span>
              {tracker.type !== 'LEARNING_PLAN' && (
                <span>
                  {tracker.currentValue ?? 0} / {tracker.totalValue ?? '-'} {tracker.unit || ''}
                </span>
              )}
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>

          {/* Type Specific Content */}
          {tracker.type === 'LEARNING_PLAN' && tracker.items && tracker.items.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {tracker.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <Checkbox 
                    checked={item.isCompleted} 
                    onCheckedChange={() => handleToggleItem(item.id, item.isCompleted)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${item.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {item.title}
                    </p>
                    {item.dueDate && (
                      <div className="flex items-center text-[10px] text-muted-foreground mt-0.5">
                        <Clock className="mr-1 h-3 w-3" />
                        {format(new Date(item.dueDate), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {tracker.items.length > 3 && (
                <p className="text-xs text-center text-muted-foreground pt-1">
                  + {tracker.items.length - 3} more items
                </p>
              )}
            </div>
          )}

          {/* Tags */}
          {tracker.tags && tracker.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tracker.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0 border-t border-border/50 bg-muted/30">
          <div className="flex justify-between items-center w-full pt-4">
            <span className="text-[10px] text-muted-foreground flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              Updated {format(new Date(tracker.updatedAt), 'MMM d')}
            </span>
            {tracker.type !== 'LEARNING_PLAN' ? (
              <Button size="sm" onClick={handleIncrement} className="h-8 px-3">
                <Plus className="mr-2 h-4 w-4" />
                Update
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="h-8 pr-0">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
