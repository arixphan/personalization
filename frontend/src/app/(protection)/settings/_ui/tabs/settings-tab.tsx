"use client";

import { useState, useTransition, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/input/custom-select";
import { updateSettings } from "../../_actions/profile";

import { useTranslations } from "next-intl";

export function SettingsTab({ initialData }: { initialData?: any }) {
  const t = useTranslations("Settings");
  const tc = useTranslations("Common");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [language, setLanguage] = useState<"en" | "vn">(initialData?.language || "en");
  const [timezone, setTimezone] = useState(initialData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Sync theme on mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const timezones = [
    { value: "America/New_York", label: "America/New_York" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles" },
    { value: "Europe/London", label: "Europe/London" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo" },
    { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh" },
  ];

  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLang: "en" | "vn") => {
    setLanguage(newLang);
    // Set cookie for next-intl middleware
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
  };

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
        toast.success(t("actions.success"));
        // Force a refresh to apply language changes if needed, 
        // though next-intl should react to the cookie if we re-render or redirect
        window.location.reload();
      }
    });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Theme Settings */}
      <div className="p-6 rounded-xl bg-card border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">{t("appearance.title")}</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">{t("appearance.theme")}</label>
              <p className="text-xs text-muted-foreground">{t("appearance.description")}</p>
            </div>
            <div className="flex rounded-lg overflow-hidden bg-muted/50 p-1 border">
              {(["light", "dark", "system"] as const).map((tName) => (
                <button
                  key={tName}
                  onClick={() => setTheme(tName)}
                  className={cn(
                    "px-3 py-2 text-sm transition-all rounded-md flex items-center capitalize",
                    theme === tName
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tName === "light" && <Sun size={16} className="mr-1.5" />}
                  {tName === "dark" && <Moon size={16} className="mr-1.5" />}
                  {tName === "system" && <Globe size={16} className="mr-1.5" />}
                  {tc(tName)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Localization Settings */}
      <div className="p-6 rounded-xl bg-card border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">{t("localization.title")}</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">{t("localization.language")}</label>
              <p className="text-xs text-muted-foreground">{t("localization.description")}</p>
            </div>
            <div className="flex rounded-lg overflow-hidden bg-muted/50 p-1 border">
              <button
                onClick={() => handleLanguageChange("en")}
                className={cn(
                  "px-4 py-2 text-sm transition-all rounded-md",
                  language === "en"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                🇺🇸 {tc("english")}
              </button>
              <button
                onClick={() => handleLanguageChange("vn")}
                className={cn(
                  "px-4 py-2 text-sm transition-all rounded-md",
                  language === "vn"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                🇻🇳 {tc("vietnamese")}
              </button>
            </div>
          </div>

          <div>
            <CustomSelect
              id="timezone"
              label={t("localization.timezone")}
              placeholder={t("localization.timezonePlaceholder")}
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
          {isPending ? t("actions.saving") : t("actions.save")}
        </Button>
      </div>
    </div>
  );
}
