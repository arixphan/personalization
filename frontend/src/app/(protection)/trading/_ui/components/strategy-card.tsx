"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StrategyCardProps {
  strategy: any;
  onEdit: (s: any) => void;
  onDelete: (id: number) => void;
  onView: (s: any) => void;
}

export function StrategyCard({ strategy, onEdit, onDelete, onView }: StrategyCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: strategy.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
        isDragging ? "shadow-2xl ring-2 ring-primary border-transparent" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => onView(strategy)}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">
              {strategy.title}
            </h3>
            <Badge
              variant={strategy.isActive ? "default" : "secondary"}
              className={strategy.isActive ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" : ""}
            >
              {strategy.isActive ? "Active" : "Paused"}
            </Badge>
          </div>
          
          <div 
            className="text-sm text-gray-500 line-clamp-2 mb-3"
            dangerouslySetInnerHTML={{ __html: strategy.description }}
          />

          <div className="flex flex-wrap gap-1">
            {strategy.tags?.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(strategy)}
            className="h-8 w-8 text-gray-500"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(strategy.id)}
            className="h-8 w-8 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
