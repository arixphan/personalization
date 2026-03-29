"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AUTH_CONFIG } from "@personalization/shared";
import { env } from "@/config/env";
import { AuthEndpoint } from "@/constants/endpoints";

/**
 * Auth Callback Page
 *
 * Handles the redirect from the backend after a successful OAuth flow.
 * Reads the short-lived opaque `code` from the URL, exchanges it for
 * real session tokens (set as HttpOnly cookies by the backend), then
 * clears the code from the URL and redirects to home.
 *
 * If the URL contains an `error` param instead, it shows an error message.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setErrorMessage(decodeURIComponent(error));
      setStatus("error");
      return;
    }

    if (!code) {
      setErrorMessage("Invalid callback — missing exchange code.");
      setStatus("error");
      return;
    }

    // Clear the code and stale localStorage data (security hygiene)
    window.history.replaceState({}, document.title, "/auth-callback");
    localStorage.clear();

    const exchangeCode = async () => {
      try {
        const baseUrl = env.serverBaseUrl;
        // Construct the exchange URL properly
        const url = `${baseUrl}/auth/exchange`;



        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `Exchange failed with status ${res.status}`);
        }

        // Cookies are now set by the backend — redirect to home
        router.push("/");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Authentication failed."
        );
        setStatus("error");
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  if (status === "error") {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Sign In Failed
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {errorMessage}
          </p>
          <button
            onClick={() => router.push("/signin")}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
