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

        const data = await res.json();

        if (!res.ok || data.error) {
          router.replace("/sign-in");
        }
      } catch {
        router.replace("/sign-in");
      }
    };

    const timer = setInterval(refresh, 30 * 60 * 3000 * 25); // 25 minutes
    return () => clearInterval(timer);
  }, [router]);
};
