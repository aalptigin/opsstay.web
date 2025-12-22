"use client";

import { useEffect, useMemo, useState } from "react";

type RiskRequest = {
  id: string;
  full_name: string | null;
  risk_level: string | null;
  summary: string | null;
  status: string | null;
  created_at?: string | null;

  created_by_name?: string | null;
  created_by_role?: string | null;
  created_by_department?: string | null;
  created_by_hotel?: string | null;
};

type StaffProfile = {
  full_name?: string | null;
  role?: string | null;
  department?: string | null;
  hotel_name?: string | null;
};

function fmtDateTR(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
}

export default function Page() {
  // ✅ Demo profil
  const [me] = useState<StaffProfile>({
    full_name: "Operasyon Müdürü",
    role: "manager",
    department: "Operasyon",
    hotel_name: "Opsstay Hotel Taksim",
  });

  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RiskRequest[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const emptyText = useMemo(() => {
    if (filter === "pending") return "Bekleyen talep yok.";
    if (filter === "approved") return "Onaylanan talep yok.";
    return "Reddedilen talep yok.";
  }, [filter]);

  async function load() {
    setErr(null);
    setInfo(null);
    setLoading(true);

    try {
      const r = await fetch(`/api/sheets?action=list_requests&status=${filter}`, { cache: "no-store" });
      const data = await r.json();
      if (!data?.ok) throw new Error(data?.error || "Talepler yüklenemedi.");

      setItems((data.items || []) as RiskRequest[]);
    } catch (e: any) {
      setErr(e?.message || "Talepler yüklenemedi.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function approve(id: string) {
    setErr(null);
    setInfo(null);

    setLoading(true);
    try {
      const r = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_request", id }),
      });
      const data = await r.json();
      if (!data?.ok) throw new Error(data?.error || "Talep onayı başarısız");

      setInfo("Talep onaylandı ve kayıtlara eklendi.");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Talep onayı başarısız.");
    } finally {
      setLoading(false);
    }
  }

  async function reject(id: string) {
    setErr(null);
    setInfo(null);

    setLoading(true);
    try {
      const r = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_request", id }),
      });
      const data = await r.json();
      if (!data?.ok) throw new Error(data?.error || "Talep reddedilemedi");

      setInfo("Talep reddedildi.");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Talep reddedilemedi.");
    } finally {
      setLoading(false);
    }
  }

  const badge = (lvl?: string | null) => {
    const v = (lvl || "").toLowerCase();
    if (v.includes("kritik")) return "bg-red-500/15 text-red-200 border-red-400/30";
    if (v.includes("dikkat")) return "bg-amber-400/15 text-amber-100 border-amber-300/30";
    if (v.includes("bilgi")) return "bg-emerald-400/15 text-emerald-100 border-emerald-300/30";
    return "bg-sky-400/15 text-sky-100 border-sky-300/30";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-sky-950/50 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Müdür talep paneli</h1>
            <p className="mt-2 text-sm text-slate-300">
              Resepsiyon, güvenlik ve diğer departmanlardan gelen ön kontrol taleplerini buradan yönetirsiniz.
              Onaylanan talepler, misafir ön kontrol kayıtlarına eklenir.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Demo profil: {me.full_name} • {me.hotel_name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-full border border-slate-700/50 bg-slate-950/40 px-4 py-2 text-sm outline-none"
            >
              <option value="pending">Bekleyen talepler</option>
              <option value="approved">Onaylanan talepler</option>
              <option value="rejected">Reddedilen talepler</option>
            </select>
            <button
              onClick={load}
              className="rounded-full border border-slate-700/50 bg-slate-950/40 px-4 py-2 text-sm hover:bg-slate-900/40 transition"
            >
              Yenile
            </button>
          </div>
        </div>

        {err && <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</div>}
        {info && <div className="mt-5 rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{info}</div>}

        <div className="mt-6 space-y-4">
          {items.length === 0 && !loading && (
            <div className="rounded-2xl border border-slate-700/40 bg-slate-900/25 p-6 text-sm text-slate-300">{emptyText}</div>
          )}

          {items.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-700/40 bg-slate-900/25 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-lg font-semibold">{r.full_name || "-"}</div>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${badge(r.risk_level)}`}>
                      {r.risk_level || "bilgi"}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-600/40 bg-slate-900/30 px-3 py-1 text-xs text-slate-300">
                      {r.status || "-"}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-slate-200">{r.summary?.trim() ? r.summary : "Ön kontrol notu girilmedi."}</div>

                  <div className="mt-3 text-xs text-slate-400">
                    Talebi açan: <span className="text-slate-200 font-medium">{r.created_by_name || "—"}</span>
                    {r.created_by_role ? ` (${r.created_by_role})` : ""}
                    {r.created_by_department ? ` • ${r.created_by_department}` : ""}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-xs text-slate-400">
                    {r.created_by_hotel ? `${r.created_by_hotel} • ` : ""}
                    {fmtDateTR(r.created_at)}
                  </div>

                  {filter === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => reject(r.id)}
                        disabled={loading}
                        className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 hover:bg-red-500/15 transition disabled:opacity-60"
                      >
                        Reddet
                      </button>
                      <button
                        onClick={() => approve(r.id)}
                        disabled={loading}
                        className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-400/15 transition disabled:opacity-60"
                      >
                        Onayla
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-400">
                Not: Onaylanan talepler otomatik olarak misafir ön kontrol kayıtlarına eklenir. Reddedilen talepler sadece kayıt amaçlı saklanır.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
