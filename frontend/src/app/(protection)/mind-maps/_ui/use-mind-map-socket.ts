'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '@/config/env';
import { getSocketToken } from '../_actions/socket';

interface UseMindMapSocketProps {
  mindMapId: number;
  onNodeMoved?: (data: { nodeId: string; position: { x: number; y: number } }) => void;
  onNodesMoved?: (data: { nodes: { nodeId: string; position: { x: number; y: number } }[] }) => void;
  onNodeUpdated?: (data: { nodeId: string; data: any }) => void;
  onNodeAdded?: (node: any) => void;
  onNodeRemoved?: (data: { nodeId: string }) => void;
  onEdgeAdded?: (edge: any) => void;
  onEdgeRemoved?: (data: { edgeId: string }) => void;
}

export function useMindMapSocket({
  mindMapId,
  onNodeMoved,
  onNodeUpdated,
  onNodeAdded,
  onNodeRemoved,
  onEdgeAdded,
  onEdgeRemoved,
}: UseMindMapSocketProps) {
  const socketRef = useRef<Socket | null>(null);

  // Use refs for callbacks to prevent re-triggering the connection effect
  // when handlers are redefined in the parent component.
  const handlersRef = useRef<{
    onNodeMoved?: (data: { nodeId: string; position: { x: number; y: number } }) => void;
    onNodesMoved?: (data: { nodes: { nodeId: string; position: { x: number; y: number } }[] }) => void;
    onNodeUpdated?: (data: { nodeId: string; data: any }) => void;
    onNodeAdded?: (node: any) => void;
    onNodeRemoved?: (data: { nodeId: string }) => void;
    onEdgeAdded?: (edge: any) => void;
    onEdgeRemoved?: (data: { edgeId: string }) => void;
  }>({
    onNodeMoved,
    onNodesMoved: undefined,
    onNodeUpdated,
    onNodeAdded,
    onNodeRemoved,
    onEdgeAdded,
    onEdgeRemoved,
  });

  // Always keep the handlers ref fresh
  useEffect(() => {
    handlersRef.current = {
      onNodeMoved,
      onNodesMoved: handlersRef.current.onNodesMoved, // preserve if passed in later, though we might want to add to props
      onNodeUpdated,
      onNodeAdded,
      onNodeRemoved,
      onEdgeAdded,
      onEdgeRemoved,
    };
  }, [onNodeMoved, onNodeUpdated, onNodeAdded, onNodeRemoved, onEdgeAdded, onEdgeRemoved]);

  useEffect(() => {
    if (!mindMapId) return;

    const connectSocket = async () => {
      const socketUrl = env.nextPublicWsBaseUrl;
      const token = await getSocketToken();

      const socket = io(`${socketUrl}/mind-maps`, {
        auth: { token },
        withCredentials: true,
        transports: ['polling', 'websocket'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join-room', { mindMapId });
      });

      socket.on('connect_error', (error) => {
        console.error('[useMindMapSocket] Connection error:', error.message);
      });

      socket.on('disconnect', (reason) => {
        console.warn('[useMindMapSocket] Disconnected from WebSocket:', reason);
      });

      socket.on('node:moved', (data) => {
        handlersRef.current.onNodeMoved?.(data);
      });

      socket.on('nodes:moved', (data) => {
        handlersRef.current.onNodesMoved?.(data);
      });

      socket.on('node:updated', (data) => {
        handlersRef.current.onNodeUpdated?.(data);
      });

      socket.on('node:added', (node) => {
        handlersRef.current.onNodeAdded?.(node);
      });

      socket.on('node:removed', (data) => {
        handlersRef.current.onNodeRemoved?.(data);
      });

      socket.on('edge:added', (edge) => {
        handlersRef.current.onEdgeAdded?.(edge);
      });

      socket.on('edge:removed', (data) => {
        handlersRef.current.onEdgeRemoved?.(data);
      });
    };

    connectSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [mindMapId]); // ONLY depend on mindMapId to ensure connection stability

  const emitNodeMove = useCallback((nodeId: string, position: { x: number; y: number }) => {
    socketRef.current?.emit('node:move', { mindMapId, nodeId, position });
  }, [mindMapId]);

  const emitNodesMove = useCallback((nodes: { nodeId: string; position: { x: number; y: number } }[]) => {
    socketRef.current?.emit('nodes:move', { mindMapId, nodes });
  }, [mindMapId]);

  const emitNodeSave = useCallback((nodeId: string, position: { x: number; y: number }) => {
    socketRef.current?.emit('node:save-position', { mindMapId, nodeId, position });
  }, [mindMapId]);

  const emitNodesSave = useCallback((nodes: { nodeId: string; position: { x: number; y: number } }[]) => {
    socketRef.current?.emit('nodes:save-position', { mindMapId, nodes });
  }, [mindMapId]);

  const emitNodeUpdate = useCallback((nodeId: string, data: any) => {
    socketRef.current?.emit('node:update', { mindMapId, nodeId, data });
  }, [mindMapId]);

  const emitNodeAdd = useCallback((node: any) => {
    socketRef.current?.emit('node:add', { mindMapId, node });
  }, [mindMapId]);

  const emitEdgeAdd = useCallback((edge: any) => {
    socketRef.current?.emit('edge:add', { mindMapId, edge });
  }, [mindMapId]);

  const emitNodeRemove = useCallback((nodeId: string) => {
    socketRef.current?.emit('node:remove', { mindMapId, nodeId });
  }, [mindMapId]);

  const emitEdgeRemove = useCallback((edgeId: string) => {
    socketRef.current?.emit('edge:remove', { mindMapId, edgeId });
  }, [mindMapId]);

  return {
    emitNodeMove,
    emitNodesMove,
    emitNodeSave,
    emitNodesSave,
    emitNodeUpdate,
    emitNodeAdd,
    emitEdgeAdd,
    emitNodeRemove,
    emitEdgeRemove,
  };
}
