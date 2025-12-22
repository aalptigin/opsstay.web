import { NextResponse } from "next/server";

const SHEETS_URL = process.env.SHEETS_API_URL; // https://script.google.com/macros/s/.../exec
const API_KEY = process.env.SHEETS_API_KEY || "";
const COOKIE_NAME = "opsstay_session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!SHEETS_URL) {
      return NextResponse.json(
        { ok: false, error: "SHEETS_API_URL yok (Cloudflare env ekle)" },
        { status: 500 }
      );
    }

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

    // ✅ Apps Script JSON dönmüyorsa net hata göster
    if (!text.trim().startsWith("{")) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Apps Script JSON dönmedi (HTML döndü). Deploy erişimini 'Anyone' yap ve doPost login action JSON döndürsün.",
          debug: text.slice(0, 200),
        },
        { status: 502 }
      );
    }

    const data = JSON.parse(text);

    if (!data?.ok) {
      return NextResponse.json(
        { ok: false, error: data?.error || "Login failed" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true, user: data.user || null });

    // ✅ cookie set
    res.cookies.set({
      name: COOKIE_NAME,
      value: "1",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
