'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow, Edge } from '@xyflow/react';
import { FileText, Network } from 'lucide-react';
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
  const { updateNodeData, getNodes, setNodes, getEdges, getViewport } = useReactFlow();
  const { emitNodeUpdate, emitNodeMove, emitNodeSave, emitNodesMove, emitNodesSave } = useMindMapSocketContext();

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

  // ── Group Dragging Logic ──────────────────────────────────────────────────
  const getDescendants = useCallback((nodeId: string, edges: Edge[]): string[] => {
    const children = edges.filter(e => e.source === nodeId).map(e => e.target);
    let descendants = [...children];
    for (const child of children) {
      descendants.push(...getDescendants(child, edges));
    }
    return Array.from(new Set(descendants));
  }, []);

  const lastEmitTimeRef = useRef(0);

  const onGroupDragPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const target = e.target as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const edges = getEdges();
    const descendants = getDescendants(id, edges);
    const nodesToMove = [id, ...descendants];
    
    const nodes = getNodes();
    const initialPositions: Record<string, {x: number, y: number}> = {};
    nodes.forEach(n => {
      if (nodesToMove.includes(n.id)) {
        initialPositions[n.id] = { ...n.position };
      }
    });

    const startX = e.clientX;
    const startY = e.clientY;
    
    let animationFrameId: number;

    const onPointerMove = (evt: PointerEvent) => {
      const zoom = getViewport().zoom;
      const dx = (evt.clientX - startX) / zoom;
      const dy = (evt.clientY - startY) / zoom;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
      animationFrameId = requestAnimationFrame(() => {
          const now = Date.now();
          const shouldEmit = now - lastEmitTimeRef.current > 32;
          
          const bulkMoves: { nodeId: string; position: { x: number; y: number } }[] = [];

          setNodes(nds => nds.map(n => {
            if (nodesToMove.includes(n.id)) {
              const newPos = {
                x: initialPositions[n.id].x + dx,
                y: initialPositions[n.id].y + dy,
              };
              if (shouldEmit) {
                bulkMoves.push({ nodeId: n.id, position: newPos });
              }
              return { ...n, position: newPos };
            }
            return n;
          }));

          if (shouldEmit) {
            if (bulkMoves.length > 0) emitNodesMove(bulkMoves);
            lastEmitTimeRef.current = now;
          }
      });
    };

    const onPointerUp = (evt: PointerEvent) => {
      target.releasePointerCapture(evt.pointerId);
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerup', onPointerUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      const zoom = getViewport().zoom;
      const dx = (evt.clientX - startX) / zoom;
      const dy = (evt.clientY - startY) / zoom;
      
      const bulkSaves: { nodeId: string; position: { x: number; y: number } }[] = [];

      nodesToMove.forEach(nid => {
        const finalPos = {
          x: initialPositions[nid].x + dx,
          y: initialPositions[nid].y + dy,
        };
        bulkSaves.push({ nodeId: nid, position: finalPos });
      });

      if (bulkSaves.length > 0) emitNodesSave(bulkSaves);
    };

    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUp);
  }, [id, getDescendants, getNodes, setNodes, getEdges, getViewport, emitNodesMove, emitNodesSave]);

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
          'relative w-full h-full flex flex-col items-center justify-center group',
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
        <div className={cn(
          "relative z-10 flex flex-col w-full h-full min-h-0 overflow-hidden",
          !hasContent ? "items-center justify-center" : "items-start"
        )}>
          {/* Label / Title Area */}
          <div className={cn(
            "w-full px-3 py-2 flex flex-col items-center justify-center min-h-0 shrink-0",
            !hasContent ? "h-full" : "border-b border-border/40"
          )}>
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
          </div>

          {/* Description Area (Markdown preview) */}
          {useMemo(() => {
            if (!hasContent || shape === 'diamond') return null;
            return (
              <div className="flex-1 w-full p-2 overflow-y-auto min-h-0 text-left">
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
              'absolute bottom-1 right-1 z-20 p-0.5 rounded transition-colors',
              hasContent
                ? 'text-primary opacity-80 hover:opacity-100'
                : 'text-muted-foreground opacity-20 hover:opacity-100',
            )}
          >
            <FileText className="h-3 w-3" />
          </button>
        )}

        {/* ── Group drag icon button ── */}
        <button
          title="Move with children"
          onPointerDown={onGroupDragPointerDown}
          className={cn(
            'absolute -top-4 -right-4 z-30 p-1.5 rounded-full bg-background border border-border/40 text-muted-foreground shadow-sm hover:text-foreground transition-colors cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100',
            selected && 'opacity-100'
          )}
        >
          <Network className="h-3.5 w-3.5" />
        </button>
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
