const API = process.env.NEXT_PUBLIC_SHEETS_API!;

export async function sheetsSearch(q: string) {
  const r = await fetch(`${API}?action=search&q=${encodeURIComponent(q)}`);
  return r.json();
}

export async function sheetsCreateRequest(payload: any) {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create_request", ...payload }),
  });
  return r.json();
}

export async function sheetsListRequests(status: string) {
  const r = await fetch(`${API}?action=list_requests&status=${encodeURIComponent(status)}`);
  return r.json();
}

export async function sheetsApproveRequest(id: string) {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "approve_request", id }),
  });
  return r.json();
}

export async function sheetsRejectRequest(id: string) {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reject_request", id }),
  });
  return r.json();
}

export async function sheetsCreateRecord(payload: any) {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create_record", ...payload }),
  });
  return r.json();
}

export async function sheetsDeleteRecord(id: string) {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete_record", id }),
  });
  return r.json();
}
