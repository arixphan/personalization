"use server";

import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@personalization/shared";
import { env } from "@/config/env.server";
import { REFRESH_TOKEN_ENDPOINT } from "@/constants/endpoints";

export async function exchangeCodeAction(code: string) {
  if (!code) {
    return { error: "Missing exchange code" };
  }

  try {
    const baseUrl = env.serverBaseUrl;
    const url = `${baseUrl}/auth/exchange`;
    console.log('[ExchangeAction] Exchanging code at:', url);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('[ExchangeAction] Exchange failed:', data);
      return { error: data.message || "Failed to exchange code" };
    }

    const cookieStore = await cookies();

    // Set access token
    if (data.access_token) {
      cookieStore.set(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN, data.access_token, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: "strict",
        maxAge: env.jwtAccessExpirationTime,
        path: "/",
      });
    }

    // Set refresh token
    if (data.refresh_token) {
      cookieStore.set(AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN, data.refresh_token, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: "strict",
        maxAge: env.jwtRefreshExpirationTime,
        path: "/",
      });
    }

    console.log('[ExchangeAction] Exchange successful, cookies set on frontend domain.');
    return { success: true };
  } catch (error) {
    console.error('[ExchangeAction] Runtime error:', error);
    return { error: "Server connection failed" };
  }
}
