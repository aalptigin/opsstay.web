import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "opsstay_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Her zaman serbest
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/me") ||
    pathname.startsWith("/api/sheets") ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  // Sadece /panel/* koru
  if (!pathname.startsWith("/panel")) return NextResponse.next();

  const hasSession = req.cookies.get(COOKIE_NAME)?.value;
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
