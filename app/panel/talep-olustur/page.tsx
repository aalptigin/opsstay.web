"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getMyProfile } from "@/lib/authProfile";

const HELP: Record<string, string> = {
  bilgi: "Operasyonu bilgilendirmek için: düşük seviye, izleme amaçlı notlar.",
  dikkat: "Dikkat gerektiren durumlar: tekrar eden uygunsuz davranış, ödeme/uyum riski vb.",
  kritik: "Acil müdahale gerektiren durumlar: güvenlik riski, ciddi taşkınlık vb.",
};

export default function TalepOlusturPage() {
  const [fullName, setFullName] = useState("");
  const [riskLevel, setRiskLevel] = useState<"bilgi" | "dikkat" | "kritik">("bilgi");
  const [note, setNote] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const helpText = useMemo(() => HELP[riskLevel], [riskLevel]);

  async function submit() {
    setMsg("");
    const name = fullName.trim();
    const n = note.trim();

    if (name.length < 3) return setMsg("Lütfen ad soyad girin.");
    if (n.length < 3) return setMsg("Lütfen kısa bir açıklama yazın.");

    setLoading(true);

    const profile = await getMyProfile();

    const { error } = await supabase.from("risk_requests").insert({
      full_name: name,
      note: n,
      risk_level: riskLevel,
      status: "pending",
      created_by_email: profile?.email || null,
      created_by_name: profile?.full_name || null,
      created_by_role: profile?.role || null,
      created_by_department: profile?.department || null,
      created_by_hotel: profile?.hotel_name || null,
      created_by_code: profile?.staff_code || null,
    });

    setLoading(false);

    if (error) {
      setMsg("Talep gönderilemedi. Lütfen tekrar deneyin.");
      return;
    }

    setFullName("");
    setNote("");
    setRiskLevel("bilgi");
    setMsg("Talebiniz iletildi. Yönetici incelemesinden sonra kayıt oluşturulabilir.");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Talep oluştur</h1>
        <p className="text-sm text-slate-300 mt-2">
          Departmanlardan gelen ön kontrol talepleri buradan yönetime iletilir.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/20 p-5 space-y-4">
        <div>
          <div className="text-sm text-slate-300 mb-2">Ad Soyad</div>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 outline-none focus:border-sky-600/60"
            placeholder="Örn: Ali Yılmaz"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-slate-300">Seviye</div>
            <button
              type="button"
              onClick={() => setInfoOpen((v) => !v)}
              className="text-xs rounded-full border border-slate-700/70 bg-slate-900/30 hover:bg-slate-900/50 px-3 py-1"
            >
              Bilgi
            </button>
          </div>

          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value as any)}
            className="mt-2 w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 outline-none focus:border-sky-600/60"
          >
            <option value="bilgi">Bilgi</option>
            <option value="dikkat">Dikkat</option>
            <option value="kritik">Kritik</option>
          </select>

          {infoOpen ? (
            <div className="mt-3 text-sm text-slate-200 rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="font-semibold mb-1">Seçilen seviye açıklaması</div>
              <div className="text-slate-300">{helpText}</div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-400">{helpText}</div>
          )}
        </div>

        <div>
          <div className="text-sm text-slate-300 mb-2">Açıklama / Not</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[120px] rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 outline-none focus:border-sky-600/60"
            placeholder="Kısa ve net bir özet yazın..."
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-full bg-sky-600/90 hover:bg-sky-600 text-slate-950 font-semibold py-3 transition disabled:opacity-60"
        >
          {loading ? "Gönderiliyor..." : "Talebi gönder"}
        </button>

        {msg ? <div className="text-sm text-slate-300">{msg}</div> : null}
      </div>
    </div>
  );
}
