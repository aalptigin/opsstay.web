export const runtime = "edge";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function passthrough(res: Response) {
  const text = await res.text();
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");

  if (isJson) {
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // JSON değilse crash yok: debug dön
  return new Response(
    JSON.stringify({
      ok: false,
      error: "Upstream did not return JSON",
      status: res.status,
      contentType: ct,
      preview: text.slice(0, 300),
    }),
    { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
}

export async function GET(req: Request) {
  const SHEETS_API_URL = mustEnv("SHEETS_API_URL");
  const SHEETS_API_KEY = mustEnv("SHEETS_API_KEY");

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";
  const q = url.searchParams.get("q") || "";
  const status = url.searchParams.get("status") || "";
  const limit = url.searchParams.get("limit") || "";

  const target = new URL(SHEETS_API_URL);
  target.searchParams.set("key", SHEETS_API_KEY);
  target.searchParams.set("action", action);
  if (q) target.searchParams.set("q", q);
  if (status) target.searchParams.set("status", status);
  if (limit) target.searchParams.set("limit", limit);

  const res = await fetch(target.toString(), { method: "GET", redirect: "follow" });
  return passthrough(res);
}

export async function POST(req: Request) {
  const SHEETS_API_URL = mustEnv("SHEETS_API_URL");
  const SHEETS_API_KEY = mustEnv("SHEETS_API_KEY");

  const body = await req.json().catch(() => ({}));

  const res = await fetch(SHEETS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    body: JSON.stringify({ key: SHEETS_API_KEY, ...body }),
  });

  return passthrough(res);
}
