'use client';

import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { Square, Circle, Diamond, AlertTriangle, Minus, ArrowUp, Baseline } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeShape, NodePriority, MindMapNodeData } from './mind-map-types';
import { useMindMapSocketContext } from './mind-map-socket-context';

interface NodeStyleToolbarProps {
  nodeId: string;
  data: MindMapNodeData;
}

const SHAPES: { value: NodeShape; icon: React.ReactNode; label: string }[] = [
  { value: 'rectangle', icon: <Square className="h-3.5 w-3.5" />, label: 'Rectangle' },
  { value: 'circle', icon: <Circle className="h-3.5 w-3.5" />, label: 'Circle' },
  { value: 'diamond', icon: <Diamond className="h-3.5 w-3.5" />, label: 'Diamond' },
];

const PRIORITIES: { value: NodePriority; color: string; icon: React.ReactNode; label: string }[] = [
  { value: 'default', color: '#94a3b8', icon: <Baseline className="h-3 w-3" />, label: 'Default' },
  { value: 'low', color: '#22c55e', icon: <Minus className="h-3 w-3" />, label: 'Low' },
  { value: 'medium', color: '#f59e0b', icon: <AlertTriangle className="h-3 w-3" />, label: 'Medium' },
  { value: 'high', color: '#ef4444', icon: <ArrowUp className="h-3 w-3" />, label: 'High' },
];

export function NodeStyleToolbar({ nodeId, data }: NodeStyleToolbarProps) {
  const { updateNodeData } = useReactFlow();
  const { emitNodeUpdate } = useMindMapSocketContext();

  const currentShape: NodeShape = data.shape ?? 'rectangle';
  const currentPriority: NodePriority = data.priority ?? 'default';

  const update = (patch: Partial<MindMapNodeData>) => {
    updateNodeData(nodeId, { ...data, ...patch });
    emitNodeUpdate(nodeId, patch);
  };

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-50
                 flex items-center gap-1 px-2 py-1.5
                 bg-popover border border-border rounded-lg shadow-xl
                 whitespace-nowrap"
      // Stop ReactFlow from treating clicks on the toolbar as node drags
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      {/* Divider label */}
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider pr-1">Shape</span>

      {SHAPES.map(({ value, icon, label }) => (
        <button
          key={value}
          title={label}
          onClick={() => update({ shape: value })}
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded transition-colors',
            currentShape === value
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground',
          )}
        >
          {icon}
        </button>
      ))}

      <div className="w-px h-4 bg-border mx-1" />

      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider pr-1">Priority</span>

      {PRIORITIES.map(({ value, color, icon, label }) => (
        <button
          key={value}
          title={label}
          onClick={() => update({ priority: value })}
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded transition-all',
            currentPriority === value ? 'ring-2 ring-offset-1 ring-offset-popover scale-110' : 'hover:scale-105',
          )}
          style={{
            backgroundColor: color + '22',
            color,
            ...(currentPriority === value ? { ringColor: color } : {}),
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
