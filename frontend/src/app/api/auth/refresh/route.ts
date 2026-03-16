// app/api/refresh/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_CONFIG } from "@personalization/shared";

import { AuthEndpoint } from "@/constants/endpoints";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN);
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const baseUrl = process.env.SERVER_BASE_URL || "http://localhost:3000/api";
    const response = await fetch(`${baseUrl}/${AuthEndpoint.refreshToken}`, {
      method: "POST",
      headers: {
        Cookie: `${AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken.value}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Token refresh failed" },
        { status: 401 }
      );
    }

    const responseWithCookie = NextResponse.json({
      success: true,
      access_token: data.access_token,
    });

    responseWithCookie.cookies.set(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN, data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: AUTH_CONFIG.EXPIRATION.ACCESS_TOKEN_COOKIE_MAX_AGE,
      path: "/",
    });

    return responseWithCookie;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
