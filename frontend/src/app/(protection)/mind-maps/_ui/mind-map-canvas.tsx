'use client';

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
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

// ---------------------------------------------------------------------------
// Branch coloring utility
// ---------------------------------------------------------------------------

/**
 * BFS from the root (node with no incoming edges) to assign a branch color
 * to every node and a matching stroke to every edge.
 * Returns NEW node/edge arrays so React can detect the change.
 */
function applyBranchColors(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  if (nodes.length === 0) return { nodes, edges };

  // Build adjacency (source → target) and in-degree maps
  const children = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  nodes.forEach(n => { children.set(n.id, []); inDegree.set(n.id, 0); });
  edges.forEach(e => {
    children.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  });

  // Find root(s): nodes with no incoming edges
  const roots = nodes.filter(n => (inDegree.get(n.id) ?? 0) === 0);

  // BFS — assign colors
  const nodeColor = new Map<string, string>();
  const queue: { id: string; color: string | null }[] = roots.map(r => ({ id: r.id, color: null }));
  let branchIndex = 0;

  while (queue.length > 0) {
    const { id, color } = queue.shift()!;

    // Determine this node's color
    let assignedColor = color;
    if (assignedColor === null) {
      // This is a root; give it a neutral color
      assignedColor = '#64748b';
    }
    nodeColor.set(id, assignedColor);

    const kids = children.get(id) ?? [];
    kids.forEach((childId, idx) => {
      // Direct children of roots each get a unique branch color
      let childColor: string;
      if (color === null) {
        childColor = BRANCH_COLORS[branchIndex % BRANCH_COLORS.length];
        branchIndex++;
      } else {
        childColor = assignedColor!;
      }
      queue.push({ id: childId, color: childColor });
    });
  }

  const updatedNodes = nodes.map(n => {
    const branchColor = nodeColor.get(n.id) ?? '#64748b';
    const prevColor = (n.data as MindMapNodeData).branchColor;
    if (prevColor === branchColor) return n; // no change
    return { ...n, data: { ...n.data, branchColor } };
  });

  const updatedEdges = edges.map(e => {
    const color = nodeColor.get(e.target) ?? nodeColor.get(e.source) ?? '#64748b';
    const prevStroke = (e.style as React.CSSProperties | undefined)?.stroke;
    if (prevStroke === color) return e;
    return { ...e, style: { ...(e.style ?? {}), stroke: color, strokeWidth: 2 } };
  });

  return { nodes: updatedNodes, edges: updatedEdges };
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

export function MindMapCanvas({
  mindMapId,
  initialNodes = [],
  initialEdges = [],
}: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition, deleteElements } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- WebSocket Integration ---
  const handleNodeMoved = useCallback(({ nodeId, position }: { nodeId: string; position: { x: number; y: number } }) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, position } : n));
  }, [setNodes]);

  const handleNodeUpdated = useCallback(({ nodeId, data }: { nodeId: string; data: any }) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n));
  }, [setNodes]);

  const handleNodeAdded = useCallback((node: any) => {
    setNodes(nds => nds.concat(node));
  }, [setNodes]);

  const handleNodeRemoved = useCallback(({ nodeId }: { nodeId: string }) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleEdgeAdded = useCallback((edge: any) => {
    setEdges(eds => eds.concat(edge));
  }, [setEdges]);

  const { emitNodeMove, emitNodeSave, emitNodeUpdate, emitNodeAdd, emitEdgeAdd, emitNodeRemove } = useMindMapSocket({
    mindMapId,
    onNodeMoved: handleNodeMoved,
    onNodeUpdated: handleNodeUpdated,
    onNodeAdded: handleNodeAdded,
    onNodeRemoved: handleNodeRemoved,
    onEdgeAdded: handleEdgeAdded,
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
      setEdges(eds => {
        const newEdges = addEdge(params, eds);
        const addedEdge = newEdges[newEdges.length - 1];
        emitEdgeAdd(addedEdge); // Sync new connection
        return newEdges;
      });
    },
    [setEdges, emitEdgeAdd],
  );

  const onConnectEnd = useCallback(
    (event: any, connectionState: any) => {
      if (!connectionState.isValid) {
        const id = `node_${Date.now()}`;
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;

        const newNode: Node = {
          id,
          type: 'mindmap',
          position: screenToFlowPosition({ x: clientX, y: clientY }),
          data: { label: 'New Idea' },
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
          id: `edge_${Date.now()}`,
          source: isFromTarget ? id : connectionState.fromNode.id,
          sourceHandle: isFromTarget ? 'source-bottom' : connectionState.fromHandle.id,
          target: isFromTarget ? connectionState.fromNode.id : id,
          targetHandle: isFromTarget ? connectionState.fromHandle.id : targetHandle,
        };

        setNodes(nds => {
          const updated = nds.concat(newNode);
          setEdges(eds => {
            const updatedEdges = eds.concat(newEdge);
            return updatedEdges;
          });
          emitNodeAdd(newNode);
          emitEdgeAdd(newEdge);
          return updated;
        });
      }
    },
    [screenToFlowPosition, setNodes, setEdges, emitNodeAdd, emitEdgeAdd],
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      let remainingNodes = [...nodes];
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
          emitNodeRemove(node.id); // Broadcast removal
          return [...remainingEdges, ...createdEdges];
        }, acc);
        return result;
      });
    },
    [nodes, setEdges, emitNodeRemove],
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

      const id = `node_${Date.now()}`;
      const newNode: Node = {
        id,
        type: 'mindmap',
        position: screenToFlowPosition({ x: event.clientX, y: event.clientY }),
        data: { label: 'New Idea' },
        width: 150,
        height: 50,
        origin: [0.5, 0.0],
      };

      setNodes(nds => {
        const updated = nds.concat(newNode);
        emitNodeAdd(newNode); // Sync new node
        return updated;
      });
    }
  }, [screenToFlowPosition, setNodes, emitNodeAdd]);

  // Apply branch colors + force type = 'mindmap'
  const { nodes: coloredNodes, edges: coloredEdges } = useMemo(() => {
    const typed = nodes.map(n => ({ ...n, type: 'mindmap' }));
    return applyBranchColors(typed, edges);
  }, [nodes, edges]);


  return (
    <MindMapSocketProvider value={{ emitNodeMove, emitNodeSave, emitNodeUpdate, emitNodeAdd, emitEdgeAdd, emitNodeRemove }}>
      <div style={{ width: '100%', height: 'calc(100vh - 120px)' }} className="relative group">
        <ReactFlow
          nodes={coloredNodes}
          edges={coloredEdges}
          onNodesChange={handleNodesChange}
          onNodesDelete={onNodesDelete}
          onNodeDragStop={onNodeDragStop}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          nodeOrigin={nodeOrigin}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={node => (node.data as MindMapNodeData).branchColor ?? '#94a3b8'}
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
}
