import { Database, MemoryStick as MemoryIcon, Cpu, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiStatus } from "./types";

interface AiStatsSidebarProps {
  status: AiStatus | null;
  syncing: boolean;
  onSync: () => void;
}

export function AiStatsSidebar({ status, syncing, onSync }: AiStatsSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            RAG Knowledge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{status?.stats?.embeddings ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Total document chunks</p>
          <Button
            onClick={onSync}
            disabled={syncing}
            className="w-full mt-4 flex items-center gap-2"
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Force Sync Finance"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-purple-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MemoryIcon className="w-4 h-4 text-purple-500" />
            Memory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{status?.stats?.memories ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Known personal facts</p>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-amber-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-500" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{status?.tools?.length ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Functional extensions</p>
        </CardContent>
      </Card>
    </div>
  );
}
