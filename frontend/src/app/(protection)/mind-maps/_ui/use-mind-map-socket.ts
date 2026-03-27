'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '@/config/env';

interface UseMindMapSocketProps {
  mindMapId: number;
  onNodeMoved?: (data: { nodeId: string; position: { x: number; y: number } }) => void;
  onNodeUpdated?: (data: { nodeId: string; data: any }) => void;
  onNodeAdded?: (node: any) => void;
  onNodeRemoved?: (data: { nodeId: string }) => void;
  onEdgeAdded?: (edge: any) => void;
}

export function useMindMapSocket({
  mindMapId,
  onNodeMoved,
  onNodeUpdated,
  onNodeAdded,
  onNodeRemoved,
  onEdgeAdded,
}: UseMindMapSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  
  // Use refs for callbacks to prevent re-triggering the connection effect
  // when handlers are redefined in the parent component.
  const handlersRef = useRef({
    onNodeMoved,
    onNodeUpdated,
    onNodeAdded,
    onNodeRemoved,
    onEdgeAdded,
  });

  // Always keep the handlers ref fresh
  useEffect(() => {
    handlersRef.current = {
      onNodeMoved,
      onNodeUpdated,
      onNodeAdded,
      onNodeRemoved,
      onEdgeAdded,
    };
  }, [onNodeMoved, onNodeUpdated, onNodeAdded, onNodeRemoved, onEdgeAdded]);

  useEffect(() => {
    if (!mindMapId) return;

    const socketUrl = env.nextPublicServerBaseUrl.replace('/api', '');

    const socket = io(`${socketUrl}/mind-maps`, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[useMindMapSocket] Connected to Mind Map WebSocket:', socket.id);
      socket.emit('join-room', { mindMapId }, (response: any) => {
        console.log('[useMindMapSocket] Joined room response:', response);
      });
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

    return () => {
      socket.disconnect();
    };
  }, [mindMapId]); // ONLY depend on mindMapId to ensure connection stability

  const emitNodeMove = useCallback((nodeId: string, position: { x: number; y: number }) => {
    socketRef.current?.emit('node:move', { mindMapId, nodeId, position });
  }, [mindMapId]);

  const emitNodeSave = useCallback((nodeId: string, position: { x: number; y: number }) => {
    socketRef.current?.emit('node:save-position', { mindMapId, nodeId, position });
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

  return {
    emitNodeMove,
    emitNodeSave,
    emitNodeUpdate,
    emitNodeAdd,
    emitEdgeAdd,
    emitNodeRemove,
  };
}
