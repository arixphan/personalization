import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiStatus } from "./types";

interface AiToolListProps {
  status: AiStatus | null;
}

export function AiToolList({ status }: AiToolListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available AI Tools</CardTitle>
        <CardDescription>
          The assistant can automatically use these tools during conversation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {status?.tools?.map((tool) => (
            <div
              key={tool.name}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
            >
              <div className="font-mono text-sm text-blue-600 dark:text-blue-400 font-bold">
                {tool.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {tool.description}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
