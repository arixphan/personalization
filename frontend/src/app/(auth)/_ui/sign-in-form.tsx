"use client";

import { Chrome } from "lucide-react";
import SocialButton from "./social-button";
import { useActionState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { signInAction } from "../actions/login";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface SignInState {
  errors?: {
    username?: string[];
    password?: string[];
    _form?: string[];
  };
  success?: boolean;
}

export const SignInForm = () => {
  const t = useTranslations("Auth");
  const router = useRouter();

  const [state, , ] = useActionState<SignInState, FormData>(
    signInAction,
    { errors: {} }
  );

  const handleSocialAuth = (provider: "google" | "facebook") => {
    if (provider === "google") {
      const backendUrl =
        process.env.NEXT_PUBLIC_SERVER_BASE_URL?.replace("/api", "") ??
        "http://localhost:3000";
      window.location.href = `${backendUrl}/api/auth/google`;
    }
  };

  useEffect(() => {
    if (state.success) {
      router.push("/");
    }
  }, [router, state.success]);

  return (
    <div className="space-y-6">
      {/* Form-level errors */}
      {state.errors?._form && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <p className="text-red-600 text-sm" role="alert">
            {state.errors._form[0]}
          </p>
        </motion.div>
      )}

      {/* Success message */}
      {state.success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-3"
        >
          <p className="text-green-600 text-sm" role="alert">
            {t("signIn.success")}
          </p>
        </motion.div>
      )}

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
