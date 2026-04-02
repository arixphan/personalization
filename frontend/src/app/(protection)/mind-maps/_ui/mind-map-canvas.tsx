'use client';

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MindMapNode } from './mind-map-node';
import { MindMapContextMenu } from './mind-map-context-menu';
import { BRANCH_COLORS, MindMapNodeData } from './mind-map-types';
import { useMindMapSocket } from './use-mind-map-socket';
import { MindMapSocketProvider } from './mind-map-socket-context';

const nodeTypes = { mindmap: MindMapNode };
const nodeOrigin: [number, number] = [0.5, 0];
const deleteKeyCodes = ['Backspace', 'Delete'];
const getMiniMapNodeColor = (node: Node) => (node.data as MindMapNodeData).branchColor ?? '#94a3b8';

// ---------------------------------------------------------------------------
// Branch coloring utility
// ---------------------------------------------------------------------------

/**
 * Computes a map of node and edge colors using BFS from root nodes.
 */
function computeColorAssignments(nodes: Node[], edges: Edge[]) {
  const children = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  nodes.forEach(n => { children.set(n.id, []); inDegree.set(n.id, 0); });
  edges.forEach(e => {
    children.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  });

  const roots = nodes.filter(n => (inDegree.get(n.id) ?? 0) === 0);
  const nodeColor = new Map<string, string>();
  const queue: { id: string; color: string | null }[] = roots.map(r => ({ id: r.id, color: null }));
  let branchIndex = 0;

  while (queue.length > 0) {
    const { id, color } = queue.shift()!;
    let assignedColor = color ?? '#64748b';
    nodeColor.set(id, assignedColor);

    (children.get(id) ?? []).forEach(childId => {
      let childColor = color === null ? BRANCH_COLORS[branchIndex++ % BRANCH_COLORS.length] : assignedColor;
      queue.push({ id: childId, color: childColor });
    });
  }

  return nodeColor;
}

// ---------------------------------------------------------------------------

interface MindMapCanvasProps {
  mindMapId: number;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

interface ContextMenuState {
  nodeId: string;
  x: number;
  y: number;
}

export const MindMapCanvas = React.memo(function MindMapCanvas({
  mindMapId,
  initialNodes = [],
  initialEdges = [],
}: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { theme, resolvedTheme } = useTheme();
  const { screenToFlowPosition, deleteElements } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- WebSocket Integration ---
  const handleNodeMoved = useCallback(({ nodeId, position }: { nodeId: string; position: { x: number; y: number } }) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, position } : n));
  }, [setNodes]);

  const handleNodeUpdated = useCallback(({ nodeId, data: updateData }: { nodeId: string; data: any }) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? {
      ...n,
      data: { ...n.data, ...updateData },
      width: updateData.width ?? n.width,
      height: updateData.height ?? n.height
    } : n));
  }, [setNodes]);

  const handleNodeAdded = useCallback((node: any) => {
    setNodes(nds => nds.some(n => n.id === node.id) ? nds : nds.concat(node));
  }, [setNodes]);

  const handleNodeRemoved = useCallback(({ nodeId }: { nodeId: string }) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleEdgeAdded = useCallback((edge: any) => {
    setEdges(eds => eds.some(e => e.id === edge.id) ? eds : eds.concat(edge));
  }, [setEdges]);

  const handleEdgeRemoved = useCallback(({ edgeId }: { edgeId: string }) => {
    setEdges(eds => eds.filter(e => e.id !== edgeId));
  }, [setEdges]);

  const { emitNodeMove, emitNodeSave, emitNodeUpdate, emitNodeAdd, emitEdgeAdd, emitNodeRemove, emitEdgeRemove } = useMindMapSocket({
    mindMapId,
    onNodeMoved: handleNodeMoved,
    onNodeUpdated: handleNodeUpdated,
    onNodeAdded: handleNodeAdded,
    onNodeRemoved: handleNodeRemoved,
    onEdgeAdded: handleEdgeAdded,
    onEdgeRemoved: handleEdgeRemoved,
  });

  const lastEmitTimeRef = useRef(0);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      // Throttle movement sync to ~30fps (32ms) to reduce lag
      const now = Date.now();
      if (now - lastEmitTimeRef.current > 32) {
        changes.forEach(change => {
          if (change.type === 'position' && change.position) {
            emitNodeMove(change.id, change.position);
          }
        });
        lastEmitTimeRef.current = now;
      }
    },
    [onNodesChange, emitNodeMove],
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      // Persist the final position to the database only when the drag ends
      emitNodeSave(node.id, node.position);
    },
    [emitNodeSave],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      // Edge deletions can be added here if needed
    },
    [onEdgesChange],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdgeId = crypto.randomUUID();
      const edge = {
        id: newEdgeId,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      };

      emitEdgeAdd(edge); // Sync new connection outside of updater

      setEdges(eds => addEdge({ ...params, id: newEdgeId }, eds));
    },
    [setEdges, emitEdgeAdd],
  );

  const onConnectEnd = useCallback(
    (event: any, connectionState: any) => {
      if (!connectionState.isValid) {
        const id = crypto.randomUUID();
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;

        const newNode: Node = {
          id,
          type: 'mindmap',
          position: screenToFlowPosition({ x: clientX, y: clientY }),
          data: { label: 'New Idea', width: 150, height: 50 },
          width: 150,
          height: 50,
          origin: [0.5, 0.0],
        };

        const isFromTarget = connectionState.fromHandle.type === 'target';

        let targetHandle = 'target-top';
        if (connectionState.fromHandle.id.includes('left')) targetHandle = 'target-right';
        else if (connectionState.fromHandle.id.includes('right')) targetHandle = 'target-left';
        else if (connectionState.fromHandle.id.includes('bottom')) targetHandle = 'target-top';
        else if (connectionState.fromHandle.id.includes('top')) targetHandle = 'target-bottom';

        const newEdge: Edge = {
          id: crypto.randomUUID(),
          source: isFromTarget ? id : connectionState.fromNode.id,
          sourceHandle: isFromTarget ? 'source-bottom' : connectionState.fromHandle.id,
          target: isFromTarget ? connectionState.fromNode.id : id,
          targetHandle: isFromTarget ? connectionState.fromHandle.id : targetHandle,
        };

        setNodes(nds => nds.concat(newNode));
        setEdges(eds => eds.concat(newEdge));
        emitNodeAdd(newNode);
        emitEdgeAdd(newEdge);
      }
    },
    [screenToFlowPosition, setNodes, setEdges, emitNodeAdd, emitEdgeAdd],
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      let remainingNodes = [...nodes];

      // Execute the emissions outside the state updater
      deleted.forEach(node => {
        emitNodeRemove(node.id); // Broadcast removal
      });

      setEdges(acc => {
        const result = deleted.reduce((edgeAcc, node) => {
          const incomers = getIncomers(node, remainingNodes, edgeAcc);
          const outgoers = getOutgoers(node, remainingNodes, edgeAcc);
          const connectedEdges = getConnectedEdges([node], edgeAcc);
          const remainingEdges = edgeAcc.filter(e => !connectedEdges.includes(e));
          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `edge_${source}_${target}`,
              source,
              target,
              targetHandle: 'target-top',
            })),
          );
          remainingNodes = remainingNodes.filter(rn => rn.id !== node.id);
          return [...remainingEdges, ...createdEdges];
        }, acc);
        return result;
      });
    },
    [nodes, setEdges, emitNodeRemove],
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      deleted.forEach(edge => {
        emitEdgeRemove(edge.id);
      });
    },
    [emitEdgeRemove],
  );

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({ nodeId: node.id, x: event.clientX, y: event.clientY });
  }, []);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      const nodeToDelete = nodes.find(n => n.id === nodeId);
      if (nodeToDelete) {
        deleteElements({ nodes: [nodeToDelete] });
      }
    },
    [nodes, deleteElements],
  );

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    setContextMenu(null);

    // Detect double-click (event.detail counts sequential clicks)
    if (event.detail === 2) {
      event.preventDefault();
      event.stopPropagation();

      const id = crypto.randomUUID();
      const newNode: Node = {
        id,
        type: 'mindmap',
        position: screenToFlowPosition({ x: event.clientX, y: event.clientY }),
        data: { label: 'New Idea', width: 150, height: 50 },
        width: 150,
        height: 50,
        origin: [0.5, 0.0],
      };

      setNodes(nds => nds.concat(newNode));
      emitNodeAdd(newNode); // Sync new node
    }
  }, [screenToFlowPosition, setNodes, emitNodeAdd]);

  // Compute branch colors periodically via useEffect rather than intercepting the render loop!
  useEffect(() => {
    if (nodes.length === 0) return;
    const nodeColor = computeColorAssignments(nodes, edges);

    setNodes(nds => {
      let modified = false;
      const updated = nds.map(n => {
        const branchColor = nodeColor.get(n.id) ?? '#64748b';
        if (n.type === 'mindmap' && (n.data as MindMapNodeData).branchColor === branchColor) return n;
        modified = true;
        return { ...n, type: 'mindmap', data: { ...n.data, branchColor } };
      });
      return modified ? updated : nds;
    });

    setEdges(eds => {
      let modified = false;
      const updated = eds.map(e => {
        const color = nodeColor.get(e.target) ?? nodeColor.get(e.source) ?? '#64748b';
        const isSelected = e.selected;
        const strokeWidth = isSelected ? 4 : 2;
        const opacity = isSelected ? 1 : 0.7;

        const currentStyle = e.style as any;
        if (currentStyle?.stroke === color && currentStyle?.strokeWidth === strokeWidth && currentStyle?.opacity === opacity) {
          return e;
        }

        modified = true;
        return {
          ...e,
          style: {
            ...(e.style ?? {}),
            stroke: color,
            strokeWidth,
            opacity,
          },
        };
      });
      return modified ? updated : eds;
    });
  }, [nodes.length, edges, setNodes, setEdges]); // Only recompute on topology changes!

  const colorMode = resolvedTheme === 'dark' ? 'dark' : 'light';

  return (
    <MindMapSocketProvider value={{ emitNodeMove, emitNodeSave, emitNodeUpdate, emitNodeAdd, emitEdgeAdd, emitNodeRemove, emitEdgeRemove }}>
      <div style={{ width: '100%', height: 'calc(100vh - 120px)' }} className="relative group">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onNodesDelete={onNodesDelete}
          onNodeDragStop={onNodeDragStop}
          onEdgesChange={handleEdgesChange}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          nodeOrigin={nodeOrigin}
          fitView
          deleteKeyCode={deleteKeyCodes}
          colorMode={colorMode}
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={getMiniMapNodeColor}
            maskColor="rgba(0,0,0,0.05)"
          />
        </ReactFlow>

        {/* Context menu */}
        {contextMenu && (
          <MindMapContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            nodeId={contextMenu.nodeId}
            onDelete={handleDeleteNode}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    </MindMapSocketProvider>
  );
});
