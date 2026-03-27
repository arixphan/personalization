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

const nodeTypes = { mindmap: MindMapNode };
const nodeOrigin: [number, number] = [0.5, 0];

interface MindMapCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => Promise<void> | void;
}

interface ContextMenuState {
  nodeId: string;
  x: number;
  y: number;
}

export function MindMapCanvas({
  initialNodes = [],
  initialEdges = [],
  onSave,
}: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition, deleteElements } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Debounced auto-save: 1.5 s after any change
  const scheduleSave = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setIsDirty(true);
      saveTimerRef.current = setTimeout(async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
          await onSave(currentNodes, currentEdges);
        } finally {
          setIsSaving(false);
          setIsDirty(false);
        }
      }, 1500);
    },
    [onSave],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      // Skip dimension-only changes (caused by NodeResizer initialisation)
      const meaningful = changes.some(c => c.type !== 'dimensions' && c.type !== 'select');
      if (meaningful) {
        setNodes(nds => {
          scheduleSave(nds, edges);
          return nds;
        });
      }
    },
    [onNodesChange, edges, scheduleSave, setNodes],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      const meaningful = changes.some(c => c.type !== 'select');
      if (meaningful) {
        setEdges(eds => {
          scheduleSave(nodes, eds);
          return eds;
        });
      }
    },
    [onEdgesChange, nodes, scheduleSave, setEdges],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(eds => {
        const newEdges = addEdge(params, eds);
        scheduleSave(nodes, newEdges);
        return newEdges;
      });
    },
    [setEdges, nodes, scheduleSave],
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
        
        // Pick a logical counterpart handle
        let targetHandle = 'target-top'; // default
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
            scheduleSave(updated, updatedEdges);
            return updatedEdges;
          });
          return updated;
        });
      }
    },
    [screenToFlowPosition, setNodes, setEdges, scheduleSave],
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
          return [...remainingEdges, ...createdEdges];
        }, acc);
        scheduleSave(remainingNodes, result);
        return result;
      });
    },
    [nodes, setEdges, scheduleSave],
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

  const processedNodes = useMemo(
    () => nodes.map(n => ({ ...n, type: 'mindmap' })),
    [nodes],
  );

  const handleManualSave = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setIsSaving(true);
    try {
      await onSave?.(nodes, edges);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 120px)' }} className="relative">
      <ReactFlow
        nodes={processedNodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={() => setContextMenu(null)}
        nodeTypes={nodeTypes}
        nodeOrigin={nodeOrigin}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {/* Status + Save button */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        {isDirty && !isSaving && (
          <span className="text-xs text-muted-foreground italic">Unsaved changes</span>
        )}
        {isSaving && (
          <span className="text-xs text-muted-foreground italic">Saving…</span>
        )}
        <button
          onClick={handleManualSave}
          disabled={isSaving}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-md text-sm font-medium disabled:opacity-60 hover:bg-primary/90 transition-colors"
        >
          Save
        </button>
      </div>

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
  );
}
