'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MindMapCanvas } from '../_ui/mind-map-canvas';
import { ReactFlowProvider } from '@xyflow/react';
import { ClientApiHandler } from '@/lib/client-api';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Trash2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MindMapDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mindMap, setMindMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [deletingMap, setDeletingMap] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const loadMindMap = useCallback(async () => {
    try {
      const res = await ClientApiHandler.get(`/mind-maps/${id}`);
      if (res.data) {
        const nodes = res.data.nodes.map((n: any) => ({
          id: n.id,
          type: n.type,
          position: { x: n.positionX, y: n.positionY },
          width: n.data?.width,
          height: n.data?.height,
          data: n.data,
          style: n.style,
        }));
        const edges = res.data.edges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          label: e.label,
          type: e.type,
          animated: e.animated,
          style: e.style,
        }));
        setMindMap({ ...res.data, nodes, edges });
        setTitleValue(res.data.name);
      }
    } catch {
      toast.error('Failed to load mind map');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMindMap();
  }, [loadMindMap]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const handleRenameCommit = async () => {
    const trimmed = titleValue.trim();
    if (!trimmed || trimmed === mindMap.name) {
      setTitleValue(mindMap.name);
      setEditingTitle(false);
      return;
    }
    try {
      await ClientApiHandler.patch(`/mind-maps/${id}`, { name: trimmed });
      setMindMap((prev: any) => ({ ...prev, name: trimmed }));
      toast.success('Renamed');
    } catch {
      toast.error('Failed to rename');
      setTitleValue(mindMap.name);
    }
    setEditingTitle(false);
  };

  const handleDeleteMap = async () => {
    if (!confirm(`Delete "${mindMap.name}"? This cannot be undone.`)) return;
    setDeletingMap(true);
    try {
      await ClientApiHandler.delete(`/mind-maps/${id}`);
      toast.success('Mind map deleted');
      router.push('/mind-maps');
    } catch {
      toast.error('Failed to delete');
      setDeletingMap(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mindMap) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4">
        <p>Mind map not found</p>
        <Link href="/mind-maps">
          <Button variant="outline">Back to Gallery</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-background flex justify-between items-center px-6 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/mind-maps">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          {editingTitle ? (
            <div className="flex items-center gap-1">
              <Input
                ref={titleInputRef}
                value={titleValue}
                onChange={e => setTitleValue(e.target.value)}
                onBlur={handleRenameCommit}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRenameCommit();
                  if (e.key === 'Escape') {
                    setTitleValue(mindMap.name);
                    setEditingTitle(false);
                  }
                }}
                className="text-xl font-bold h-9 w-64"
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onMouseDown={handleRenameCommit}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onMouseDown={() => { setTitleValue(mindMap.name); setEditingTitle(false); }}
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ) : (
            <h1
              className="text-xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors truncate"
              title="Click to rename"
              onClick={() => setEditingTitle(true)}
            >
              {mindMap.name}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteMap}
            disabled={deletingMap}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {deletingMap ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <MindMapCanvas
            mindMapId={Number(id)}
            initialNodes={mindMap.nodes}
            initialEdges={mindMap.edges}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
