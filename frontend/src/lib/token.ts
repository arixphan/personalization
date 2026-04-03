import "server-only";

import * as jose from "jose";
import { env } from "@/config/env.server";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_CONFIG } from "@personalization/shared";

const secret = new TextEncoder().encode(env.jwtSecret);

export async function decrypt(session: string | undefined = "") {
  if (!session) {
    return null;
  }

  try {
    const { payload } = await jose.jwtVerify(session, secret, {
      algorithms: ["HS256"],
      clockTolerance: 600, // 10-minute tolerance for clock drift between frontend and backend
    });
    return payload;
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return jose.decodeJwt(session);
    }
    return null;
  }
}

export const verifyToken = cache(async () => {
  try {
    const accessToken = (await cookies()).get(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN)?.value;
    if (!accessToken) {
      return { isAuth: false, userId: null };
    }

    const payload = await decrypt(accessToken);

    if (!payload) {
      // Decode to check if it's specifically expired (vs corrupted/invalid)
      const decoded = jose.decodeJwt(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && (currentTime - 600) >= decoded.exp) {
        return { isAuth: false, userId: null, error: "TOKEN_EXPIRED" };
      }
      return { isAuth: false, userId: null };
    }

    return { isAuth: true, userId: payload?.sub };
  } catch {
    return { isAuth: false, userId: null };
  }
});

export const guardAuth = cache(async () => {
  const { isAuth } = await verifyToken();
  if (!isAuth) {
    redirect("/signin");
  }
});
