// app/panel/kayit-sil/page.tsx
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

export default function KayitSilPage() {
  const [user, setUser] = useState<PanelUser | null>(null);
  const [records, setRecords] = useState<RiskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const canDelete =
    user?.permission === "admin" || user?.permission === "editor";

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

  async function fetchRecords() {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("risk_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setRecords((data || []) as RiskRecord[]);
    } catch (err: any) {
      console.error(err);
      setError(
        "Kayıtlar alınırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  async function handleDelete(id: string) {
    if (!canDelete) return;

    const hedef = records.find((r) => r.id === id);
    if (!hedef) return;

    const confirmed = window.confirm(
      `"${hedef.full_name}" için oluşturulmuş bu ön kontrol kaydını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz. Kayıt, sadece silinen kayıtlar arşivinde tutulacaktır.`
    );
    if (!confirmed) return;

    setDeleteId(id);
    setError(null);

    try {
      // 1) Önce LOG tablosuna ekleyelim
      const { error: logError } = await supabase
        .from("risk_records_deleted")
        .insert({
          original_id: hedef.id,
          full_name: hedef.full_name,
          hotel_name: hedef.hotel_name,
          department: hedef.department,
          risk_level: hedef.risk_level,
          summary: hedef.summary,
          deleted_by_user_id: user?.userId ?? null,
          deleted_by_name: user?.fullName ?? null,
          deleted_by_department: user?.department ?? null,
        });

      if (logError) throw logError;

      // 2) Sonra asıl kaydı sil
      const { error: deleteError } = await supabase
        .from("risk_records")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // 3) Ekrandan kaydı düş
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(
        "Kayıt silinirken bir hata oluştu. Kayıt arşiv durumunu kontrol etmek için yöneticinizle görüşün."
      );
    } finally {
      setDeleteId(null);
    }
  }

  const filtered = records.filter((record) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      record.full_name.toLowerCase().includes(s) ||
      record.hotel_name.toLowerCase().includes(s) ||
      record.department.toLowerCase().includes(s)
    );
  });

  function renderLevelTag(level: RiskLevel) {
    if (level === "bilgi") {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-400/50 text-[10px] px-2 py-0.5 text-emerald-200">
          Bilgi
        </span>
      );
    }
    if (level === "dikkat") {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-400/50 text-[10px] px-2 py-0.5 text-amber-200">
          Dikkat
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-red-500/10 border border-red-400/50 text-[10px] px-2 py-0.5 text-red-200">
        Kritik
      </span>
    );
  }

  return (
    <div className="min-h-full px-6 py-6 md:px-10 md:py-8">
      <div className="max-w-5xl mx-auto">
        {/* Başlık */}
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
              Ön kontrol kayıtlarını yönet
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Bu alanda sadece gerekli olduğunda kayıtları silebilirsiniz. Silme
              işleminden sonra ilgili misafir için ön kontrol notu sorgu
              ekranında görünmez. Tüm silme işlemleri arşivde saklanır.
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              setRefreshing(true);
              await fetchRecords();
              setRefreshing(false);
            }}
            className="inline-flex items-center rounded-full border border-slate-600 px-3 py-1.5 text-[11px] text-slate-200 hover:bg-slate-800/80"
          >
            {refreshing ? "Yenileniyor..." : "Kayıtları yenile"}
          </button>
        </div>

        {/* Araç çubuğu */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-[11px] text-slate-400">
            Toplam kayıt:{" "}
            <span className="text-slate-200 font-semibold">
              {records.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
              placeholder="İsim, otel veya departmana göre filtrele"
            />
          </div>
        </div>

        {/* Hata / yükleniyor */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-[12px] text-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 text-sm text-slate-400">Kayıtlar yükleniyor…</div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 text-sm text-slate-400">
            Görüntülenecek ön kontrol kaydı bulunamadı.
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            {filtered.map((record) => (
              <div
                key={record.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 md:px-5 md:py-4 shadow-sm flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-50 truncate max-w-xs md:max-w-sm">
                      {record.full_name}
                    </span>
                    {renderLevelTag(record.risk_level)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400 flex flex-wrap gap-2">
                    <span>{record.hotel_name}</span>
                    <span className="text-slate-600">•</span>
                    <span>{record.department}</span>
                    <span className="text-slate-600">•</span>
                    <span>
                      {new Date(record.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-slate-300 line-clamp-2">
                    {record.summary}
                  </p>
                </div>

                <div className="mt-2 md:mt-0 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={!canDelete}
                    onClick={() => handleDelete(record.id)}
                    className="inline-flex items-center rounded-full border border-red-500/60 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-100 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteId === record.id
                      ? "Siliniyor..."
                      : canDelete
                      ? "Kaydı sil"
                      : "Silme yetkiniz yok"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Not */}
        <p className="mt-6 text-[11px] text-slate-500 max-w-3xl">
          Not: Silinen kayıtlar, operasyon bütünlüğünü korumak için ayrı bir
          arşiv tablosunda saklanır. Gerekli olduğunda yönetim ekibi tarafından
          denetim amaçlı görüntülenebilir.
        </p>
      </div>
    </div>
  );
}
