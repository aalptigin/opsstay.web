import { NextResponse } from "next/server";

const SHEETS_URL = process.env.SHEETS_API_URL; // Apps Script /exec URL
const API_KEY = process.env.SHEETS_API_KEY || "";
const COOKIE_NAME = "opsstay_session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!SHEETS_URL) {
      return NextResponse.json({ ok: false, error: "SHEETS_API_URL yok" }, { status: 500 });
    }

    // Apps Script'e login isteği
    const r = await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: API_KEY,
        action: "login",
        email,
        password,
      }),
      cache: "no-store",
    });

    const text = await r.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { ok: false, error: text };
    }

    if (!data?.ok) {
      return NextResponse.json({ ok: false, error: data?.error || "Login failed" }, { status: 401 });
    }

    // ✅ cookie SET (kritik kısım)
    const res = NextResponse.json({ ok: true, user: data.user || null });

    // Cloudflare Pages => HTTPS olduğundan secure=true çalışır
    // Localhost HTTP => secure=false olmalı
    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set({
      name: COOKIE_NAME,
      value: "1",
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,     // prod: true, local: false
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
