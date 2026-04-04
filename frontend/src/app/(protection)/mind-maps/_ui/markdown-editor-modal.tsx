'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorModalProps {
  open: boolean;
  initialContent: string;
  nodeLabel: string;
  onSave: (label: string, content: string) => void;
  onClose: () => void;
}

export function MarkdownEditorModal({
  open,
  initialContent,
  nodeLabel: initialLabel,
  onSave,
  onClose,
}: MarkdownEditorModalProps) {
  const [draftContent, setDraftContent] = useState(initialContent);
  const [draftLabel, setDraftLabel] = useState(initialLabel);

  // Sync state when props change (optional but good practice for modals)
  React.useEffect(() => {
    if (open) {
      setDraftContent(initialContent);
      setDraftLabel(initialLabel);
    }
  }, [open, initialContent, initialLabel]);

  const handleSave = () => {
    onSave(draftLabel.trim() || 'New Idea', draftContent);
    onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl w-full h-[600px] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
          <div className="flex flex-col gap-3">
            <DialogTitle className="text-base font-semibold">
              Edit node
            </DialogTitle>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="node-title" className="text-xs font-medium text-muted-foreground ml-0.5">
                Title
              </label>
              <input
                id="node-title"
                className="text-lg font-bold bg-transparent border-none outline-none focus:ring-0 p-0 w-full placeholder:text-muted-foreground/50"
                placeholder="Enter title…"
                value={draftLabel}
                onChange={e => setDraftLabel(e.target.value)}
              />
            </div>
          </div>
        </DialogHeader>

        {/* Split pane */}
        <div className="flex flex-1 min-h-0 divide-x divide-border">
          {/* Editor */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium bg-muted/30 border-b">
              Note (Markdown)
            </div>
            <Textarea
              className="flex-1 resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm p-4 bg-background"
              placeholder="Write markdown here…&#10;&#10;## Heading&#10;- List item&#10;**Bold**, *italic*"
              value={draftContent}
              onChange={e => setDraftContent(e.target.value)}
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium bg-muted/30 border-b font-mono">
              Preview
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {draftContent.trim() ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm font-sans">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{draftContent}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">Nothing to preview…</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
