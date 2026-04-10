"use client";

import { Pin, PinOff, Pencil, Trash2 } from "lucide-react";
import { Note } from "../_types/note";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number) => void;
}

export const NoteCard = ({ note, onEdit, onDelete, onTogglePin }: NoteCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true });

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-border/60 bg-card",
        "overflow-hidden transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30",
        "hover:border-border",
      )}
    >
      {/* Color accent bar */}
      <div
        className="h-1 w-full shrink-0"
        style={{ backgroundColor: note.color }}
      />

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-sm leading-snug tracking-tight line-clamp-2 text-card-foreground"
            title={note.title}
          >
            {note.title}
          </h3>

          {/* Pin button — always visible when pinned, hidden on hover otherwise */}
          <button
            type="button"
            onClick={() => onTogglePin(note.id)}
            className={cn(
              "shrink-0 p-1 rounded-md transition-all duration-200",
              note.isPinned
                ? "text-amber-400 opacity-100"
                : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-amber-400",
            )}
            title={note.isPinned ? "Unpin" : "Pin"}
          >
            {note.isPinned ? (
              <Pin className="w-3.5 h-3.5 fill-current" />
            ) : (
              <PinOff className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Content preview */}
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap flex-1">
          {note.content
            .replace(/<\/p>/g, "\n")
            .replace(/<br\s*\/?>/g, "\n")
            .replace(/<[^>]*>/g, "")
            .replace(/\n\s*\n/g, "\n")
            .trim()}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
          <span className="text-[10px] text-muted-foreground/60">{timeAgo}</span>

          {/* Action buttons — shown on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(note)}
              title="Edit"
            >
              <Pencil className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(note.id)}
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
