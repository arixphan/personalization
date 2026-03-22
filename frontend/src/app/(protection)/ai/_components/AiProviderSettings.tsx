import { RefreshCw, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiSettings, Provider } from "./types";

interface AiProviderSettingsProps {
  settings: AiSettings;
  providers: Provider[];
  isSaving: boolean;
  onSettingsChange: (settings: AiSettings) => void;
  onSave: (e: React.FormEvent) => void;
}

export function AiProviderSettings({
  settings,
  providers,
  isSaving,
  onSettingsChange,
  onSave,
}: AiProviderSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          AI Provider Settings
        </CardTitle>
        <CardDescription>
          Configure which AI model and API key to use for your assistant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSave} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Provider</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {providers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      provider: p.id,
                      model: settings.model || p.defaultModel,
                    })
                  }
                  className={cn(
                    "px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left flex flex-col gap-1",
                    settings.provider === p.id
                      ? "border-primary bg-primary/5 shadow-inner"
                      : "border-border bg-card hover:border-primary/50",
                  )}
                >
                  <span>{p.name}</span>
                  <span className="text-[10px] text-muted-foreground opacity-70">
                    {p.id === "google"
                      ? "Gemini 1.5"
                      : p.id === "openai"
                        ? "GPT-4o"
                        : "Claude 3.5"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) =>
                  onSettingsChange({ ...settings, apiKey: e.target.value })
                }
                placeholder={settings.apiKey ? "••••••••••••••••" : "Enter key..."}
                className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Name (CLI string)</label>
              <input
                type="text"
                value={settings.model}
                onChange={(e) =>
                  onSettingsChange({ ...settings, model: e.target.value })
                }
                placeholder="e.g. gpt-4o, gemini-1.5-pro"
                className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="px-8">
            {isSaving && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            Save Configuration
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
