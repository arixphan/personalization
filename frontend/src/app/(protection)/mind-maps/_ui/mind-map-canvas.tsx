'use client';

import React, { useCallback, useMemo } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MindMapNode } from './mind-map-node';

const nodeTypes = {
  mindmap: MindMapNode,
};

interface MindMapCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onExpand?: (nodeId: string) => void;
}

const nodeOrigin: [number, number] = [0.5, 0];

export function MindMapCanvas({
  initialNodes = [],
  initialEdges = [],
  onSave,
  onExpand,
}: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onConnectEnd = useCallback(
    (event: any, connectionState: any) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        const id = `node_${Date.now()}`;
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;
        
        const newNode: Node = {
          id,
          type: 'mindmap',
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { label: `New Idea` },
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));
        
        const isFromTarget = connectionState.fromHandle.type === 'target';
        
        setEdges((eds) =>
          eds.concat({ 
            id: `edge_${Date.now()}`, 
            source: isFromTarget ? id : connectionState.fromNode.id, 
            sourceHandle: isFromTarget ? 'source-bottom' : connectionState.fromHandle.id,
            target: isFromTarget ? connectionState.fromNode.id : id,
            targetHandle: isFromTarget ? connectionState.fromHandle.id : 'target-top',
          })
        );
      }
    },
    [screenToFlowPosition, setNodes, setEdges],
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      let remainingNodes = [...nodes];
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, remainingNodes, acc);
          const outgoers = getOutgoers(node, remainingNodes, acc);
          const connectedEdges = getConnectedEdges([node], acc);

          const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `edge_${source}_${target}`,
              source,
              target,
              targetHandle: 'target-top',
            }))
          );

          remainingNodes = remainingNodes.filter((rn) => rn.id !== node.id);

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
    },
    [nodes, edges, setEdges]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      // Temporarily disabled
      /*
      if (onExpand) {
        onExpand(node.id);
      }
      */
    },
    [onExpand]
  );

  // Map all nodes to 'mindmap' type to ensure handles are consistent
  const processedNodes = useMemo(() => {
    return nodes.map(n => ({
      ...n,
      type: 'mindmap'
    }));
  }, [nodes]);

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
      <ReactFlow
        nodes={processedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={nodeTypes}
        nodeOrigin={nodeOrigin}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => onSave?.(nodes, edges)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Save Mind Map
        </button>
      </div>
    </div>
  );
}
