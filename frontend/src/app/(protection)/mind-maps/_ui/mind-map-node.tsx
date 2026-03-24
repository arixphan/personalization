'use client';

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export function MindMapNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 border-primary min-w-[100px] text-center ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
      {/* Explicit Target Handle at the TOP */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target-top"
        className="w-3 h-3 bg-primary" 
      />
      
      <div className="text-sm font-medium">
        {(data.label as string) || 'New Idea'}
      </div>

      {/* Explicit Source Handle at the BOTTOM */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-bottom"
        className="w-3 h-3 bg-primary" 
      />
      {/* Additional source handles for flexibility */}
      <Handle type="source" position={Position.Left} id="source-left" className="w-2 h-2 opacity-50" />
      <Handle type="source" position={Position.Right} id="source-right" className="w-2 h-2 opacity-50" />
    </div>
  );
}
