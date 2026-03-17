"use client";

import { useState, useTransition, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/input/custom-select";
import { updateSettings } from "../../_actions/profile";

export function SettingsTab({ initialData }: { initialData?: any }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [language, setLanguage] = useState<"en" | "vn">(initialData?.language || "en");
  const [timezone, setTimezone] = useState(initialData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Sync theme on mount
  useEffect(() => {
    setMounted(true);
    // Remove the forced sync that was reverting user choices
    // If we wanted to sync DB to LocalStorage, we'd do it once via a ref or before mount
  }, []);
  
  const timezones = [
    { value: "America/New_York", label: "America/New_York" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles" },
    { value: "Europe/London", label: "Europe/London" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo" },
    { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh" },
  ];

  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateSettings({
        theme: theme as "light" | "dark" | "system" | undefined,
        language,
        timezone,
      });
      if (result.error) {
        toast.error(result.error);
        console.error("Save failed:", result.error);
      } else {
        toast.success("Settings saved successfully");
      }
    });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Theme Settings */}
      <div className="p-6 rounded-xl bg-card border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Appearance</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Theme</label>
              <p className="text-xs text-muted-foreground">Select your interface theme</p>
            </div>
            <div className="flex rounded-lg overflow-hidden bg-muted/50 p-1 border">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "px-3 py-2 text-sm transition-all rounded-md flex items-center capitalize",
                    theme === t
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "light" && <Sun size={16} className="mr-1.5" />}
                  {t === "dark" && <Moon size={16} className="mr-1.5" />}
                  {t === "system" && <Globe size={16} className="mr-1.5" />}
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Localization Settings */}
      <div className="p-6 rounded-xl bg-card border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Localization</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Language</label>
              <p className="text-xs text-muted-foreground">Choose your preferred language</p>
            </div>
            <div className="flex rounded-lg overflow-hidden bg-muted/50 p-1 border">
              <button
                onClick={() => setLanguage("en")}
                className={cn(
                  "px-4 py-2 text-sm transition-all rounded-md",
                  language === "en"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                🇺🇸 English
              </button>
              <button
                onClick={() => setLanguage("vn")}
                className={cn(
                  "px-4 py-2 text-sm transition-all rounded-md",
                  language === "vn"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                🇻🇳 Tiếng Việt
              </button>
            </div>
          </div>

          <div>
            <CustomSelect
              id="timezone"
              label="Timezone"
              placeholder="Select a timezone"
              options={timezones}
              value={timezone}
              onChange={setTimezone}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} disabled={isPending} variant="default" className="gap-2">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
