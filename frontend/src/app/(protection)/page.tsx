"use client";

import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <div>
      <h1 className="text-3xl font-bold underline">{t("greeting")}</h1>
    </div>
  );
}
