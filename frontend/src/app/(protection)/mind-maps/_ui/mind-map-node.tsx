'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';

export function MindMapNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState((data.label as string) || 'New Idea');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitLabel = () => {
    const trimmed = label.trim() || 'New Idea';
    setLabel(trimmed);
    updateNodeData(id, { ...data, label: trimmed });
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitLabel();
    if (e.key === 'Escape') {
      setLabel((data.label as string) || 'New Idea');
      setEditing(false);
    }
  };

  return (
    <div
      className={`
        w-full h-full px-4 py-2 shadow-md rounded-md bg-white border-2 border-primary
        min-w-[100px] text-center select-none relative
        flex flex-col items-center justify-center outline-none
        ${selected ? 'shadow-[0_0_0_4px_rgba(59,130,246,0.3)] border-blue-500' : ''}
      `}
      onDoubleClick={() => setEditing(true)}
    >
      <NodeResizer
        minWidth={80}
        minHeight={36}
        isVisible={selected}
        onResizeEnd={(_, params) => {
          updateNodeData(id, { ...data, width: params.width, height: params.height });
        }}
      />

      {/* TARGET handles (where connections come IN) */}
      <Handle type="target" position={Position.Top} id="target-top" className="w-3 h-3 bg-primary" />
      <Handle type="target" position={Position.Left} id="target-left" className="w-2 h-2 opacity-50" />
      <Handle type="target" position={Position.Right} id="target-right" className="w-2 h-2 opacity-50" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" className="w-2 h-2 opacity-50" />

      {editing ? (
        <input
          ref={inputRef}
          value={label}
          onChange={e => setLabel(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={handleKeyDown}
          className="text-sm font-medium w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0"
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <div className="text-sm font-medium">{label}</div>
      )}

      {/* SOURCE handles (where connections go OUT) */}
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="w-3 h-3 bg-primary" />
      <Handle type="source" position={Position.Left} id="source-left" className="w-2 h-2 opacity-50" />
      <Handle type="source" position={Position.Right} id="source-right" className="w-2 h-2 opacity-50" />
      <Handle type="source" position={Position.Top} id="source-top" className="w-2 h-2 opacity-50" />
    </div>
  );
}
