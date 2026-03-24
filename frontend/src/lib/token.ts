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
    });
    return payload;
  } catch {
    return null;
  }
}

export const verifyToken = cache(async () => {
  try {
    const accessToken = (await cookies()).get(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN)?.value;
    if (!accessToken) {
      return { isAuth: false, userId: null };
    }

    const session = await decrypt(accessToken);

    if (!session) {
      return { isAuth: false, userId: null };
    }

    // Check if token is expired
    if (session.exp && Date.now() >= session.exp * 1000) {
      return { isAuth: false, userId: null, error: "TOKEN_EXPIRED" };
    }

    return { isAuth: true, userId: session?.userId };
  } catch {
    return { isAuth: false, userId: null };
  }
});

export const guardAuth = cache(async () => {
  const { isAuth, error } = await verifyToken();
  if (!isAuth && error !== "TOKEN_EXPIRED") {
    redirect("/signin");
  }
});
