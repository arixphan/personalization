"use client";

import { Chrome } from "lucide-react";
import SocialButton from "./social-button";
import { useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useActionState } from "react";
import { registerAction, RegisterState } from "../actions/register";
import { useTranslations } from "next-intl";
import { env } from "@/config/env";

const initialState: RegisterState = {
  success: false,
};

export function SignUpForm() {
  const t = useTranslations("Auth");

  const [state, , ] = useActionState(registerAction, initialState);



  const handleSocialAuth = (provider: "google" | "facebook") => {
    if (provider === "google") {
      const backendUrl = env.nextPublicServerBaseUrl.replace("/api", "");
      window.location.href = `${backendUrl}/api/auth/google`;
    }
  };

  return (
    <div className="space-y-6">
      {state.success && state.message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
        >
          {state.message}
        </motion.div>
      )}

      {!state.success && state.message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
        >
          {state.message}
        </motion.div>
      )}

      {/* Social Auth */}
      <div className="space-y-3">
        <SocialButton
          provider="google"
          onClick={() => handleSocialAuth("google")}
        >
          <Chrome size={20} />
          <span className="font-medium">{t("social.continueGoogle")}</span>
        </SocialButton>
      </div>

      {/* Sign In Link */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t("hasAccount")}{" "}
        <Link
          href="/signin"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {t("signInLink")}
        </Link>
      </div>
    </div>
  );
}
