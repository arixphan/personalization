"use client";

import { useActionState, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, User, Lock, Chrome } from "lucide-react";
import SocialButton from "./social-button";
import Link from "next/link";
import { signInAction, SignInInput } from "../actions/login";
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
  const [formData, setFormData] = useState<SignInInput>({
    password: "",
    username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<SignInState, FormData>(
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

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (state.success) {
      router.push("/");
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Username Field */}
      <motion.div variants={inputVariants}>
        <label
          className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200"
          htmlFor="username"
        >
          {t("signIn.username")}
        </label>
        <div className="relative">
          <User
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            size={20}
            role="presentation"
          />
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            autoComplete="on"
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4 ${
              state.errors?.username
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-black dark:text-white focus:border-blue-500 focus:ring-blue-500/20"
            }`}
            placeholder={t("signIn.usernamePlaceholder")}
            required
            aria-required="true"
            aria-describedby={
              state.errors?.username ? "username-error" : undefined
            }
            aria-invalid={!!state.errors?.username}
          />
        </div>
        {state.errors?.username && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-1"
            id="username-error"
            role="alert"
          >
            {state.errors.username[0]}
          </motion.p>
        )}
      </motion.div>

      {/* Password Field */}
      <motion.div variants={inputVariants}>
        <label
          className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200"
          htmlFor="password"
        >
          {t("signIn.password")}
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            size={20}
            role="presentation"
          />
          <input
            id="password"
            name="password"
            value={formData.password}
            autoComplete="current-password"
            onChange={handleInputChange}
            type={showPassword ? "text" : "password"}
            className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4 ${
              state.errors?.password
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-black dark:text-white focus:border-blue-500 focus:ring-blue-500/20"
            }`}
            placeholder={t("signIn.passwordPlaceholder")}
            aria-required="true"
            aria-describedby={
              state.errors?.password ? "password-error" : undefined
            }
            aria-invalid={!!state.errors?.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label={showPassword ? t("signIn.hidePassword") : t("signIn.showPassword")}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {state.errors?.password && (
          <motion.p
            id="password-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-1"
            role="alert"
          >
            {state.errors.password[0]}
          </motion.p>
        )}
      </motion.div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {t("signIn.forgotPassword")}
        </button>
      </div>

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

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isPending || state.success}
        aria-busy={isPending}
        aria-describedby={isPending ? "loading-message" : undefined}
        className={`w-full m-0 py-3 px-4 rounded-lg font-medium transition-all duration-200 text-white ${
          isPending || state.success
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
        }`}
      >
        {isPending ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span id="loading-message">{t("signIn.signingIn")}</span>
          </div>
        ) : (
          t("signIn.submit")
        )}
      </motion.button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center text-gray-400 dark:text-gray-600">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {t("social.orContinueWith")}
          </span>
        </div>
      </div>

      {/* Social Authentication */}
      <div className="space-y-3">
        <SocialButton
          provider="google"
          onClick={() => handleSocialAuth("google")}
        >
          <Chrome size={20} />
          <span className="font-medium">{t("social.continueGoogle")}</span>
        </SocialButton>

        <SocialButton
          provider="facebook"
          onClick={() => handleSocialAuth("facebook")}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="font-medium">{t("social.continueFacebook")}</span>
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
    </form>
  );
};
