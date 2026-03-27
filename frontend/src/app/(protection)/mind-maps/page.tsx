'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BrainCircuit, Trash2 } from 'lucide-react';
import { ClientApiHandler } from '@/lib/client-api';
import { toast } from 'sonner';

export default function MindMapsPage() {
  const [mindMaps, setMindMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMaps = useCallback(async () => {
    try {
      const res = await ClientApiHandler.get('/mind-maps');
      setMindMaps(res.data || []);
    } catch {
      toast.error('Failed to load mind maps');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaps();
  }, [loadMaps]);

  const handleDelete = async (e: React.MouseEvent, mapId: number, mapName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${mapName}"? This cannot be undone.`)) return;
    try {
      await ClientApiHandler.delete(`/mind-maps/${mapId}`);
      setMindMaps(prev => prev.filter(m => m.id !== mapId));
      toast.success('Mind map deleted');
    } catch {
      toast.error('Failed to delete mind map');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mind Maps</h1>
            <p className="text-muted-foreground">Brainstorm and organize your ideas.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mind Maps</h1>
          <p className="text-muted-foreground">Brainstorm and organize your ideas.</p>
        </div>
        <Link href="/mind-maps/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Mind Map
          </Button>
        </Link>
      </div>

      {mindMaps.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No mind maps yet</h3>
          <p className="text-muted-foreground mb-6">Create your first mind map to start brainstorming.</p>
          <Link href="/mind-maps/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Create First Mind Map
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mindMaps.map((map: any) => (
            <Link key={map.id} href={`/mind-maps/${map.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full group relative">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="leading-tight">{map.name}</CardTitle>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {map._count?.nodes ?? 0} nodes
                    </Badge>
                  </div>
                  <CardDescription>
                    Last updated {new Date(map.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {map.description || 'No description provided.'}
                  </p>
                </CardContent>
                {/* Delete button — shown on hover */}
                <button
                  onClick={e => handleDelete(e, map.id, map.name)}
                  className="absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
