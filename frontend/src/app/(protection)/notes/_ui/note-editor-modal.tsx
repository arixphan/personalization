"use client";

import { useEffect, useState } from "react";
import { X, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomInput, RichTextEditor } from "@/components/ui/input";
import { ColorPicker } from "./color-picker";
import { Note, CreateNoteDto } from "../_types/note";
import { cn } from "@/lib/utils";

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dto: CreateNoteDto) => Promise<void>;
  initialNote?: Note | null;
}

const DEFAULT_COLOR = "#6366f1";

export const NoteEditorModal = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
}: NoteEditorModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!initialNote;

  useEffect(() => {
    if (isOpen) {
      setTitle(initialNote?.title ?? "");
      setContent(initialNote?.content ?? "");
      setColor(initialNote?.color ?? DEFAULT_COLOR);
      setIsPinned(initialNote?.isPinned ?? false);
    }
  }, [isOpen, initialNote]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      setIsSaving(true);
      await onSave({ title: title.trim(), content: content.trim(), color, isPinned });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSave();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative z-10 w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
      >
        {/* Color accent top bar */}
        <div
          className="h-1 w-full rounded-t-2xl"
          style={{ backgroundColor: color }}
        />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isEditing ? "Edit Note" : "New Note"}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <CustomInput
              id="note-title"
              label="Title"
              placeholder="Note title..."
              value={title}
              onChange={setTitle}
              className="bg-muted/30 focus-visible:ring-1"
              autoFocus
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <RichTextEditor
              id="note-content"
              label="Content"
              placeholder="Write your note here..."
              value={content}
              onChange={setContent}
              className="bg-muted/5"
              required
            />
          </div>

          {/* Footer: color + pin */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Color
              </span>
              <ColorPicker value={color} onChange={setColor} />
            </div>

            <button
              type="button"
              onClick={() => setIsPinned((p) => !p)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                isPinned
                  ? "bg-amber-400/15 text-amber-400 border border-amber-400/30"
                  : "bg-muted/40 text-muted-foreground border border-border hover:text-foreground",
              )}
            >
              <Pin className={cn("w-3.5 h-3.5", isPinned && "fill-current")} />
              {isPinned ? "Pinned" : "Pin note"}
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim() || !content.trim()}
              style={{ backgroundColor: color }}
              className="text-white hover:opacity-90 transition-opacity"
            >
              {isSaving ? "Saving…" : isEditing ? "Save Changes" : "Create Note"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
