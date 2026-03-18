"use client";

import { useState, useTransition } from "react";
import { Camera, Shield, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/input/custom-text";
import { toast } from "sonner";
import { updateProfile } from "../../_actions/profile";
import { useTranslations } from "next-intl";

export function AccountTab({ initialData }: { initialData?: any }) {
  const t = useTranslations("Account");
  const [displayName, setDisplayName] = useState(initialData?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phone || "");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Use real avatar if available, fallback for UI demo
  const avatar = initialData?.avatar || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150";

  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProfile({
        name: displayName,
        phone: phoneNumber,
      });
      if (result.error) {
        toast.error(result.error);
        console.error("Save failed:", result.error);
      } else {
        toast.success(t("success"));
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Information */}
      <div className="p-6 rounded-xl bg-card border shadow-sm">
        <h3 className="text-lg font-semibold mb-6 text-card-foreground">{t("profileInfo")}</h3>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative group cursor-pointer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-background"
              />
              <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-110">
                <Camera size={14} />
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
              <CustomInput
                id="display-name"
                label={t("displayName")}
                placeholder={t("displayNamePlaceholder")}
                value={displayName}
                onChange={setDisplayName}
              />
            </div>
          </div>

          <CustomInput
            id="phone-number"
            label={t("phoneNumber")}
            type="tel"
            placeholder={t("phoneNumberPlaceholder")}
            value={phoneNumber}
            onChange={(v) => {
              // Strip out non-numeric and basic phone chars
              const sanitized = v.replace(/[^\d+()\-\s]/g, "");
              setPhoneNumber(sanitized);
            }}
          />
        </div>
      </div>

      {/* Security */}
      <div className="p-6 rounded-xl bg-card border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">{t("security")}</h3>
        
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t("twoFactor")}</p>
              <p className="text-xs text-muted-foreground">{t("twoFactorDescription")}</p>
            </div>
          </div>
          <button
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              twoFactorEnabled ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} disabled={isPending} variant="default" className="gap-2">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
