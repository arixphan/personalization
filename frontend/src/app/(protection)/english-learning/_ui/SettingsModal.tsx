import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { fetchEnglishSettings, updateEnglishSettings, EnglishSettings } from "../_lib/dal";
import { toast } from "sonner";
import { Brain, RotateCcw, TrendingDown } from "lucide-react";

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<EnglishSettings>({
    masteryThreshold: 5,
    wrongOptionAction: 'DECREASE'
  });

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const data = await fetchEnglishSettings();
      setSettings(data);
    } catch {
      toast.error("Failed to load settings");
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateEnglishSettings(settings);
      toast.success("Settings saved successfully!");
      onClose();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Practice Settings
          </DialogTitle>
          <DialogDescription>
            Configure how mastery works during your practice sessions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mastery Threshold</Label>
              <p className="text-sm text-muted-foreground leading-snug">
                How many times do you need to select the correct answer before a word is fully mastered and no longer shown?
              </p>
              <Input
                type="number"
                min={1}
                max={100}
                value={settings.masteryThreshold}
                onChange={(e) => setSettings({ ...settings, masteryThreshold: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Wrong Answer Penalty</Label>
              <p className="text-sm text-muted-foreground leading-snug">
                What happens to your mastery level when you answer incorrectly?
              </p>
              <div className="grid gap-2 mt-2">
                <div 
                  className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${settings.wrongOptionAction === 'RESET' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => setSettings({ ...settings, wrongOptionAction: 'RESET' })}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border mt-0.5">
                    {settings.wrongOptionAction === 'RESET' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="space-y-1 w-full">
                    <Label className="cursor-pointer font-medium flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" /> Reset to Zero
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Lose all progress for this word. You must start over.
                    </p>
                  </div>
                </div>
                <div 
                  className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${settings.wrongOptionAction === 'DECREASE' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => setSettings({ ...settings, wrongOptionAction: 'DECREASE' })}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border mt-0.5">
                    {settings.wrongOptionAction === 'DECREASE' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="space-y-1 w-full">
                    <Label className="cursor-pointer font-medium flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> Decrease by 1
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Lose a single point of mastery progress.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
