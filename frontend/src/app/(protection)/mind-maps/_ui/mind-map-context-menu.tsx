'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface MindMapContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

export function MindMapContextMenu({ x, y, nodeId, onDelete, onClose }: MindMapContextMenuProps) {
  const handleDelete = () => {
    onDelete(nodeId);
    onClose();
  };

  return (
    <>
      {/* Backdrop to close on outside click */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[140px]"
        style={{ top: y, left: x }}
      >
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete node
        </button>
      </div>
    </>
  );
}
