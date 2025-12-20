"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { normTR } from "@/lib/normTR";

type RiskRequest = {
  id: string;
  full_name: string | null;
  full_name_norm?: string | null;
  risk_level: string | null;
  summary: string | null;
  status: string | null;
  created_at?: string | null;

  // opsiyonel alanlar (varsa gösterir)
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
  const [me, setMe] = useState<StaffProfile | null>(null);
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

  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) return;

        const { data: prof } = await supabase
          .from("staff_profiles")
          .select("full_name, role, department, hotel_name")
          .eq("user_id", user.id)
          .maybeSingle();

        setMe((prof as any) || null);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function load() {
    setErr(null);
    setInfo(null);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("risk_requests")
        .select("*")
        .eq("status", filter)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data || []) as RiskRequest[]);
    } catch (e: any) {
      setErr(e?.message || "Talepler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function approve(req: RiskRequest) {
    setErr(null);
    setInfo(null);

    if (!req?.id) return;
    const fullName = (req.full_name || "").trim();
    if (!fullName) {
      setErr("Talep içinde ad soyad yok, onaylanamaz.");
      return;
    }

    setLoading(true);

    try {
      // 1) Talebi approved yap (sadece status güncelliyoruz -> kolon uyumsuzluğu riski yok)
      const { error: upErr } = await supabase
        .from("risk_requests")
        .update({ status: "approved" })
        .eq("id", req.id);

      if (upErr) throw upErr;

      // 2) risk_records’a ekle (sadece görünen kolonlar)
      const sum = (req.summary || "").trim() || "Ön kontrol notu girilmedi.";
      const lvl = (req.risk_level || "bilgi").toLowerCase();

      const { error: insErr } = await supabase.from("risk_records").insert({
        full_name: fullName,
        full_name_norm: normTR(fullName),
        hotel_name: req.created_by_hotel || me?.hotel_name || null,
        department: req.created_by_department || me?.department || null,
        risk_level: lvl,
        summary: sum,
      });

      if (insErr) throw insErr;

      setInfo("Talep onaylandı ve kayıtlara eklendi.");
      await load();
    } catch (e: any) {
      setErr(`Talep onayı başarısız: ${e?.message || "Bilinmeyen hata"}`);
      // status approved oldu ama insert olmadıysa, tekrar denemeye açık kalır.
    } finally {
      setLoading(false);
    }
  }

  async function reject(req: RiskRequest) {
    setErr(null);
    setInfo(null);
    if (!req?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("risk_requests")
        .update({ status: "rejected" })
        .eq("id", req.id);

      if (error) throw error;

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

        {err && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}
        {info && (
          <div className="mt-5 rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {info}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {items.length === 0 && !loading && (
            <div className="rounded-2xl border border-slate-700/40 bg-slate-900/25 p-6 text-sm text-slate-300">
              {emptyText}
            </div>
          )}

          {items.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-700/40 bg-slate-900/25 p-6"
            >
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

                  <div className="mt-2 text-sm text-slate-200">
                    {r.summary && r.summary.trim().length > 0 ? r.summary : "Ön kontrol notu girilmedi."}
                  </div>

                  <div className="mt-3 text-xs text-slate-400">
                    Talebi açan:{" "}
                    <span className="text-slate-200 font-medium">
                      {r.created_by_name || "—"}
                    </span>
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
                        onClick={() => reject(r)}
                        disabled={loading}
                        className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 hover:bg-red-500/15 transition disabled:opacity-60"
                      >
                        Reddet
                      </button>
                      <button
                        onClick={() => approve(r)}
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