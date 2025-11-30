import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/token";

const protectedRoutes = ["/"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);

  try {
    const { isAuth } = await verifyToken();

    // Redirect to /signin if the user is not authenticated
    if (isProtectedRoute && !isAuth) {
      return NextResponse.redirect(new URL("/signin", req.nextUrl));
    }
  } catch {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
