// hooks/useRefreshAccessToken.ts
"use client";

import { REFRESH_TOKEN_ENDPOINT } from "@/constants/endpoints";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useRefreshAccessToken = () => {
  const router = useRouter();

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch(REFRESH_TOKEN_ENDPOINT, {
          method: "POST",
          credentials: "include",
        });

        console.log("Refresh token response:", res);

        if (!res.ok) {
          // router.replace("/signin");
          return;
        }

        const data = await res.json();

        if (data.error) {
          // router.replace("/signin");
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
        // router.replace("/signin");
      }
    };

    // Initial check/refresh if needed
    refresh();

    const timer = setInterval(refresh, 25 * 60 * 1000); // 25 minutes
    return () => clearInterval(timer);
  }, [router]);
};
