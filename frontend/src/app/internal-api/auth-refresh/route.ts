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
    const refreshUrl = `${env.serverBaseUrl}/${AuthEndpoint.refreshToken}`;

    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        Cookie: `${AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken.value}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });

    res.cookies.set(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN, data.access_token, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "lax",
      maxAge: env.jwtAccessExpirationTime,
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
