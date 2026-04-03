import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/token";

const PUBLIC_PATHS = ["/signin", "/signup", "/auth-refresh", "/internal-api"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Allow auth routes and internal APIs through without session checks
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  try {
    const { isAuth, error } = await verifyToken();

    if (isAuth) {
      return NextResponse.next();
    }

    // Session expired — send to dedicated repair page with callback
    if (error === "TOKEN_EXPIRED") {
      const callbackUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(new URL(`/auth-refresh?callbackUrl=${callbackUrl}`, req.nextUrl));
    }

    // No valid session — redirect to sign-in
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  } catch {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }
}

export const config = {
  matcher: [
    "/",
    "/(en|vn)/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
