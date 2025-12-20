// app/panel/kayit-ekle/page.tsx
"use client";

import { useState, useEffect } from "react";
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

export default function KayitEklePage() {
  const [fullName, setFullName] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<PanelUser | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !note.trim()) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const { error } = await supabase.from("risk_records").insert({
        full_name: fullName.trim(),
        summary: note.trim(),
        hotel_name: user?.hotelName ?? "Opsstay Hotel",
        department: user?.department ?? "Genel",
        risk_level: "dikkat", // şimdilik sabit; sonra formdan seçtirebiliriz
      });

      if (error) throw error;

      setSaved(true);
      setFullName("");
      setNote("");
    } catch (err: any) {
      console.error(err);
      setError("Kayıt eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-full px-6 py-6 md:px-10 md:py-8">
      <div className="max-w-3xl mx-auto">
        {/* Başlık */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
            Misafir için ön kontrol kaydı ekle
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Daha önce yaşanan bir durumu operasyon ekibiyle paylaşmak için,
            misafirin ad soyadını ve olaya dair kısa bir değerlendirme notunu
            girin. Sistem bu bilgiyi yalnızca ön kontrol sürecinde özet görüş
            olarak kullanır.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 md:p-6 shadow-lg space-y-5"
        >
          {/* Ad Soyad */}
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-[0.18em]"
            >
              Misafir adı soyadı
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
              placeholder="Örn: Ali Yılmaz"
            />
          </div>

          {/* Değerlendirme / Not */}
          <div className="space-y-2">
            <label
              htmlFor="note"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-[0.18em]"
            >
              Olay / değerlendirme notu
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70 resize-none"
              placeholder="Ne yaşandı, hangi departmanda oldu, ekip nasıl aksiyon aldı? Kısa ama operasyon için yeterli bir özet yazın."
            />
          </div>

          {/* Buton + durum */}
          <div className="pt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={saving || !fullName.trim() || !note.trim()}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-600 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Kayıt ekleniyor..." : "Kaydı ekle"}
            </button>

            {saved && (
              <p className="text-[11px] text-emerald-300">
                Kayıt başarıyla alındı. Sorgu ekranında bu misafir için ön
                kontrol notu olarak görünecek.
              </p>
            )}
            {error && (
              <p className="text-[11px] text-red-300">
                {error}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
