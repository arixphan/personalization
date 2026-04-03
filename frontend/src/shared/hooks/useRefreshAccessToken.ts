// hooks/useRefreshAccessToken.ts
"use client";

import { REFRESH_TOKEN_ENDPOINT } from "@/constants/endpoints";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

export const useRefreshAccessToken = () => {
  const router = useRouter();

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(REFRESH_TOKEN_ENDPOINT, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("[useRefreshAccessToken] Refresh response not OK", res.status);
        return false;
      }

      const data = await res.json();

      if (data.error) {
        console.error("[useRefreshAccessToken] Refresh data error", data.error);
        return false;
      }

      console.log("[useRefreshAccessToken] Token successfully refreshed");
      return true;
    } catch (error) {
      console.error("[useRefreshAccessToken] Refresh catch error", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      refresh();
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(timer);
  }, [refresh]);

  return { refresh };
};

