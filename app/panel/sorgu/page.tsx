// app/panel/sorgu/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type RiskLevel = "bilgi" | "dikkat" | "kritik";

type RiskRecord = {
  id: string;
  full_name: string;
  hotel_name: string;
  department: string;
  risk_level: RiskLevel;
  summary: string;
  created_at: string;
};

type PanelPermission = "admin" | "editor" | "viewer";

type PanelUser = {
  hotelName: string;
  fullName: string;
  userId: string;
  roleLabel: string;
  department: string;
  permission: PanelPermission;
};

export default function SorguPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<RiskRecord | "none" | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<PanelUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("opsstay_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const canCreateDirect = user?.permission === "admin";
  const canCreateRequest = user != null && user.permission !== "admin";

  function normalize(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u");
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const normalized = normalize(query);

      const { data, error } = await supabase
        .from("risk_records")
        .select("*")
        .ilike("full_name", normalized); // birebir eşleşme yerine esnek arama

      if (error) throw error;

      if (!data || data.length === 0) {
        setResult("none");
      } else {
        // şimdilik ilk kaydı göster
        setResult(data[0] as RiskRecord);
      }
    } catch (err: any) {
      console.error(err);
      setError("Sorgu sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function renderLevelBadge(level: RiskLevel) {
    const config =
      level === "bilgi"
        ? {
            label: "Bilgilendirme notu",
            bg: "bg-emerald-500/10",
            border: "border-emerald-400/40",
            text: "text-emerald-300",
          }
        : level === "dikkat"
        ? {
            label: "Dikkat gerektiren durum",
            bg: "bg-amber-500/10",
            border: "border-amber-400/40",
            text: "text-amber-300",
          }
        : {
            label: "Yüksek önemde uyarı",
            bg: "bg-red-500/10",
            border: "border-red-400/40",
            text: "text-red-300",
          };

    return (
      <span
        className={`${config.bg} ${config.border} ${config.text} inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium`}
      >
        {config.label}
      </span>
    );
  }

  return (
    <div className="min-h-full px-6 py-6 md:px-10 md:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Başlık */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
            Misafir ön kontrol sorgusu
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Misafir hakkında ön kontrol yapmak için ad soyad bilgisiyle sorgu
            yapın. Sistem yalnızca operasyon için gerekli özet görüşü sunar.
          </p>
        </div>

        {/* Sorgu formu */}
        <form
          onSubmit={handleSearch}
          className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 md:p-6 shadow-lg"
        >
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-[0.18em]">
              Sorgu kriteri
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
              placeholder="Örn: Ad Soyad"
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full rounded-full bg-sky-500 hover:bg-sky-600 text-sm font-semibold text-slate-950 py-2.5 shadow-md hover:shadow-lg transition-all disabled:opacity-70"
            >
              {loading ? "Sorgulanıyor..." : "Check et"}
            </button>
          </div>
        </form>

        {/* Hata */}
        {error && (
          <p className="mt-3 text-xs text-red-300">
            {error}
          </p>
        )}

        {/* Sonuç alanı */}
        <div className="mt-6">
          {result === null && !loading && !error && (
            <p className="text-xs text-slate-500">
              Sorgu sonucu burada görünecek. Misafir adını ve soyadını tam
              yazarak başlayın.
            </p>
          )}

          {result === "none" && !loading && !error && (
            <div className="mt-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 px-5 py-4 text-sm text-emerald-100 shadow">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 mb-1">
                ÖN KONTROL SONUCU
              </div>
              <div className="font-semibold">
                Check edildi · Sorun beklenmez.
              </div>
              <p className="mt-1 text-[13px] text-emerald-100/90">
                Bu isimle eşleşen herhangi bir ön kontrol uyarısı
                bulunmadı. Misafirle ilgili yeni bir değerlendirme
                yapılması gerekiyorsa aşağıdan ilgili alanı kullanabilirsiniz.
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                {canCreateRequest && (
                  <button
                    type="button"
                    onClick={() => (window.location.href = "/panel/talep-olustur")}
                    className="inline-flex items-center rounded-full border border-sky-400/60 bg-sky-500/10 px-3 py-1 font-medium text-sky-200 hover:bg-sky-500/20 transition-colors"
                  >
                    Bu misafir için ön kontrol talebi oluştur
                  </button>
                )}
                {canCreateDirect && (
                  <button
                    type="button"
                    onClick={() => (window.location.href = "/panel/kayit-ekle")}
                    className="inline-flex items-center rounded-full border border-slate-500 bg-slate-800/80 px-3 py-1 font-medium text-slate-100 hover:bg-slate-700 transition-colors"
                  >
                    Bu misafir için ön kontrol kaydı ekle
                  </button>
                )}
              </div>
            </div>
          )}

          {result && result !== "none" && !loading && !error && (
            <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/80 px-5 py-5 shadow-lg space-y-3 text-sm text-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 mb-1">
                    ÖN KONTROL BİLGİSİ BULUNDU
                  </div>
                  <div className="text-base font-semibold">
                    {result.full_name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {result.hotel_name} • {result.department}
                  </div>
                </div>
                <div>{renderLevelBadge(result.risk_level)}</div>
              </div>

              <p className="text-[13px] text-slate-200 leading-relaxed">
                {result.summary}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                <span>
                  İlk kayıt tarihi:{" "}
                  {new Date(result.created_at).toLocaleDateString("tr-TR")}
                </span>
                <span>
                  Not: Bu bilgi yalnızca operasyonu desteklemek için özet görüş
                  niteliğindedir; son karar her zaman otel yönetimine aittir.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
