"use client";

import { useState } from "react";
import { ProgressTracker } from "../_types/progress";
import { updateProgressItem, addProgressItem, updateProgressTracker, deleteProgressTracker } from "../_lib/dal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Clock, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface ProgressDetailModalProps {
  tracker: ProgressTracker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
  onUpdateEntry: (id: number, data: Partial<ProgressTracker>) => void;
}

export default function ProgressDetailModal({
  tracker,
  open,
  onOpenChange,
  onRefresh,
  onUpdateEntry,
}: ProgressDetailModalProps) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [loading, setLoading] = useState(false);

  if (!tracker) return null;

  const progressPercent = tracker.totalValue 
    ? Math.round(((tracker.currentValue || 0) / tracker.totalValue) * 100) 
    : tracker.items?.length 
      ? Math.round((tracker.items.filter(i => i.isCompleted).length / tracker.items.length) * 100)
      : 0;

  const handleToggleItem = async (itemId: number, isCompleted: boolean) => {
    if (!tracker) return;
    const newItems = tracker.items?.map(item => 
      item.id === itemId ? { ...item, isCompleted: !isCompleted } : item
    ) || [];

    // Optimistic update
    onUpdateEntry(tracker.id, { items: newItems as any });

    try {
      await updateProgressItem(tracker.id, itemId, { isCompleted: !isCompleted });
    } catch (error) {
      toast.error("Failed to update item");
      onRefresh(); // Rollback
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !tracker) return;

    // We can't easily do optimistic update for ADD because we don't have the ID yet,
    // but we can add a temporary item or just refresh. 
    // Let's refresh for ADD but keep toggle optimistic.
    
    try {
      setLoading(true);
      await addProgressItem(tracker.id, { title: newItemTitle });
      setNewItemTitle("");
      onRefresh();
    } catch (error) {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTracker = async () => {
    if (!confirm("Are you sure you want to delete this tracker?")) return;
    try {
      await deleteProgressTracker(tracker.id);
      toast.success("Tracker deleted");
      onOpenChange(false);
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete tracker");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col p-0 border-none bg-background/95 backdrop-blur-xl">
        <DialogHeader className="p-6 pb-0">
          <div className="flex justify-between items-start pr-8">
            <div className="space-y-1">
              <Badge variant="secondary" className="uppercase text-[10px] tracking-widest">
                {tracker.type.replace('_', ' ')}
              </Badge>
              <DialogTitle className="text-2xl font-bold">{tracker.title}</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={handleDeleteTracker}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {tracker.description && (
            <p className="text-muted-foreground text-sm mt-2">{tracker.description}</p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Global Progress */}
          <div className="space-y-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-3xl font-bold text-primary">{progressPercent}%</span>
                <span className="text-sm text-muted-foreground ml-2">Progress Overview</span>
              </div>
              <div className="text-sm font-medium">
                {tracker.type !== 'LEARNING_PLAN' 
                  ? `${tracker.currentValue ?? 0} / ${tracker.totalValue ?? '-'} ${tracker.unit || ''}`
                  : `${tracker.items?.filter(i => i.isCompleted).length || 0} / ${tracker.items?.length || 0} items`
                }
              </div>
            </div>
            <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
              />
            </div>
          </div>

          {/* Checklist Items */}
          {tracker.type === 'LEARNING_PLAN' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Checklist Items
                </h3>
                <span className="text-xs text-muted-foreground">
                  {tracker.items?.length || 0} total
                </span>
              </div>

              <form onSubmit={handleAddItem} className="flex gap-2">
                <Input
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="Add a new task..."
                  className="bg-muted/50 border-none h-10 focus-visible:ring-1"
                />
                <Button type="submit" size="icon" className="h-10 w-10 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </form>

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {tracker.items?.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all group"
                    >
                      <Checkbox
                        checked={item.isCompleted}
                        onCheckedChange={() => handleToggleItem(item.id, item.isCompleted)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${item.isCompleted ? 'line-through text-muted-foreground opacity-60' : ''}`}>
                          {item.title}
                        </p>
                        {item.dueDate && (
                          <div className="flex items-center text-[10px] text-muted-foreground mt-0.5">
                            <Clock className="mr-1 h-3 w-3" />
                            Due {format(new Date(item.dueDate), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(!tracker.items || tracker.items.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm italic">
                    No items yet. Add your first task above.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {tracker.tags && tracker.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tracker.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="px-3 py-1 bg-background">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-2 border-t border-border/50">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center text-[10px] text-muted-foreground">
              <Clock className="mr-1.5 h-3 w-3" />
                Updated {format(new Date(tracker.updatedAt), 'PPp')}
            </div>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
