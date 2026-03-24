'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MindMapCanvas } from '../_ui/mind-map-canvas';
import { ReactFlowProvider } from '@xyflow/react';
import { ClientApiHandler } from '@/lib/client-api';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MindMapDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mindMap, setMindMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadMindMap = useCallback(async () => {
    try {
      const res = await ClientApiHandler.get(`/mind-maps/${id}`);
      if (res.data) {
        const nodes = res.data.nodes.map((n: any) => ({
          id: n.id,
          type: n.type,
          position: { x: n.positionX, y: n.positionY },
          data: n.data,
          style: n.style,
        }));
        const edges = res.data.edges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          type: e.type,
          animated: e.animated,
          style: e.style,
        }));
        setMindMap({ ...res.data, nodes, edges });
      }
    } catch (error) {
      toast.error('Failed to load mind map');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMindMap();
  }, [loadMindMap]);

  const handleSave = async (nodes: any[], edges: any[]) => {
    try {
      const res = await ClientApiHandler.patch(`/mind-maps/${id}`, {
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.type,
          positionX: n.position.x,
          positionY: n.position.y,
          data: n.data,
          style: n.style,
        })),
        edges: edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          type: e.type,
          animated: e.animated,
          style: e.style,
        })),
      });
      if (res.error) throw new Error(res.error);
      toast.success('Mind map saved');
    } catch (error) {
      toast.error('Failed to save mind map');
    }
  };

  const handleExpand = async (nodeId: string) => {
    toast.info('AI is brainstorming sub-topics...');
    try {
      const res = await ClientApiHandler.post(`/mind-maps/${id}/expand`, {
        nodeId,
        context: { nodes: mindMap.nodes, edges: mindMap.edges },
      });

      if (res.data) {
        const { newNodes, newEdges } = res.data;

        // Merge new data into local state
        setMindMap(prev => ({
          ...prev,
          nodes: [...prev.nodes, ...newNodes],
          edges: [...prev.edges, ...newEdges],
        }));

        toast.success('AI expansion complete!');
      }
    } catch (error) {
      console.error(error);
      toast.error('AI expansion failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mindMap) return (
    <div className="flex flex-col h-screen items-center justify-center gap-4">
      <p>Mind map not found</p>
      <Link href="/mind-maps">
        <Button variant="outline">Back to Gallery</Button>
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="p-4 border-b bg-background flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <Link href="/mind-maps">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">{mindMap.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* <p className="text-xs text-muted-foreground mr-4 italic">Right-click any node to expand with AI</p> */}
          <Button variant="outline" size="sm" onClick={() => loadMindMap()}>
            Refresh
          </Button>
        </div>
      </div>
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <MindMapCanvas
            key={mindMap.nodes.length + mindMap.edges.length} // Force re-render on expand
            initialNodes={mindMap.nodes}
            initialEdges={mindMap.edges}
            onSave={handleSave}
            onExpand={handleExpand}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
