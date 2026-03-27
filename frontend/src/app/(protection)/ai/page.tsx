"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bot, MessageSquare, Settings, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AiChatTab } from "./_components/ai-chat-tab";
import { AiSettingsTab } from "./_components/ai-settings-tab";
import { AiStatus, AiSettings, Provider } from "./_components/types";

type Tab = "chat" | "settings";

export default function AiConfigPage() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
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
        fetch("/api/ai/settings"),
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
    } catch {
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
    } catch {
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
    } catch {
      toast.error("Failed to start synchronization");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="text-sm">Loading AI Configuration...</span>
        </div>
      </div>
    );
  }

  const isActive = !!aiSettings.apiKey;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "chat", label: "AI Chat", icon: <MessageSquare size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-500" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Chat with your AI assistant or configure your provider settings.
          </p>
        </div>
        {isActive ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            AI Assistant Active
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Configuration Required
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "chat" ? (
        <AiChatTab />
      ) : (
        <AiSettingsTab
          aiSettings={aiSettings}
          providers={providers}
          isSaving={isSaving}
          status={status}
          syncing={syncing}
          onSettingsChange={setAiSettings}
          onSave={handleSaveSettings}
          onSync={handleSync}
        />
      )}
    </div>
  );
}
