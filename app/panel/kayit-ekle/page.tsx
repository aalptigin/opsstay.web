"use client";

import { useEffect, useState } from "react";

type MeProfile = {
  full_name?: string | null;
  fullName?: string | null;
  role?: string | null;
  roleLabel?: string | null;
  department?: string | null;
  hotel_name?: string | null;
  hotelName?: string | null;
  permission?: string | null;
};

function pickFullName(p: MeProfile) {
  return p.full_name ?? p.fullName ?? "Operasyon Müdürü";
}
function pickHotel(p: MeProfile) {
  return p.hotel_name ?? p.hotelName ?? "Opsstay Hotel Taksim";
}
function pickDepartment(p: MeProfile) {
  return p.department ?? "Ön Büro";
}

export default function Page() {
  const [me, setMe] = useState<MeProfile>({
    full_name: "Operasyon Müdürü",
    role: "manager",
    department: "Operasyon",
    hotel_name: "Opsstay Hotel Taksim",
  });

  const [fullName, setFullName] = useState("");
  const [riskLevel, setRiskLevel] = useState<"bilgi" | "dikkat" | "kritik">("bilgi");
  const [summary, setSummary] = useState("");

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("opsstay_user"); // ✅ login ile aynı
      if (raw) setMe(JSON.parse(raw));
    } catch {}
  }, []);

  const infoText = {
    bilgi:
      "Bilgi: Bu kişiyle ilgili hafif/operasyonel bir not var. Misafir kabulü yine otel inisiyatifindedir.",
    dikkat:
      "Dikkat: Daha önce sorun yaşanmış olabilir. Ek teyit önerilir (yönetici/güvenlik bilgilendirilebilir).",
    kritik:
      "Kritik: Ciddi risk olabilir. Satış/konaklama kararı yönetim onayı olmadan verilmemelidir.",
  }[riskLevel];

  async function onSubmit() {
    setErr(null);
    setOk(null);

    const name = fullName.trim();
    if (!name) {
      setErr("Lütfen ad soyad girin.");
      return;
    }

    setLoading(true);
    try {
      const sum = summary.trim() || "Ön kontrol notu girilmedi.";

      const r = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_record",
          full_name: name,
          risk_level: riskLevel,
          summary: sum,
          hotel_name: pickHotel(me),
          department: pickDepartment(me),
          created_by_name: pickFullName(me),
        }),
      });

      const data = await r.json();
      if (!data?.ok) throw new Error(data?.error || "Kayıt eklenemedi.");

      setOk("Kayıt eklendi. Sorgu ekranında artık çıkacak.");
      setFullName("");
      setRiskLevel("bilgi");
      setSummary("");
    } catch (e: any) {
      setErr(e?.message || "Kayıt eklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-sky-950/50 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Müdür kayıt ekleme</h1>
          <p className="mt-2 text-sm text-slate-300">
            Ad soyad + risk seviyesi + değerlendirme notu girilir. Bu kayıt sorguda görünür ve operasyonu bilgilendirir.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/35 backdrop-blur p-6">
          <div className="text-xs tracking-[0.25em] text-slate-400 font-semibold mb-3">KAYIT BİLGİLERİ</div>

          <label className="text-xs font-semibold tracking-widest text-slate-400">AD SOYAD</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Örn: Adem Ender"
            className="mt-2 w-full rounded-xl border border-slate-700/50 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
          />

          <div className="mt-4 text-xs font-semibold tracking-widest text-slate-400">RİSK SEVİYESİ</div>

          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              onClick={() => setRiskLevel("bilgi")}
              className={`rounded-xl border px-4 py-3 text-sm transition ${
                riskLevel === "bilgi"
                  ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-100"
                  : "border-slate-700/40 bg-slate-950/30 text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              Bilgi
            </button>

            <button
              onClick={() => setRiskLevel("dikkat")}
              className={`rounded-xl border px-4 py-3 text-sm transition ${
                riskLevel === "dikkat"
                  ? "border-amber-300/30 bg-amber-400/15 text-amber-100"
                  : "border-slate-700/40 bg-slate-950/30 text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              Dikkat
            </button>

            <button
              onClick={() => setRiskLevel("kritik")}
              className={`rounded-xl border px-4 py-3 text-sm transition ${
                riskLevel === "kritik"
                  ? "border-red-400/30 bg-red-500/15 text-red-200"
                  : "border-slate-700/40 bg-slate-950/30 text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              Kritik
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-slate-700/40 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">
            <div className="text-xs font-semibold tracking-widest text-slate-400 mb-1">BİLGİLENDİRME</div>
            {infoText}
          </div>

          <label className="mt-5 block text-xs font-semibold tracking-widest text-slate-400">DEĞERLENDİRME NOTU</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Örn: ödeme yapmadı / taşkınlık / güvenlikle tartıştı..."
            rows={4}
            className="mt-2 w-full rounded-xl border border-slate-700/50 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
          />

          <button
            onClick={onSubmit}
            disabled={loading}
            className="mt-5 w-full rounded-full bg-sky-500/95 hover:bg-sky-400 transition py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading ? "Ekleniyor..." : "Kaydı ekle"}
          </button>

          {ok && (
            <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{ok}</div>
          )}
          {err && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</div>
          )}
        </div>
      </div>
    </div>
  );
}
