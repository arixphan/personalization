// app/auth-refresh/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_CONFIG } from "@personalization/shared";
import { env } from "@/config/env.server";
import { AuthEndpoint } from "@/constants/endpoints";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN);
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const baseUrl = env.serverBaseUrl;
    const refreshUrl = `${baseUrl}/${AuthEndpoint.refreshToken}`;

    // Server-to-server call to the backend
    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        Cookie: `${AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken.value}`,
      },
    });

    console.log("Nextjs: Refresh token response:", response);

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

    // Set the new access token on the frontend domain
    responseWithCookie.cookies.set(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN, data.access_token, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "strict",
      maxAge: env.jwtAccessExpirationTime,
      path: "/",
    });

    return responseWithCookie;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
