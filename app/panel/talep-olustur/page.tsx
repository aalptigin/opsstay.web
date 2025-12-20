"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { normTR } from "@/lib/normTR";

type StaffProfile = {
  full_name?: string | null;
  role?: string | null;
  department?: string | null;
  hotel_name?: string | null;
};

const HELP: Record<"bilgi" | "dikkat" | "kritik", string> = {
  bilgi:
    "Bilgi: Operasyonu bilgilendirmek için. Düşük seviye izleme notları ve yönlendirmeler.",
  dikkat:
    "Dikkat: Tekrar eden uygunsuz davranış, uyum/ödeme riski gibi durumlar için ek teyit önerilir.",
  kritik:
    "Kritik: Güvenlik/operasyon açısından ciddi risk. Yönetim onayı olmadan karar verilmemelidir.",
};

export default function TalepOlusturPage() {
  const [me, setMe] = useState<StaffProfile | null>(null);

  const [name, setName] = useState("");
  const [riskLevel, setRiskLevel] = useState<"bilgi" | "dikkat" | "kritik">(
    "bilgi"
  );
  const [summary, setSummary] = useState("");

  const [infoOpen, setInfoOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const helpText = useMemo(() => HELP[riskLevel], [riskLevel]);

  // Profil bilgisi (hotel/department/role/name) - eğer staff_profiles tablon user_id ile bağlıysa
  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) return;

        // Eğer sende staff_profiles user_id yoksa, burada email ile eşleştirmen gerekir:
        // .eq("email", user.email)
        const { data: prof } = await supabase
          .from("staff_profiles")
          .select("full_name, role, department, hotel_name")
          .eq("user_id", user.id)
          .maybeSingle();

        setMe((prof as any) || null);
      } catch {
        // sessiz geç
      }
    })();
  }, []);

  async function submit() {
    setErr(null);
    setOk(null);

    try {
      // 1) Oturum doğrula (UUID için user.id lazım)
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) throw new Error("Oturum bulunamadı. Tekrar giriş yapın.");

      // 2) Input doğrula
      const fullName = name.trim();
      if (!fullName) throw new Error("Ad soyad boş olamaz.");

      const safeSummary =
        (summary || "").trim() || "Ön kontrol notu girilmedi.";

      // 3) Sağlam payload (UUID alanına string atma hatasını engeller)
      const payload = {
        full_name: fullName,
        full_name_norm: normTR(fullName),
        risk_level: riskLevel, // "bilgi" | "dikkat" | "kritik"
        summary: safeSummary,
        hotel_name: me?.hotel_name || null,
        department: me?.department || null,

        // ✅ UUID beklenen alan
        created_by: user.id,

        // ✅ text alanlar (uuid değil)
        created_by_name: me?.full_name || null,
        created_by_role: me?.role || null,

        status: "pending",
      };

      setLoading(true);

      // 4) Insert
      const { error } = await supabase.from("risk_requests").insert(payload);

      if (error) {
        // Supabase hatasını aynen göster (kolon yok, RLS, vs.)
        throw new Error(error.message);
      }

      // 5) UI reset
      setName("");
      setRiskLevel("bilgi");
      setSummary("");
      setOk("Talebiniz iletildi. Yönetici incelemesinden sonra kayıt oluşturulabilir.");
    } catch (e: any) {
      setErr(e?.message || "Talep gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-sky-950/50 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Talep oluştur</h1>
          <p className="mt-2 text-sm text-slate-300">
            Departmanlardan gelen ön kontrol talepleri buradan yönetime iletilir.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/35 backdrop-blur p-6 space-y-5">
          {/* Ad Soyad */}
          <div>
            <div className="text-xs font-semibold tracking-widest text-slate-400">
              AD SOYAD
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Ali Yılmaz"
              className="mt-2 w-full rounded-xl border border-slate-700/50 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* Seviye */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold tracking-widest text-slate-400">
                SEVİYE
              </div>
              <button
                type="button"
                onClick={() => setInfoOpen((v) => !v)}
                className="text-xs rounded-full border border-slate-700/60 bg-slate-950/30 hover:bg-slate-900/40 px-3 py-1 transition"
              >
                Bilgi
              </button>
            </div>

            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as any)}
              className="mt-2 w-full rounded-xl border border-slate-700/50 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="bilgi">Bilgi</option>
              <option value="dikkat">Dikkat</option>
              <option value="kritik">Kritik</option>
            </select>

            {infoOpen ? (
              <div className="mt-3 rounded-xl border border-slate-700/40 bg-slate-950/30 p-3">
                <div className="text-xs font-semibold tracking-widest text-slate-400 mb-1">
                  AÇIKLAMA
                </div>
                <div className="text-sm text-slate-200">{helpText}</div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-400">{helpText}</div>
            )}
          </div>

          {/* Not */}
          <div>
            <div className="text-xs font-semibold tracking-widest text-slate-400">
              AÇIKLAMA / NOT
            </div>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Kısa ve net bir özet yazın..."
              rows={5}
              className="mt-2 w-full rounded-xl border border-slate-700/50 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full rounded-full bg-sky-500/95 hover:bg-sky-400 transition py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading ? "Gönderiliyor..." : "Talebi gönder"}
          </button>

          {ok && (
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {ok}
            </div>
          )}
          {err && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {err}
            </div>
          )}

          <div className="text-[11px] text-slate-400">
            Not: Bu talep yalnızca operasyonu desteklemek için iletilir; nihai karar otel yönetimine aittir.
          </div>
        </div>
      </div>
    </div>
  );
}
