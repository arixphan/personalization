"use client";

import { ProgressTracker } from "../_types/progress";
import { updateProgressTracker } from "../_lib/dal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Clock, Book, CheckSquare, BarChart2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "motion/react";

interface ProgressRowProps {
  tracker: ProgressTracker;
  onRefresh: () => void;
  onUpdateEntry: (id: number, data: Partial<ProgressTracker>) => void;
  onViewDetails: () => void;
}

export default function ProgressRow({ tracker, onRefresh, onUpdateEntry, onViewDetails }: ProgressRowProps) {
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
    } catch (error) {
      console.error(error);
      onRefresh(); // Rollback
    }
  };

  const Icon = tracker.type === 'BOOK' || tracker.type === 'NOVEL' 
    ? Book 
    : tracker.type === 'LEARNING_PLAN' 
      ? CheckSquare 
      : BarChart2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: "rgba(var(--primary), 0.03)" }}
      onClick={onViewDetails}
      className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm cursor-pointer transition-all hover:border-primary/30 group"
    >
      <div className="flex items-center gap-3 min-w-[200px] flex-1">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{tracker.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-[10px] uppercase py-0 px-1.5 h-4">
              {tracker.type.replace('_', ' ')}
            </Badge>
            {tracker.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 w-full md:w-64">
        <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-0.5">
          <span>{progressPercent}% Complete</span>
          {tracker.type !== 'LEARNING_PLAN' && (
            <span>{tracker.currentValue ?? 0} / {tracker.totalValue ?? '-'} {tracker.unit || ''}</span>
          )}
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="hidden lg:flex items-center text-[10px] text-muted-foreground whitespace-nowrap">
          <Clock className="mr-1 h-3 w-3" />
          {format(new Date(tracker.updatedAt), 'MMM d, HH:mm')}
        </div>
        
        <div className="flex items-center gap-2">
          {tracker.type !== 'LEARNING_PLAN' ? (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleIncrement} 
              className="h-8 w-8 p-0 md:w-auto md:px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline text-xs">Update</span>
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="ghost"
              className="h-8 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Details
            </Button>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  );
}
