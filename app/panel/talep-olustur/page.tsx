// app/panel/talep-olustur/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PanelPermission = "admin" | "editor" | "viewer";

type PanelUser = {
  hotelName: string;
  fullName: string;
  userId: string;
  roleLabel: string;
  department: string;
  permission: PanelPermission;
};

type RiskLevel = "bilgi" | "dikkat" | "kritik";

const RISK_LEVELS: { value: RiskLevel; label: string; desc: string }[] = [
  {
    value: "bilgi",
    label: "Bilgi",
    desc: "Sadece kayıt amaçlı, düşük riskli durumlar.",
  },
  {
    value: "dikkat",
    label: "Dikkat",
    desc: "Takip edilmesi gereken, operasyona etkisi olabilecek durumlar.",
  },
  {
    value: "kritik",
    label: "Kritik",
    desc: "Güvenlik, şiddet, ciddi şikayet, ödeme sorunları vb.",
  },
];

export default function TalepOlusturPage() {
  const [user, setUser] = useState<PanelUser | null>(null);

  const [fullName, setFullName] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [department, setDepartment] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("bilgi");
  const [summary, setSummary] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Kullanıcı bilgisini localStorage'dan oku
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("opsstay_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PanelUser;
        setUser(parsed);
        // Otel ve departmanı otomatik doldur
        setHotelName(parsed.hotelName || "");
        setDepartment(parsed.department || "");
      } catch {
        setUser(null);
      }
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim() || !summary.trim()) {
      setError("Misafir adı ve açıklama alanlarını doldurun.");
      return;
    }

    if (!hotelName.trim()) {
      setError("Otel adı boş olamaz.");
      return;
    }

    if (!department.trim()) {
      setError("Departman bilgisini girin.");
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase.from("risk_requests").insert({
        full_name: fullName.trim(),
        hotel_name: hotelName.trim(),
        department: department.trim(),
        risk_level: riskLevel,
        summary: summary.trim(),

        created_by_user_id: user?.userId ?? null,
        created_by_name: user?.fullName ?? null,
        created_by_department: user?.department ?? department.trim() ?? null,
        // status alanı default olarak 'bekliyor' gelecek
      });

      if (insertError) {
        console.error(insertError);
        throw insertError;
      }

      setSuccess(
        "Talebiniz kaydedildi. Müdür onayından sonra misafir ön kontrol kayıtlarına eklenecektir."
      );
      setFullName("");
      setSummary("");
      // riskLevel, hotelName, department olduğu gibi kalabilir
    } catch (err: any) {
      console.error(err);
      setError(
        "Talep oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full px-6 py-6 md:px-10 md:py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
            Yeni risk talebi oluştur
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Misafirle yaşanan durumu özetleyin. Talebiniz sadece operasyon
            ekibi ve müdür tarafından görülecek, kişisel veriler paylaşılmadan
            değerlendirme yapılacaktır.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-[12px] text-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-[12px] text-emerald-100">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4 md:px-6 md:py-6"
        >
          {/* Misafir adı */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-200">
              Misafir adı soyadı
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Örn: Ad Soyad"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
            />
          </div>

          {/* Otel & departman */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-200">
                Otel
              </label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="Örn: Opsstay Hotel Taksim"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-200">
                Departman
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Örn: Ön Büro • Resepsiyon"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
              />
            </div>
          </div>

          {/* Risk seviyesi */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-200">
              Risk seviyesi
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {RISK_LEVELS.map((level) => {
                const active = riskLevel === level.value;
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setRiskLevel(level.value)}
                    className={`text-left rounded-xl border px-3 py-2 text-[11px] transition-colors ${
                      active
                        ? "border-sky-500 bg-sky-500/15 text-sky-100"
                        : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-sky-500/60 hover:bg-slate-900"
                    }`}
                  >
                    <div className="font-medium text-[11px] mb-1">
                      {level.label}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {level.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Açıklama */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-200">
              Durumun özeti
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={5}
              placeholder="Kısa ve net bir şekilde ne olduğunu yazın. Tarih, olay yeri, davranış, varsa şahitler vb."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-500 max-w-md">
              Bu alan yalnızca yetkili operasyon ve yönetim ekibi tarafından
              görülür. Misafir bilgileri KVKK prensiplerine uygun şekilde
              anonimleştirilir.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-full bg-sky-500 hover:bg-sky-400 px-5 py-2 text-[12px] font-semibold text-slate-950 disabled:opacity-60"
            >
              {loading ? "Gönderiliyor..." : "Talep oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
