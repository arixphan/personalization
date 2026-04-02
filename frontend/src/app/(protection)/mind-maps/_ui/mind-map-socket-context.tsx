'use client';

import React, { createContext, useContext } from 'react';

interface MindMapSocketContextType {
  emitNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  emitNodeSave: (nodeId: string, position: { x: number; y: number }) => void;
  emitNodeUpdate: (nodeId: string, data: any) => void;
  emitNodeAdd: (node: any) => void;
  emitEdgeAdd: (edge: any) => void;
  emitNodeRemove: (nodeId: string) => void;
  emitEdgeRemove: (edgeId: string) => void;
}

const MindMapSocketContext = createContext<MindMapSocketContextType | null>(null);

export const MindMapSocketProvider = MindMapSocketContext.Provider;

export function useMindMapSocketContext() {
  const context = useContext(MindMapSocketContext);
  if (!context) {
    throw new Error('useMindMapSocketContext must be used within a MindMapSocketProvider');
  }
  return context;
}
