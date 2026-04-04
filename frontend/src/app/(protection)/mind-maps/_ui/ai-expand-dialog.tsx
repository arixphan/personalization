'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Sparkles, X, Check, RefreshCw, AlertCircle, GitBranch,
  Send, Bot, Loader2, ChevronRight,
} from 'lucide-react';
import {
  Node, Edge, ReactFlow, ReactFlowProvider, Background,
  Handle, Position, NodeProps,
} from '@xyflow/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { MindMapNodeData, BRANCH_COLORS } from './mind-map-types';

// ============================================================================
// Public types (exported so canvas can use AiTreeNode)
// ============================================================================

export interface AiTreeNode {
  id: string;
  data: { label: string; content?: string };
  children: AiTreeNode[];
}

export interface FlatPreviewNode {
  id: string;
  position: { x: number; y: number };
  data: { label: string; content?: string; branchColor: string };
}

export interface FlatPreviewEdge {
  id: string;
  source: string;
  target: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type DialogStage = 'input' | 'loading' | 'preview' | 'error';

interface AiExpandDialogProps {
  mindMapId: number;
  nodeId: string;
  nodeLabel: string;
  nodes: Node[];
  edges: Edge[];
  onAccept: (flatNodes: FlatPreviewNode[], flatEdges: FlatPreviewEdge[]) => void;
  onClose: () => void;
}

// ============================================================================
// Tree layout — converts nested AiTreeNode[] to flat ReactFlow positions
// ============================================================================

const PREVIEW_NODE_W = 180;
const H_GAP = 48;
const V_GAP = 150;

function subtreeWidth(nodes: AiTreeNode[]): number {
  if (!nodes.length) return 0;
  return nodes.reduce((sum, n, i) => {
    const w = n.children.length ? subtreeWidth(n.children) : PREVIEW_NODE_W;
    return sum + Math.max(PREVIEW_NODE_W, w) + (i > 0 ? H_GAP : 0);
  }, 0);
}

function layoutLevel(
  nodes: AiTreeNode[],
  parentId: string,
  centerX: number,
  y: number,
  colorOffset: number,
  result: { nodes: FlatPreviewNode[]; edges: FlatPreviewEdge[] },
) {
  const totalW = nodes.reduce((sum, n, i) => {
    return sum + Math.max(PREVIEW_NODE_W, n.children.length ? subtreeWidth(n.children) : PREVIEW_NODE_W) + (i > 0 ? H_GAP : 0);
  }, 0);
  let x = centerX - totalW / 2;

  nodes.forEach((node, i) => {
    const myW = Math.max(PREVIEW_NODE_W, node.children.length ? subtreeWidth(node.children) : PREVIEW_NODE_W);
    const nodeCenterX = x + myW / 2;
    const color = BRANCH_COLORS[(colorOffset + i) % BRANCH_COLORS.length];

    result.nodes.push({
      id: node.id,
      position: { x: nodeCenterX - PREVIEW_NODE_W / 2, y },
      data: { label: node.data.label, content: node.data.content, branchColor: color },
    });
    result.edges.push({ id: `e-${parentId}-${node.id}`, source: parentId, target: node.id });

    if (node.children.length) {
      layoutLevel(node.children, node.id, nodeCenterX, y + V_GAP, colorOffset + i + 1, result);
    }
    x += myW + H_GAP;
  });
}

export function flattenAiTree(
  tree: AiTreeNode[],
  anchorId: string,
): { nodes: FlatPreviewNode[]; edges: FlatPreviewEdge[] } {
  const result = { nodes: [] as FlatPreviewNode[], edges: [] as FlatPreviewEdge[] };
  layoutLevel(tree, anchorId, 0, V_GAP, 0, result);
  return result;
}

export function countTreeNodes(tree: AiTreeNode[]): number {
  return tree.reduce((acc, n) => acc + 1 + countTreeNodes(n.children), 0);
}

// ============================================================================
// Preview ReactFlow node components
// ============================================================================

function AiAnchorNode({ data }: NodeProps) {
  const d = data as { label: string; branchColor?: string };
  return (
    <div
      className="px-4 py-2.5 rounded-xl border-2 bg-background shadow-sm text-center"
      style={{ borderColor: d.branchColor ?? '#6366f1', minWidth: 160 }}
    >
      <div className="text-sm font-bold leading-tight">{d.label}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">Source node</div>
      <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ opacity: 0 }} />
    </div>
  );
}

function AiChildNode({ data }: NodeProps) {
  const d = data as { label: string; content?: string; branchColor?: string };
  const color = d.branchColor ?? '#64748b';
  return (
    <div
      className="rounded-lg border bg-background shadow-sm overflow-hidden"
      style={{ borderColor: color, minWidth: 140, maxWidth: 180 }}
    >
      <div className="h-0.5" style={{ background: color }} />
      <div className="px-3 py-2">
        <div className="text-[11px] font-semibold leading-tight">{d.label}</div>
        {d.content && (
          <div className="text-[10px] text-muted-foreground mt-1 leading-snug line-clamp-2">
            {d.content}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Top} id="target-top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ opacity: 0 }} />
    </div>
  );
}

// Stable outside component to prevent ReactFlow remounts
const PREVIEW_NODE_TYPES = { 'ai-anchor': AiAnchorNode, 'ai-child': AiChildNode };
const ANCHOR_ID = '__preview_anchor__';

// ============================================================================
// Mini ReactFlow preview canvas
// ============================================================================

interface PreviewCanvasProps {
  anchorLabel: string;
  anchorColor: string;
  tree: AiTreeNode[];
  colorMode: 'light' | 'dark';
}

function PreviewCanvas({ anchorLabel, anchorColor, tree, colorMode }: PreviewCanvasProps) {
  const { nodes: flatNodes, edges: flatEdges } = useMemo(
    () => flattenAiTree(tree, ANCHOR_ID),
    [tree],
  );

  const rfNodes: Node[] = useMemo(() => [
    {
      id: ANCHOR_ID,
      type: 'ai-anchor',
      position: { x: -90, y: 0 },
      data: { label: anchorLabel, branchColor: anchorColor },
      width: 180,
      height: 56,
    },
    ...flatNodes.map(n => ({
      id: n.id,
      type: 'ai-child',
      position: n.position,
      data: n.data,
      width: PREVIEW_NODE_W,
      height: n.data.content ? 78 : 46,
    })),
  ], [flatNodes, anchorLabel, anchorColor]);

  const rfEdges: Edge[] = useMemo(() =>
    flatEdges.map(e => {
      const src = e.source === ANCHOR_ID ? anchorColor : flatNodes.find(n => n.id === e.source)?.data.branchColor ?? anchorColor;
      return {
        ...e,
        style: { stroke: src, strokeWidth: 2, opacity: 0.65 },
        sourceHandle: 'source-bottom',
        targetHandle: 'target-top',
      };
    }),
    [flatEdges, flatNodes, anchorColor],
  );

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={PREVIEW_NODE_TYPES}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        fitView
        fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
        minZoom={0.15}
        maxZoom={1.5}
        colorMode={colorMode}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} size={1} />
      </ReactFlow>
    </ReactFlowProvider>
  );
}

// ============================================================================
// Skeleton loading animation
// ============================================================================

function SkeletonTree() {
  return (
    <div className="h-full flex flex-col items-center pt-10 gap-6 opacity-50 pointer-events-none select-none">
      <div className="w-40 h-10 rounded-xl bg-muted animate-pulse" />
      <div className="flex gap-5 items-start">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="w-px h-8 bg-border" />
            <div className="w-36 h-14 rounded-lg bg-muted animate-pulse" style={{ animationDelay: `${i * 120}ms` }} />
            {i === 1 && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-px h-5 bg-border" />
                <div className="flex gap-3">
                  {[0, 1].map(j => (
                    <div key={j} className="w-28 h-10 rounded-lg bg-muted/60 animate-pulse" style={{ animationDelay: `${(i + j + 2) * 120}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Chat panel
// ============================================================================

interface ChatPanelProps {
  chatHistory: ChatMessage[];
  isRefining: boolean;
  onSend: (msg: string) => void;
}

function ChatPanel({ chatHistory, isRefining, onSend }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isRefining) return;
    onSend(trimmed);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="shrink-0 px-4 py-3 border-b border-border flex items-center gap-2 bg-muted/30">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-xs font-semibold">Collaborate with AI</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'text-xs p-2.5 rounded-xl leading-relaxed break-words',
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground ml-4 rounded-br-sm'
                : 'bg-muted mr-4 rounded-bl-sm',
            )}
          >
            {msg.content}
          </div>
        ))}
        {isRefining && (
          <div className="bg-muted mr-4 rounded-xl rounded-bl-sm p-2.5 flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Updating…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-border">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask to modify the preview…"
            rows={2}
            disabled={isRefining}
            className="flex-1 text-xs bg-muted border border-border rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60 disabled:opacity-50 transition-shadow"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isRefining}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
          Try: "add more depth", "simplify to 3 nodes", "add descriptions to all nodes"
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// API helpers
// ============================================================================

async function fetchExpansion(
  mindMapId: number, nodeId: string, nodes: Node[], edges: Edge[], userContext: string,
): Promise<{ newNodes: AiTreeNode[] }> {
  const res = await fetch(`/api/mind-maps/${mindMapId}/expand`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      nodeId,
      context: {
        nodes: nodes.map(n => ({ id: n.id, data: n.data })),
        edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
      },
      userContext: userContext.trim() || undefined,
    }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? `HTTP ${res.status}`);
  return res.json();
}

async function fetchRefine(
  mindMapId: number, currentTree: AiTreeNode[],
  chatHistory: ChatMessage[], userMessage: string, parentNodeLabel: string,
): Promise<{ updatedTree: AiTreeNode[]; assistantReply: string }> {
  const res = await fetch(`/api/mind-maps/${mindMapId}/refine-preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ currentTree, chatHistory, userMessage, parentNodeLabel }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? `HTTP ${res.status}`);
  return res.json();
}

// ============================================================================
// Main dialog
// ============================================================================

export function AiExpandDialog({
  mindMapId, nodeId, nodeLabel, nodes, edges, onAccept, onClose,
}: AiExpandDialogProps) {
  const { resolvedTheme } = useTheme();
  const colorMode = resolvedTheme === 'dark' ? 'dark' : 'light';

  const [stage, setStage] = useState<DialogStage>('input');
  const [userContext, setUserContext] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [tree, setTree] = useState<AiTreeNode[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isRefining, setIsRefining] = useState(false);

  const sourceNode = nodes.find(n => n.id === nodeId);
  const anchorColor = (sourceNode?.data as MindMapNodeData)?.branchColor ?? '#6366f1';

  const handleGenerate = useCallback(async () => {
    setStage('loading');
    setErrorMsg('');
    try {
      const data = await fetchExpansion(mindMapId, nodeId, nodes, edges, userContext);
      if (!data.newNodes?.length) throw new Error('AI returned no nodes. Try rephrasing.');
      setTree(data.newNodes);
      const n = countTreeNodes(data.newNodes);
      setChatHistory([{
        role: 'assistant',
        content: `I've expanded "${nodeLabel}" with ${n} nodes across multiple levels. Each node has a description. Ask me to refine anything!`,
      }]);
      setStage('preview');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Something went wrong.');
      setStage('error');
    }
  }, [mindMapId, nodeId, nodes, edges, userContext, nodeLabel]);

  const handleRefine = useCallback(async (message: string) => {
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setIsRefining(true);
    try {
      const data = await fetchRefine(mindMapId, tree, chatHistory, message, nodeLabel);
      setTree(data.updatedTree);
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.assistantReply }]);
    } catch (err: any) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: `Sorry, I couldn't process that. ${err.message || 'Please try again.'}` }]);
    } finally {
      setIsRefining(false);
    }
  }, [mindMapId, tree, chatHistory, nodeLabel]);

  const handleAccept = useCallback(() => {
    const { nodes: flatNodes, edges: flatEdges } = flattenAiTree(tree, nodeId);
    onAccept(flatNodes, flatEdges);
    onClose();
  }, [tree, nodeId, onAccept, onClose]);

  const handleRestart = useCallback(() => {
    setTree([]); setChatHistory([]); setStage('input');
  }, []);

  const canAccept = stage === 'preview' && tree.length > 0 && !isRefining;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-5xl bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: 'min(88vh, 780px)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">AI Mind Map Expansion</h2>
                <p className="text-xs text-muted-foreground">
                  Expanding: <span className="font-medium text-foreground">{nodeLabel}</span>
                  {stage === 'preview' && (
                    <span className="ml-2 text-primary font-medium">· {countTreeNodes(tree)} nodes</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {stage === 'preview' && (
                <button onClick={handleRestart} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors">
                  <RefreshCw className="h-3 w-3" /> Restart
                </button>
              )}
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Body: split panel ── */}
          <div className="flex-1 flex min-h-0">

            {/* Left: canvas / input / loading / error */}
            <div className="flex-1 min-w-0 relative border-r border-border">

              {stage === 'input' && (
                <div className="h-full flex flex-col items-center justify-center p-8">
                  <div className="w-full max-w-md space-y-4">
                    <div className="text-center space-y-1 mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${anchorColor}20`, border: `2px solid ${anchorColor}40` }}>
                        <Sparkles className="h-5 w-5" style={{ color: anchorColor }} />
                      </div>
                      <h3 className="font-semibold">Describe what to explore</h3>
                      <p className="text-xs text-muted-foreground">
                        AI generates a nested mind map with descriptions for each node
                      </p>
                    </div>
                    <textarea
                      value={userContext}
                      onChange={e => setUserContext(e.target.value)}
                      placeholder={`What aspects of "${nodeLabel}" to explore? (optional)`}
                      rows={4}
                      autoFocus
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60 transition-shadow"
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleGenerate(); } }}
                    />
                    <div className="flex gap-3">
                      <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-border hover:bg-muted transition-colors">Cancel</button>
                      <button onClick={handleGenerate} className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium">
                        <Sparkles className="h-3.5 w-3.5" /> Generate
                      </button>
                    </div>
                    <p className="text-[11px] text-center text-muted-foreground">⌘ Enter to generate</p>
                  </div>
                </div>
              )}

              {stage === 'loading' && (
                <div className="h-full flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-5 pt-5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    Building nested mind map with descriptions…
                  </div>
                  <SkeletonTree />
                </div>
              )}

              {stage === 'preview' && (
                <PreviewCanvas anchorLabel={nodeLabel} anchorColor={anchorColor} tree={tree} colorMode={colorMode} />
              )}

              {stage === 'error' && (
                <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
                  <div className="p-3 bg-destructive/10 rounded-full">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">Generation failed</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">{errorMsg}</p>
                  </div>
                  <button onClick={handleRestart} className="text-sm text-primary hover:underline flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> Try again
                  </button>
                </div>
              )}
            </div>

            {/* Right: tips / loading msg / chat */}
            <div className="w-80 shrink-0 flex flex-col overflow-hidden">
              {stage === 'input' && (
                <div className="h-full flex flex-col p-5 gap-3">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">What to expect</div>
                  {[
                    'Nested sub-topics (up to 2 levels deep)',
                    'Each node gets a short description',
                    'After generation, chat with AI to refine',
                    'Accept only when you\'re satisfied',
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <ChevronRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                  <div className="mt-auto p-3 rounded-xl border border-dashed border-border bg-muted/40 flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: anchorColor }} />
                    <GitBranch className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Expanding: <span className="font-medium text-foreground">{nodeLabel}</span></span>
                  </div>
                </div>
              )}
              {stage === 'loading' && (
                <div className="h-full flex flex-col items-center justify-center gap-3 p-5">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground text-center">Building nested structure<br />with descriptions…</p>
                </div>
              )}
              {stage === 'preview' && (
                <ChatPanel chatHistory={chatHistory} isRefining={isRefining} onSend={handleRefine} />
              )}
              {stage === 'error' && (
                <div className="h-full flex items-center justify-center p-5">
                  <p className="text-xs text-muted-foreground text-center">Adjust your prompt and try again.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 px-5 py-3.5 border-t border-border bg-background flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              {stage === 'preview' && `${countTreeNodes(tree)} nodes · descriptions included · preview only`}
            </p>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted transition-colors">
                {stage === 'preview' ? 'Discard' : 'Close'}
              </button>
              <button
                onClick={handleAccept}
                disabled={!canAccept}
                className={cn(
                  'px-4 py-2 text-sm rounded-xl font-medium flex items-center gap-2 transition-colors',
                  canAccept ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed',
                )}
              >
                <Check className="h-3.5 w-3.5" />
                Apply to Mind Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
