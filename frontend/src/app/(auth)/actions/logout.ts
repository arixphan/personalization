"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_CONFIG } from "@personalization/shared";
import { AuthEndpoint } from "@/constants/endpoints";
import { ServerApiHandler } from "@/lib/server-api";

export async function logout() {
  try {
    const cookieStore = await cookies();

    // Best-effort: tell the backend to invalidate the session
    await ServerApiHandler.post(AuthEndpoint.logout, {}).catch(() => null);

    // Clear both session cookies
    cookieStore.set(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN, "", { path: "/", maxAge: 0, httpOnly: true });
    cookieStore.set(AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN, "", { path: "/", maxAge: 0, httpOnly: true });

    redirect("/signin");
  } catch (error) {
    const err = error as { digest?: string };
    if (err?.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }

    return { success: false, error: "Server error, please try again" };
  }
}
