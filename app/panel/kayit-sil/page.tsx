"use client";

import { useEffect, useState } from "react";

type RiskRecord = {
  id: string;
  full_name: string | null;
  hotel_name: string | null;
  department: string | null;
  risk_level: string | null;
  summary: string | null;
  created_at?: string | null;
};

export default function KayitSilPage() {
  const [items, setItems] = useState<RiskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    setLoading(true);

    try {
      const r = await fetch(`/api/sheets?action=list_records&limit=100`, { cache: "no-store" });
      const data = await r.json();

      if (!data?.ok) throw new Error(data?.error || "Kayıtlar getirilemedi.");
      setItems((data.items || []) as RiskRecord[]);
    } catch (e: any) {
      setMsg(e?.message || "Kayıtlar getirilemedi.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    setMsg("");

    try {
      const r = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_record", id }),
      });

      const data = await r.json();
      if (!data?.ok) throw new Error(data?.error || "Silme işlemi başarısız.");

      setItems((prev) => prev.filter((x) => x.id !== id));
      setMsg("Kayıt silindi.");
    } catch (e: any) {
      setMsg(e?.message || "Silme işlemi başarısız.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Kayıt sil</h1>
          <p className="text-sm text-slate-300 mt-2">Son eklenen kayıtları listeler. Seçtiğiniz kaydı silebilirsiniz.</p>
        </div>

        <button
          onClick={load}
          className="rounded-xl border border-slate-700/70 bg-slate-900/30 hover:bg-slate-900/50 px-4 py-2 text-sm"
        >
          Yenile
        </button>
      </div>

      {msg ? <div className="mb-4 text-sm text-slate-300">{msg}</div> : null}

      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/15 overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-300">Yükleniyor...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-slate-300">Kayıt bulunamadı.</div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {items.map((it) => (
              <div key={it.id} className="p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{it.full_name || "-"}</div>
                  <div className="text-sm text-slate-300">
                    {it.hotel_name || "—"} • {it.department || "—"} • {it.risk_level || "bilgi"}
                  </div>
                  <div className="text-sm text-slate-200 mt-2">{it.summary || "Ön kontrol notu girilmedi."}</div>
                </div>

                <button
                  onClick={() => remove(it.id)}
                  className="shrink-0 rounded-xl border border-red-700/50 bg-red-900/20 hover:bg-red-900/35 px-4 py-2 text-sm text-red-200"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
