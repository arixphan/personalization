// hooks/useRefreshAccessToken.ts
"use client";

import { REFRESH_TOKEN_ENDPOINT } from "@/constants/endpoints";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useRefreshAccessToken = () => {
  const router = useRouter();

  useEffect(() => {
    const refresh = async () => {
      console.log("Refreshing access token...");
      try {
        const res = await fetch(REFRESH_TOKEN_ENDPOINT, {
          method: "POST",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          router.replace("/signin");
        }
        localStorage.setItem("access_token", data.access_token);
      } catch {
        router.replace("/signin");
      }
    };

    const timer = setInterval(refresh, 5 * 60 * 1000); // 25 minutes
    return () => clearInterval(timer);
  }, [router]);
};
