import "server-only";

import { jwtVerify } from "jose";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const secretKey = process.env.JWT_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function decrypt(session: string | undefined = "") {
  if (!session) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export const verifyToken = cache(async () => {
  try {
    const accessToken = (await cookies()).get("access_token")?.value;
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

    // // Optional: Check if token was issued too long ago (for additional security)
    // if (
    //   session.iat &&
    //   Date.now() - session.iat * 1000 > 30 * 24 * 60 * 60 * 1000
    // ) {
    //   // 30 days
    //   return { isAuth: false, userId: null, error: "TOKEN_TOO_OLD" };
    // }

    // // Optional: Validate other claims
    // if (session.userId && typeof session.userId !== "string") {
    //   return { isAuth: false, userId: null, error: "INVALID_USER_ID" };
    // }

    return { isAuth: true, userId: session?.userId };
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
