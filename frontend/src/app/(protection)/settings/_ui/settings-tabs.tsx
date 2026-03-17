import { Layout, User, Briefcase } from "lucide-react";
import { TabId } from "./settings-container";
import { cn } from "@/lib/utils";

interface SettingsTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: "settings" as const, label: "Settings", icon: Layout },
  { id: "account" as const, label: "Account", icon: User },
  { id: "profile" as const, label: "Profile", icon: Briefcase },
];

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex rounded-xl overflow-hidden bg-muted/50 p-1 border border-border/50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center space-x-2 rounded-lg",
              isActive
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
            )}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
