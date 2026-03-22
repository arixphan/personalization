import { Bot, CheckCircle2, AlertCircle } from "lucide-react";

interface AiHeaderProps {
  isActive: boolean;
}

export function AiHeader({ isActive }: AiHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="w-8 h-8 text-blue-500" />
          AI Assistant Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Configure your global assistant, manage memory, and sync data for RAG.
        </p>
      </div>
      {isActive ? (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          AI Assistant Active
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          Configuration Required
        </div>
      )}
    </div>
  );
}
