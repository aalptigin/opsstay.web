import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "opsstay_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // her zaman serbest
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  // sadece /panel/* koru
  if (!pathname.startsWith("/panel")) return NextResponse.next();

  // ✅ basit cookie kontrolü
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token !== "1") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
