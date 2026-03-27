'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { ClientApiHandler } from '@/lib/client-api';
import { toast } from 'sonner';

export default function NewMindMapPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      let initialData: { nodes: any[], edges: any[] } = { nodes: [], edges: [] };
      
      if (topic) {
        toast.info('AI is generating your mind map...');
        const aiRes = await ClientApiHandler.post('/mind-maps/generate', { topic });
        if (aiRes.data) {
          initialData = aiRes.data;
        }
      }

      // If no initial data (no topic or AI failed), add a root node
      if (initialData.nodes.length === 0) {
        initialData.nodes.push({
          id: 'root',
          type: 'mindmap',
          position: { x: 250, y: 5 },
          width: 150,
          height: 50,
          data: { label: name },
        } as any);
      }

      const res = await ClientApiHandler.post('/mind-maps', {
        name,
        description: topic ? `Generated from topic: ${topic}` : '',
        nodes: initialData.nodes.map((n: any) => ({
          id: n.id,
          type: n.type,
          positionX: n.position.x,
          positionY: n.position.y,
          data: n.data,
          style: n.style,
        })),
        edges: initialData.edges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          type: e.type,
          animated: e.animated,
          style: e.style,
        })),
      });

      if (res.data) {
        toast.success('Mind map created!');
        router.push(`/mind-maps/${res.data.id}`);
      }
    } catch (error) {
      toast.error('Failed to create mind map');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Create New Mind Map</CardTitle>
          </div>
          <CardDescription>
            Give your mind map a name and optionally provide a topic for AI to help you get started.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCreate}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Mind Map Name</Label>
              <Input
                id="name"
                placeholder="e.g., Q3 Marketing Strategy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">AI Topic (Optional)</Label>
              <Input
                id="topic"
                placeholder="e.g., How to launch a SaaS product on Product Hunt"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a topic to generate an initial mind map structure using AI.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Mind Map'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
