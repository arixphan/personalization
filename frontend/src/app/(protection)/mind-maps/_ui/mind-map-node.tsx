'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import { FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { MindMapNodeData, NodeShape, PRIORITY_COLORS } from './mind-map-types';
import { NodeStyleToolbar } from './node-style-toolbar';
import { MarkdownEditorModal } from './markdown-editor-modal';
import { useMindMapSocketContext } from './mind-map-socket-context';

// Constant array to prevent ReactMarkdown from re-parsing on every render
const markdownPlugins = [remarkGfm];

// ---------------------------------------------------------------------------
// Shape background rendering
// ---------------------------------------------------------------------------

interface ShapeLayerProps {
  shape: NodeShape;
  borderColor: string;
}

/**
 * Renders ONLY the visual background / border of the node shape.
 * The outer ReactFlow wrapper div stays as a plain transparent rectangle
 * so that NodeResizer and Handle components work correctly in all shapes.
 */
function ShapeLayer({ shape, borderColor }: ShapeLayerProps) {
  if (shape === 'circle') {
    return (
      <div
        className="absolute inset-0 bg-background"
        style={{
          borderRadius: '9999px',
          border: `2px solid ${borderColor}`,
          transition: 'border-color 0.2s',
        }}
      />
    );
  }

  if (shape === 'diamond') {
    return (
      <>
        {/* Background fill — clip-path on a plain div so bg-background resolves correctly */}
        <div
          className="absolute inset-0 bg-background"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
        />
        {/* Border — SVG only, fill none, vectorEffect keeps stroke at any size */}
        <svg
          className="absolute inset-0 pointer-events-none overflow-visible"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polygon
            points="50,1 99,50 50,99 1,50"
            fill="none"
            stroke={borderColor}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </>
    );
  }

  // Default: rectangle
  return (
    <div
      className="absolute inset-0 bg-background"
      style={{
        borderRadius: '6px',
        border: `2px solid ${borderColor}`,
        transition: 'border-color 0.2s',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MindMapNode = React.memo(function MindMapNode({ id, data: rawData, selected }: NodeProps) {
  const data = rawData as MindMapNodeData;
  const { updateNodeData } = useReactFlow();
  const { emitNodeUpdate } = useMindMapSocketContext();

  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'New Idea');
  const [markdownOpen, setMarkdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setLabel(data.label || 'New Idea');
  }, [data.label]);

  const commitLabel = () => {
    const trimmed = label.trim() || 'New Idea';
    setLabel(trimmed);
    const updatedData = { ...data, label: trimmed };
    updateNodeData(id, updatedData);
    emitNodeUpdate(id, { label: trimmed });
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitLabel();
    if (e.key === 'Escape') {
      setLabel(data.label || 'New Idea');
      setEditing(false);
    }
  };

  const handleSaveMarkdown = (label: string, content: string) => {
    const updatedData = { ...data, label, content };
    updateNodeData(id, updatedData);
    emitNodeUpdate(id, { label, content });
    setLabel(label);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const shape: NodeShape = data.shape ?? 'rectangle';
  const branchColor: string = data.branchColor ?? '#64748b';
  const priority = data.priority ?? 'default';
  const borderColor = priority === 'default' ? branchColor : PRIORITY_COLORS[priority];

  const handleStyle = { background: borderColor, border: `1px solid ${borderColor}` };
  const hasContent = !!data.content?.trim();

  return (
    <>
      {/*
        Outer div: transparent bounding rectangle — ReactFlow uses this for
        resize handles and hit-testing. Never rotate or clip this element.
      */}
      <div
        className={cn(
          'relative w-full h-full flex flex-col items-center justify-center',
          'select-none outline-none',
        )}
        onDoubleClick={() => setEditing(true)}
      >
        {/* ── Visual shape layer (purely cosmetic) ── */}
        <ShapeLayer shape={shape} borderColor={borderColor} />

        {/* ── Resize handle ── */}
        <NodeResizer
          minWidth={40}
          minHeight={40}
          isVisible={selected}
          onResizeEnd={(_, params) => {
            const updatedData = { ...data, width: params.width, height: params.height };
            updateNodeData(id, updatedData);
            emitNodeUpdate(id, { width: params.width, height: params.height });
          }}
        />

        {/* ── Connection handles — at all 4 cardinal points ── */}
        <Handle type="target"  position={Position.Top}    id="target-top"    style={handleStyle} className="w-3 h-3 !border-0 z-10" />
        <Handle type="target"  position={Position.Left}   id="target-left"   style={{ ...handleStyle, opacity: 0.5 }} className="w-2 h-2 !border-0 z-10" />
        <Handle type="target"  position={Position.Right}  id="target-right"  style={{ ...handleStyle, opacity: 0.5 }} className="w-2 h-2 !border-0 z-10" />
        <Handle type="target"  position={Position.Bottom} id="target-bottom" style={{ ...handleStyle, opacity: 0.5 }} className="w-2 h-2 !border-0 z-10" />

        <Handle type="source"  position={Position.Bottom} id="source-bottom" style={handleStyle} className="w-3 h-3 !border-0 z-10" />
        <Handle type="source"  position={Position.Left}   id="source-left"   style={{ ...handleStyle, opacity: 0.5 }} className="w-2 h-2 !border-0 z-10" />
        <Handle type="source"  position={Position.Right}  id="source-right"  style={{ ...handleStyle, opacity: 0.5 }} className="w-2 h-2 !border-0 z-10" />
        <Handle type="source"  position={Position.Top}    id="source-top"    style={{ ...handleStyle, opacity: 0.5 }} className="w-2 h-2 !border-0 z-10" />

        {/* ── Node content (always upright, above the shape layer) ── */}
        <div className="relative z-10 flex flex-col items-center gap-1 px-3 py-2 w-full max-h-full overflow-hidden">
          {/* Label */}
          {editing ? (
            <input
              ref={inputRef}
              value={label}
              onChange={e => setLabel(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={handleKeyDown}
              className="text-sm font-semibold w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div className="text-sm font-semibold text-center leading-tight break-words whitespace-normal w-full">{label}</div>
          )}

          {/* Markdown preview (not shown for diamond to keep it compact) */}
          {useMemo(() => {
            if (!hasContent || shape === 'diamond') return null;
            return (
              <div className="w-full border-t border-border/40 mt-1 pt-1 max-h-28 overflow-y-auto text-left">
                <div className="prose prose-xs dark:prose-invert max-w-none text-[11px] leading-snug break-words whitespace-normal [&_p]:my-0.5 [&_ul]:my-0.5 [&_h1]:text-xs [&_h2]:text-xs [&_h3]:text-xs">
                  <ReactMarkdown remarkPlugins={markdownPlugins}>{data.content!}</ReactMarkdown>
                </div>
              </div>
            );
          }, [hasContent, shape, data.content])}
        </div>

        {/* ── Note icon button ── */}
        {shape !== 'diamond' && (
          <button
            title={hasContent ? 'Edit note' : 'Add note'}
            onClick={e => { e.stopPropagation(); setMarkdownOpen(true); }}
            onMouseDown={e => e.stopPropagation()}
            className={cn(
              'absolute bottom-1 right-1 z-10 p-0.5 rounded transition-colors',
              hasContent
                ? 'text-primary opacity-80 hover:opacity-100'
                : 'text-muted-foreground opacity-0 hover:opacity-100',
            )}
          >
            <FileText className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* ── Style toolbar (when selected) ── */}
      {selected && !markdownOpen && (
        <NodeStyleToolbar nodeId={id} data={data} />
      )}

      {/* ── Markdown editor modal ── */}
      <MarkdownEditorModal
        open={markdownOpen}
        initialContent={data.content ?? ''}
        nodeLabel={label}
        onSave={handleSaveMarkdown}
        onClose={() => setMarkdownOpen(false)}
      />
    </>
  );
});
