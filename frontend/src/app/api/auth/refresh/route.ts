// app/api/refresh/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AuthEndpoint } from "@/constants/endpoints";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token");
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const response = await fetch(AuthEndpoint.refreshToken, {
      headers: {
        refresh_token: refreshToken.value,
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
    responseWithCookie.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });

    return responseWithCookie;
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
