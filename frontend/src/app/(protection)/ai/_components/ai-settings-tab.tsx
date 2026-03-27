'use client';

import { AiProviderSettings } from './AiProviderSettings';
import { AiToolList } from './AiToolList';
import { AiStatsSidebar } from './AiStatsSidebar';
import { AiSettings, AiStatus, Provider } from './types';

interface AiSettingsTabProps {
  aiSettings: AiSettings;
  providers: Provider[];
  isSaving: boolean;
  status: AiStatus | null;
  syncing: boolean;
  onSettingsChange: (settings: AiSettings) => void;
  onSave: (e: React.FormEvent) => void;
  onSync: () => void;
}

export const AiSettingsTab = ({
  aiSettings,
  providers,
  isSaving,
  status,
  syncing,
  onSettingsChange,
  onSave,
  onSync,
}: AiSettingsTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <AiProviderSettings
          settings={aiSettings}
          providers={providers}
          isSaving={isSaving}
          onSettingsChange={onSettingsChange}
          onSave={onSave}
        />
        <AiToolList status={status} />
      </div>
      <AiStatsSidebar status={status} syncing={syncing} onSync={onSync} />
    </div>
  );
};
