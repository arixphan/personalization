"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AiHeader } from "./_components/AiHeader";
import { AiProviderSettings } from "./_components/AiProviderSettings";
import { AiToolList } from "./_components/AiToolList";
import { AiStatsSidebar } from "./_components/AiStatsSidebar";
import { AiStatus, AiSettings, Provider } from "./_components/types";



export default function AiConfigPage() {
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [aiSettings, setAiSettings] = useState<AiSettings>({
    provider: "google",
    apiKey: "",
    model: "",
  });

  const providers: Provider[] = [
    { id: "google", name: "Google Gemini", defaultModel: "gemini-1.5-flash-latest" },
    { id: "openai", name: "OpenAI GPT", defaultModel: "gpt-4o-mini" },
    { id: "anthropic", name: "Anthropic Claude", defaultModel: "claude-3-5-sonnet-latest" },
  ];

  const fetchStatus = async () => {
    try {
      const [resStatus, resSettings] = await Promise.all([
        fetch("/api/ai/status"),
        fetch("/api/ai/settings")
      ]);
      const statusData = resStatus.ok ? await resStatus.json() : null;
      const settingsData = resSettings.ok ? await resSettings.json() : null;

      setStatus(statusData);
      if (settingsData) {
        setAiSettings({
          provider: settingsData.provider || "google",
          apiKey: settingsData.apiKey || "",
          model: settingsData.model || "",
        });
      }
    } catch (error) {
      toast.error("Failed to fetch AI configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiSettings),
      });
      if (res.ok) {
        toast.success("AI Settings updated successfully");
        fetchStatus();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save AI settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/ai/ingest/finance", { method: "POST" });
      if (res.ok) {
        toast.success("Finance synchronization started successfully");
        await fetchStatus();
      } else {
        throw new Error("Sync failed");
      }
    } catch (error) {
      toast.error("Failed to start synchronization");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center">Loading AI Configuration...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <AiHeader isActive={!!aiSettings.apiKey} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AiProviderSettings
            settings={aiSettings}
            providers={providers}
            isSaving={isSaving}
            onSettingsChange={setAiSettings}
            onSave={handleSaveSettings}
          />

          <AiToolList status={status} />
        </div>

        <AiStatsSidebar
          status={status}
          syncing={syncing}
          onSync={handleSync}
        />
      </div>
    </div>
  );
}
