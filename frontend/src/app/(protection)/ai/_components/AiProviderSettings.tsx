import { useState } from "react";
import { RefreshCw, Key, Lock, Unlock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleEditKey = () => {
    if (!isEditingKey) {
      // Toggling ON: clear the key and enable input
      onSettingsChange({ ...settings, apiKey: "" });
      setIsEditingKey(true);
      setError(null);
    } else {
      // Toggling OFF: Reset to masked value
      onSettingsChange({ ...settings, apiKey: "••••••••••••••••" });
      setIsEditingKey(false);
      setError(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    if (isEditingKey && !settings.apiKey) {
      setError("API Key is required when editing");
      e.preventDefault();
      return;
    }
    setError(null);
    onSave(e);
  };
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
        <form onSubmit={handleFormSubmit} className="space-y-6">
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
                      ? "Gemini 3 Flash"
                      : p.id === "openai"
                        ? "GPT-4o"
                        : "Claude 3.5"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <div className="flex items-center justify-between h-8">
                <label className="text-sm font-medium">API Key</label>
                <button
                  type="button"
                  onClick={toggleEditKey}
                  className={cn(
                    "text-[10px] flex items-center gap-1 font-medium transition-colors px-2 py-1 rounded-md",
                    isEditingKey 
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  )}
                >
                  {isEditingKey ? (
                    <>
                      <Unlock className="w-3 h-3" />
                      Editing Mode
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      Change Key
                    </>
                  )}
                </button>
              </div>
              <Input
                type={isEditingKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) => {
                  onSettingsChange({ ...settings, apiKey: e.target.value });
                  if (error) setError(null);
                }}
                disabled={!isEditingKey}
                placeholder={isEditingKey ? "Enter new API key..." : "••••••••••••••••"}
                className={cn(
                  "transition-all",
                  error && "border-destructive ring-destructive/20 ring-[3px]",
                  !isEditingKey && "opacity-60 cursor-not-allowed bg-muted/50"
                )}
              />
              <div className="min-h-[16px]">
                {error && (
                  <p className="text-[10px] text-destructive flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center h-8">
                <label className="text-sm font-medium">Model Name (CLI string)</label>
              </div>
              <Input
                type="text"
                value={settings.model}
                onChange={(e) =>
                  onSettingsChange({ ...settings, model: e.target.value })
                }
                placeholder="e.g. gpt-4o, gemini-1.5-pro"
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
