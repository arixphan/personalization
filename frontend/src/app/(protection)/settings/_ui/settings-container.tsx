"use client";

import { useState } from "react";
import { SettingsHeader } from "./settings-header";
import { SettingsTabs } from "./settings-tabs";
import { SettingsTab } from "./tabs/settings-tab";
import { AccountTab } from "./tabs/account-tab";
import { ProfileTab } from "./tabs/profile-tab/profile-tab";

export type TabId = "settings" | "account" | "profile";

export function SettingsContainer({ initialData }: { initialData?: any }) {
  const [activeTab, setActiveTab] = useState<TabId>("settings");

  return (
    <div className="h-full space-y-8">
      <SettingsHeader />
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="mt-8 transition-all">
        {activeTab === "settings" && <SettingsTab initialData={initialData} />}
        {activeTab === "account" && <AccountTab initialData={initialData} />}
        {activeTab === "profile" && <ProfileTab initialData={initialData} />}
      </div>
    </div>
  );
}
