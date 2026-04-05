'use client';

import React from 'react';
import { Trash2, Sparkles } from 'lucide-react';

interface MindMapContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  onDelete: (nodeId: string) => void;
  onDeleteWithChildren: (nodeId: string) => void;
  onAiExpand: (nodeId: string) => void;
  onClose: () => void;
}

export function MindMapContextMenu({ x, y, nodeId, onDelete, onDeleteWithChildren, onAiExpand, onClose }: MindMapContextMenuProps) {
  const handleDelete = () => {
    onDelete(nodeId);
    onClose();
  };

  const handleDeleteWithChildren = () => {
    onDeleteWithChildren(nodeId);
    onClose();
  };

  const handleAiExpand = () => {
    onAiExpand(nodeId);
    onClose();
  };

  return (
    <>
      {/* Backdrop to close on outside click */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[170px]"
        style={{ top: y, left: x }}
      >
        <button
          onClick={handleAiExpand}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-primary/10 transition-colors text-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Expand with AI
        </button>
        <div className="border-t border-border/50 my-1" />
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete node
        </button>
        <button
          onClick={handleDeleteWithChildren}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete with children
        </button>
      </div>
    </>
  );
}
