"use client";

import { X, Calendar, Tag as TagIcon, Brain } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StrategyDetailProps {
  strategy: any;
  isOpen: boolean;
  onClose: () => void;
}

export function StrategyDetail({ strategy, isOpen, onClose }: StrategyDetailProps) {
  if (!isOpen || !strategy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h2 className="text-2xl font-bold dark:text-white leading-tight">{strategy.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1 font-medium">
                   <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Updated {format(new Date(strategy.updatedAt), "MMM d, yyyy")}</span>
                   </div>
                   <Badge variant={strategy.isActive ? "default" : "secondary"}>
                      {strategy.isActive ? "Active" : "Paused"}
                   </Badge>
                </div>
             </div>
          </div>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tags Row */}
        {strategy.tags && strategy.tags.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
            {strategy.tags.map((tag: string) => (
              <span key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <TagIcon className="w-3 h-3 text-gray-400" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description / Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div 
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: strategy.description }}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end">
           <Button 
              onClick={onClose} 
              size="lg"
              className="px-8 font-bold shadow-lg"
           >
              Close Study
           </Button>
        </div>
      </div>
    </div>
  );
}
