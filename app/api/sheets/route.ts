export const runtime = "edge";

async function callSheets(payload: any) {
  const url = process.env.SHEETS_API_URL!;
  const key = process.env.SHEETS_API_KEY!;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, ...payload }),
  });
  const data = await res.json();
  return { res, data };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { res, data } = await callSheets(body);
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";
  const q = url.searchParams.get("q") || "";
  const status = url.searchParams.get("status") || "";

  // GET için Sheets’e querystring ile key göndereceğiz
  const sheetsUrl = new URL(process.env.SHEETS_API_URL!);
  sheetsUrl.searchParams.set("key", process.env.SHEETS_API_KEY!);
  sheetsUrl.searchParams.set("action", action);
  if (q) sheetsUrl.searchParams.set("q", q);
  if (status) sheetsUrl.searchParams.set("status", status);

  const res = await fetch(sheetsUrl.toString(), { method: "GET" });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
