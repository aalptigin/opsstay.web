import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "opsstay_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // serbest sayfalar
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/sheets") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // sadece /panel/* koru
  if (!pathname.startsWith("/panel")) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token === "1") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/panel/:path*"],
};
