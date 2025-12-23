import { NextResponse } from "next/server";

export const runtime = "edge";

const COOKIE_NAME = "opsstay_session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return res;
}
