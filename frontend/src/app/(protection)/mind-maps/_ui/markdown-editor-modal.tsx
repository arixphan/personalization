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
  onSave: (content: string) => void;
  onClose: () => void;
}

export function MarkdownEditorModal({
  open,
  initialContent,
  nodeLabel,
  onSave,
  onClose,
}: MarkdownEditorModalProps) {
  const [draft, setDraft] = useState(initialContent);

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl w-full h-[540px] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="text-base font-semibold">
            Edit note — <span className="text-muted-foreground font-normal">{nodeLabel}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Split pane */}
        <div className="flex flex-1 min-h-0 divide-x divide-border">
          {/* Editor */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium bg-muted/30 border-b">
              Markdown
            </div>
            <Textarea
              className="flex-1 resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm p-4 bg-background"
              placeholder="Write markdown here…&#10;&#10;## Heading&#10;- List item&#10;**Bold**, *italic*"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              autoFocus
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium bg-muted/30 border-b">
              Preview
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {draft.trim() ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">Nothing to preview…</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
