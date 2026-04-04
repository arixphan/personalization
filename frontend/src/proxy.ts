import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { AUTH_CONFIG } from "@personalization/shared";

const PUBLIC_PATHS = [
  "/signin",
  "/signup",
  "/auth-callback",
  "/auth-refresh",
  "/internal-api",
];

/**
 * Verify the access token in the proxy (middleware) using jose.
 * Cannot use `server-only`, `cookies()` from next/headers,
 * or env.server here — this runs in the middleware Edge-like runtime.
 */
async function verifyAccessToken(
  token: string
): Promise<"valid" | "expired" | "invalid"> {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
       console.error("[Proxy] JWT_SECRET is not defined in environment");
       return "invalid";
    }

    const secret = new TextEncoder().encode(jwtSecret);
    await jose.jwtVerify(token, secret, { 
      algorithms: ["HS256"],
      clockTolerance: 600 // 10 minutes tolerance for clock drift
    });
    return "valid";
  } catch (err: any) {
    if (err?.code === "ERR_JWT_EXPIRED") {
      return "expired";
    }
    return "invalid";
  }
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAuthPage =
    path.startsWith("/signin") || path.startsWith("/signup");

  const accessToken = req.cookies.get(
    AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN
  )?.value;

  // Public paths: allow through, but redirect away if already authenticated
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    if (isAuthPage && accessToken) {
      const result = await verifyAccessToken(accessToken);
      if (result === "valid") {
        return NextResponse.redirect(new URL("/", req.nextUrl));
      }
    }
    return NextResponse.next();
  }

  // No token at all → try to repair/refresh before giving up
  if (!accessToken) {
    const callbackUrl = encodeURIComponent(
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(
      new URL(`/auth-refresh?callbackUrl=${callbackUrl}`, req.nextUrl)
    );
  }

  const result = await verifyAccessToken(accessToken);

  if (result === "valid") {
    return NextResponse.next();
  }

  if (result === "expired") {
    // Token expired — send to repair page with callback URL
    const callbackUrl = encodeURIComponent(
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(
      new URL(`/auth-refresh?callbackUrl=${callbackUrl}`, req.nextUrl)
    );
  }

  // Invalid token → sign in
  return NextResponse.redirect(new URL("/signin", req.nextUrl));
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico and other static assets with file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
