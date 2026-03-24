import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BrainCircuit } from 'lucide-react';
import { ClientApiHandler } from '@/lib/client-api';

async function getMindMaps() {
  const response = await ClientApiHandler.get('/mind-maps');
  return response.data || [];
}

export default async function MindMapsPage() {
  const mindMaps = await getMindMaps();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mind Maps</h1>
          <p className="text-muted-foreground">Brainstorm and organize your ideas with AI.</p>
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
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle>{map.name}</CardTitle>
                  <CardDescription>
                    Last updated {new Date(map.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {map.description || 'No description provided.'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
