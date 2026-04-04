"use client";

import { Chrome } from "lucide-react";
import SocialButton from "./social-button";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { env } from "@/config/env";

export const SignInForm = () => {
  const t = useTranslations("Auth");

  const handleSocialAuth = (provider: "google" | "facebook") => {
    if (provider === "google") {
      const backendUrl = env.nextPublicServerBaseUrl.replace("/api", "");
      window.location.href = `${backendUrl}/api/auth/google`;
    }
  };


  return (
    <div className="space-y-6">
      {/* Social Authentication */}
      <div className="space-y-3">
        <SocialButton
          provider="google"
          onClick={() => handleSocialAuth("google")}
        >
          <Chrome size={20} />
          <span className="font-medium">{t("social.continueGoogle")}</span>
        </SocialButton>
      </div>

      {/* Register Link */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t("noAccount")}{" "}
        <Link
          href={"/signup"}
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {t("signUpLink")}
        </Link>
      </div>
    </div>
  );
};
