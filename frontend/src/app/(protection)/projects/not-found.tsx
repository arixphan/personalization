"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("Projects");

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-4">
            <span className="text-4xl">🔍</span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("notFound.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("notFound.description")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <Button asChild variant="default">
            <Link href="/projects">{t("notFound.backToProjects")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t("notFound.goHome")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
