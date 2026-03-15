"use client";

import { Chrome, Eye, EyeOff, Lock, User } from "lucide-react";
import SocialButton from "./social-button";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useActionState } from "react";
import {
  registerAction,
  RegisterInput,
  RegisterState,
} from "../actions/register";

const inputVariants = {
  focus: { scale: 1.02, transition: { duration: 0.2 } },
  blur: { scale: 1, transition: { duration: 0.2 } },
};

const initialState: RegisterState = {
  success: false,
};

export function SignUpForm() {
  const [formData, setFormData] = useState<RegisterInput>({
    confirmPassword: "",
    password: "",
    username: "",
  });

  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state.success && state.message) {
      console.log("Registration successful:", state.message);
    }
  }, [state.success, state.message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialAuth = (provider: "google" | "facebook") => {
    console.log(`Register with ${provider}`);
  };

  return (
    <form action={formAction} className="space-y-6">
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

      {/* Username */}
      <motion.div variants={inputVariants}>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
          Username
        </label>
        <div className="relative">
          <User
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            size={20}
            role="presentation"
          />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            disabled={isPending}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed ${
              state.errors?.username
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            }`}
            placeholder="Enter your username"
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
            id="username-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-1"
          >
            {state.errors.username[0]}
          </motion.p>
        )}
      </motion.div>

      {/* Password */}
      <motion.div variants={inputVariants}>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
          Password
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            size={20}
            role="presentation"
          />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            name="password"
            disabled={isPending}
            className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed ${
              state.errors?.password
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            }`}
            placeholder="Enter your password"
            required
            aria-required="true"
            aria-describedby={
              state.errors?.password ? "password-error" : undefined
            }
            aria-invalid={!!state.errors?.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={showPassword ? "Hide password" : "Show password"}
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
          >
            {state.errors.password[0]}
          </motion.p>
        )}
      </motion.div>

      {/* Confirm Password */}
      <motion.div variants={inputVariants}>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
          Confirm Password
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            size={20}
            role="presentation"
          />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={isPending}
            className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed ${
              state.errors?.confirmPassword
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            }`}
            placeholder="Confirm your password"
            required
            aria-required="true"
            aria-describedby={
              state.errors?.confirmPassword
                ? "confirm-password-error"
                : undefined
            }
            aria-invalid={!!state.errors?.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isPending}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {state.errors?.confirmPassword && (
          <motion.p
            id="confirm-password-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-1"
          >
            {state.errors.confirmPassword[0]}
          </motion.p>
        )}
      </motion.div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: isPending ? 1 : 1.02 }}
        whileTap={{ scale: isPending ? 1 : 0.98 }}
        type="submit"
        disabled={isPending}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 text-white ${
          isPending
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
        }`}
      >
        {isPending ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Creating Account...</span>
          </div>
        ) : (
          "Create Account"
        )}
      </motion.button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center text-gray-400 dark:text-gray-600">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Auth */}
      <div className="space-y-3">
        <SocialButton
          provider="google"
          onClick={() => handleSocialAuth("google")}
        >
          <Chrome size={20} />
          <span className="font-medium">Continue with Google</span>
        </SocialButton>
        <SocialButton
          provider="facebook"
          onClick={() => handleSocialAuth("facebook")}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="font-medium">Continue with Facebook</span>
        </SocialButton>
      </div>

      {/* Sign In Link */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}
