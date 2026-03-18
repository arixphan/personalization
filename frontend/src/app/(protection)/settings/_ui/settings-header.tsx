"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function SettingsHeader() {
  const t = useTranslations("Settings");

  return (
    <div className="flex items-center space-x-4">
      <Button variant="ghost" size="icon" asChild className="rounded-xl bg-muted/30">
        <Link href="/">
          <ArrowLeft size={20} />
        </Link>
      </Button>
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
      </div>
    </div>
  );
}
