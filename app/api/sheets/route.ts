import { NextResponse } from "next/server";
export const runtime = "edge";

const SHEETS_URL = process.env.SHEETS_API_URL;
const API_KEY = process.env.SHEETS_API_KEY || "";

async function callSheets(method: "GET" | "POST", url: URL, body?: any) {
  if (!SHEETS_URL) {
    return NextResponse.json({ ok: false, error: "SHEETS_API_URL yok" }, { status: 500 });
  }

  const target = new URL(SHEETS_URL);

  // Apps Script KEY kontrolü varsa her isteğe ekleyelim
  if (method === "GET") {
    // query’leri taşı
    url.searchParams.forEach((v, k) => target.searchParams.set(k, v));
    if (API_KEY && !target.searchParams.get("key")) target.searchParams.set("key", API_KEY);

    const r = await fetch(target.toString(), { method: "GET", cache: "no-store" });
    const text = await r.text();

    // Bazen Apps Script HTML döndürür -> JSON parse patlar. O yüzden güvenli parse:
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: r.status });
    } catch {
      return NextResponse.json({ ok: false, error: text }, { status: 500 });
    }
  }

  // POST
  const payload = { ...(body || {}) };
  if (API_KEY && !payload.key) payload.key = API_KEY;

  const r = await fetch(target.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await r.text();
  try {
    const data = JSON.parse(text);
    return NextResponse.json(data, { status: r.status });
  } catch {
    return NextResponse.json({ ok: false, error: text }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  return callSheets("GET", url);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  return callSheets("POST", url, body);
}
