"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { normTR } from "@/lib/normTR";

type RiskRecord = {
  id: string;
  full_name: string | null;
  hotel_name: string | null;
  department: string | null;
  risk_level: string | null;
  summary: string | null;
  created_at?: string | null;
};

function fmtDateTR(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
}

export default function Page() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<RiskRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const qNorm = useMemo(() => normTR(q), [q]);

  async function runSearch() {
    setErr(null);
    setNotFound(false);
    setRecord(null);

    const raw = q.trim();
    if (!raw) return;

    setLoading(true);
    try {
      // 🔥 Sağlam arama: full_name_norm exact/contains + full_name contains
      const orExpr = [
        `full_name_norm.ilike.${qNorm}`,           // exact (pattern % yok)
        `full_name_norm.ilike.%${qNorm}%`,         // contains
        `full_name.ilike.%${raw}%`,                // fallback
      ].join(",");

      const { data, error } = await supabase
        .from("risk_records")
        .select("id, full_name, hotel_name, department, risk_level, summary, created_at")
        .or(orExpr)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      const first = (data && data[0]) ? (data[0] as RiskRecord) : null;
      if (!first) setNotFound(true);
      else setRecord(first);
    } catch (e: any) {
      setErr(e?.message || "Sorgu sırasında hata oluştu.");
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
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Misafir ön kontrol sorgusu</h1>
          <p className="mt-2 text-sm text-slate-300">
            Misafir hakkında ön kontrol yapmak için ad soyad bilgisiyle sorgu yapın.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/35 backdrop-blur p-6">
          <div className="text-xs tracking-[0.25em] text-slate-400 font-semibold mb-3">
            SORGU KRİTERİ
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Örn: Ad Soyad"
            className="w-full rounded-xl border border-slate-700/50 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
          />

          <button
            onClick={runSearch}
            disabled={loading || !q.trim()}
            className="mt-4 w-full rounded-full bg-sky-500/95 hover:bg-sky-400 transition py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading ? "Kontrol ediliyor..." : "Check et"}
          </button>

          <p className="mt-3 text-xs text-slate-400">
            Sonuç burada görünecek. Ad ve soyadı yazıp kontrol edin.
          </p>
        </div>

        {err && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}

        {notFound && (
          <div className="mt-5 rounded-2xl border border-slate-700/40 bg-slate-900/25 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs tracking-[0.25em] text-slate-400 font-semibold">
                  ÖN KONTROL BİLGİSİ BULUNMADI
                </div>
                <div className="mt-2 text-sm text-slate-200">
                  Bu isimle kayıt bulunamadı.
                </div>
              </div>
              <span className="inline-flex items-center rounded-full border border-slate-600/40 bg-slate-900/30 px-3 py-1 text-xs text-slate-300">
                Kayıt yok
              </span>
            </div>
          </div>
        )}

        {record && (
          <div className="mt-5 rounded-2xl border border-slate-700/40 bg-slate-900/25 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs tracking-[0.25em] text-slate-400 font-semibold">
                  ÖN KONTROL BİLGİSİ BULUNDU
                </div>

                <div className="mt-2 text-lg font-semibold">{record.full_name || "-"}</div>

                <div className="mt-1 text-xs text-slate-400">
                  {(record.hotel_name || "—")} • {(record.department || "—")}
                </div>

                <div className="mt-3 text-sm">
                  <span className="text-slate-300">Ön kontrol notu: </span>
                  <span className="text-slate-100">
                    {record.summary && record.summary.trim()
                      ? record.summary
                      : "Ön kontrol notu girilmedi."}
                  </span>
                </div>

                {record.created_at && (
                  <div className="mt-2 text-xs text-slate-400">
                    Kayıt zamanı: {fmtDateTR(record.created_at)}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${badge(record.risk_level)}`}>
                  {record.risk_level || "bilgi"}
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-600/40 bg-slate-900/30 px-3 py-1 text-xs text-slate-300">
                  Bilgilendirme
                </span>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-400">
              Not: Bu ekran operasyon için destek amaçlıdır; son karar otel yönetimine aittir.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
