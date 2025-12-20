"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type RiskRecord = {
  id: string;
  full_name: string;
  hotel_name: string | null;
  department: string | null;
  risk_level: string | null;
  summary: string | null;
};

export default function KayitSilPage() {
  const [items, setItems] = useState<RiskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    setLoading(true);

    const { data, error } = await supabase
      .from("risk_records")
      .select("id, full_name, hotel_name, department, risk_level, summary")
      .order("created_at", { ascending: false })
      .limit(100);

    setLoading(false);

    if (error) {
      setMsg("Kayıtlar getirilemedi.");
      return;
    }

    setItems((data || []) as any);
  }

  async function remove(id: string) {
    setMsg("");

    const { error } = await supabase.from("risk_records").delete().eq("id", id);

    if (error) {
      setMsg("Silme işlemi başarısız.");
      return;
    }

    setItems((prev) => prev.filter((x) => x.id !== id));
    setMsg("Kayıt silindi.");
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Kayıt sil</h1>
          <p className="text-sm text-slate-300 mt-2">
            Son eklenen kayıtları listeler. Seçtiğiniz kaydı silebilirsiniz.
          </p>
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
                  <div className="font-semibold">{it.full_name}</div>
                  <div className="text-sm text-slate-300">
                    {it.hotel_name || "—"} • {it.department || "—"} • {it.risk_level || "bilgi"}
                  </div>
                  <div className="text-sm text-slate-200 mt-2">
                    {it.summary || "Ön kontrol notu girilmedi."}
                  </div>
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
