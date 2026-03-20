"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomInput, MarkdownEditor } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface StrategyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export function StrategyForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: StrategyFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setIsActive(initialData.isActive ?? true);
      setTags(initialData.tags || []);
    } else {
      setTitle("");
      setDescription("");
      setIsActive(true);
      setTags([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ title, description, isActive, tags });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
          />
          
          {/* Slide-in Panel */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-950 h-full shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
              <h2 className="text-xl font-bold dark:text-white">
                {initialData ? "Edit Strategy" : "Create New Strategy"}
              </h2>
              <Button 
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
              {/* Title */}
              <CustomInput
                id="strategy-title"
                label="Title"
                required
                value={title}
                onChange={setTitle}
                placeholder="E.g. Trend Following (Bullish)"
              />

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-bold dark:text-white text-sm">Active Strategy</p>
                  <p className="text-xs text-gray-500">Enable this strategy for the current market</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    isActive ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      isActive ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                 <label className="text-sm font-bold uppercase text-gray-500">Tags</label>
                 <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                       <Badge key={tag} variant="secondary" className="pl-2 gap-1 bg-primary/5 hover:bg-primary/10 transition-colors">
                          {tag}
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeTag(tag)} 
                            className="h-4 w-4 hover:text-rose-500 hover:bg-transparent"
                          >
                             <X className="w-3 h-3" />
                          </Button>
                       </Badge>
                    ))}
                 </div>
                 <CustomInput
                    id="strategy-tags"
                    value={newTag}
                    onChange={setNewTag}
                    onKeyDown={handleAddTag}
                    placeholder="Press Enter to add tags..."
                    className="pl-10 mr-0"
                    icon={<TagIcon className="w-4 h-4 text-gray-400" />}
                 />
              </div>

              {/* Rich Editor */}
              <div className="flex-1 min-h-[400px] flex flex-col">
                 <label className="text-sm font-bold uppercase text-gray-500 mb-2">Strategy Rules & Execution</label>
                 <div className="flex-1">
                    <MarkdownEditor 
                      id="strategy-description"
                      value={description} 
                      onChange={setDescription} 
                      placeholder="Define your entry, exit, and risk rules using markdown..." 
                    />
                 </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-6 pb-2 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-950 mt-auto border-t dark:border-gray-800">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 text-lg font-bold shadow-xl"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {initialData ? "Update Strategy" : "Save Strategy"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="h-12 px-6"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
