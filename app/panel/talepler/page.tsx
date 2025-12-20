"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type RequestStatus = "bekliyor" | "onaylandi" | "reddedildi";
type RiskLevel = "bilgi" | "dikkat" | "kritik";

type RiskRequest = {
  id: string;
  full_name: string;
  hotel_name: string;
  department: string;
  risk_level: RiskLevel;
  summary: string;

  created_by_user_id: string | null; // bazen uuid, bazen OPS-RSP-0127 gibi
  created_by_name: string | null;
  created_by_department: string | null;
  created_at: string;

  status: RequestStatus;
  review_note: string | null;
  reviewed_by_user_id: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
};

type PanelPermission = "admin" | "editor" | "viewer";
type PanelUser = {
  hotelName: string;
  fullName: string;
  userId: string; // local sisteminde uuid olmayabilir
  roleLabel: string;
  department: string;
  permission: PanelPermission;
};

function fmtDateTR(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("tr-TR", { hour12: false });
  } catch {
    return iso;
  }
}

// UUID kontrolü (Supabase auth user id gibi)
function isUuid(val: string | null | undefined) {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    val.trim()
  );
}

export default function TaleplerPage() {
  const [user, setUser] = useState<PanelUser | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus>("bekliyor");

  const [items, setItems] = useState<RiskRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
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

  async function fetchRequests() {
    setError(null);
    setLoading(true);

    const { data, error } = await supabase
      .from("risk_requests")
      .select("*")
      .eq("status", statusFilter)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError(`Liste alınamadı: ${error.message}`);
      setItems([]);
      setLoading(false);
      return;
    }

    setItems((data ?? []) as RiskRequest[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const canModerate = useMemo(() => user?.permission === "admin", [user]);

  async function rollbackToPending(reqId: string) {
    await supabase
      .from("risk_requests")
      .update({
        status: "bekliyor",
        reviewed_by_name: null,
        reviewed_by_user_id: null,
        reviewed_at: null,
      })
      .eq("id", reqId);
  }

  async function approveRequest(req: RiskRequest) {
    if (!canModerate) return;
    setError(null);
    setBusyId(req.id);

    const reviewedByName = user?.fullName ?? "Yetkili kullanıcı";
    const reviewedByUserId = isUuid(user?.userId) ? user!.userId : null;

    // 1) Talebi "onaylandi" yap
    const { error: upErr } = await supabase
      .from("risk_requests")
      .update({
        status: "onaylandi",
        reviewed_by_name: reviewedByName,
        reviewed_by_user_id: reviewedByUserId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", req.id);

    if (upErr) {
      console.error(upErr);
      setError(`Talep onaylanamadı: ${upErr.message}`);
      setBusyId(null);
      return;
    }

    // 2) Risk kaydına ekle
    const baseInsert = {
      full_name: req.full_name,
      note: req.summary,
      risk_level: req.risk_level,
      hotel_name: req.hotel_name,
      department: req.department,
      source: "talep",
      request_id: req.id,
    };

    // created_by_user_id sadece gerçekten UUID ise gönderilecek:
    const createdByUuid = isUuid(req.created_by_user_id) ? req.created_by_user_id : null;

    const richInsert: any = {
      ...baseInsert,
      created_by_name: req.created_by_name ?? null,
    };

    // uuid değilse hiç eklemiyoruz (hata sebebi buydu)
    if (createdByUuid) {
      richInsert.created_by_user_id = createdByUuid;
    }

    // A) önce rich dene
    const { error: insErr1 } = await supabase.from("risk_records").insert(richInsert);

    if (insErr1) {
      console.error(insErr1);

      // B) rich patlarsa basit dene
      const { error: insErr2 } = await supabase.from("risk_records").insert(baseInsert);

      if (insErr2) {
        console.error(insErr2);
        await rollbackToPending(req.id);
        setError(
          `Talep onaylandı ama kayıtlara eklenemedi: ${insErr2.message}`
        );
        setBusyId(null);
        return;
      }
    }

    // başarı
    setItems((prev) => prev.filter((x) => x.id !== req.id));
    setBusyId(null);
  }

  async function rejectRequest(req: RiskRequest) {
    if (!canModerate) return;
    setError(null);
    setBusyId(req.id);

    const reviewedByName = user?.fullName ?? "Yetkili kullanıcı";
    const reviewedByUserId = isUuid(user?.userId) ? user!.userId : null;

    const { error } = await supabase
      .from("risk_requests")
      .update({
        status: "reddedildi",
        reviewed_by_name: reviewedByName,
        reviewed_by_user_id: reviewedByUserId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", req.id);

    if (error) {
      console.error(error);
      setError(`Talep reddedilemedi: ${error.message}`);
      setBusyId(null);
      return;
    }

    setItems((prev) => prev.filter((x) => x.id !== req.id));
    setBusyId(null);
  }

  return (
    <div className="min-h-full px-6 py-6 md:px-10 md:py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
              Müdür talep paneli
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Departmanlardan gelen ön kontrol taleplerini buradan yönetebilirsiniz.
              Onaylanan talepler, misafir ön kontrol kayıtlarına eklenir.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RequestStatus)}
              className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-2 text-[12px] text-slate-100"
            >
              <option value="bekliyor">Bekleyen talepler</option>
              <option value="onaylandi">Onaylanan</option>
              <option value="reddedildi">Reddedilen</option>
            </select>

            <button
              onClick={fetchRequests}
              className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-2 text-[12px] text-slate-100 hover:bg-slate-900"
            >
              Yenile
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-[12px] text-red-100">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-6 text-slate-300">
              Yükleniyor...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-6 text-slate-400">
              Bu filtrede talep yok.
            </div>
          ) : (
            items.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-[14px] font-semibold text-slate-100">
                        {r.full_name}
                      </div>
                      <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-100">
                        {r.risk_level}
                      </span>
                      <span className="rounded-full border border-slate-600 bg-slate-800/40 px-2 py-0.5 text-[10px] text-slate-100">
                        {r.status}
                      </span>
                    </div>

                    <div className="mt-2 text-[12px] text-slate-200">{r.summary}</div>

                    <div className="mt-3 text-[11px] text-slate-400">
                      Talebi açan:{" "}
                      <span className="text-slate-200 font-medium">
                        {r.created_by_name ?? "Yetkili kullanıcı"}
                      </span>{" "}
                      ({r.created_by_department ?? r.department})
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    <div className="text-slate-300">
                      {r.hotel_name} • {r.department}
                    </div>
                    <div className="mt-1">{fmtDateTR(r.created_at)}</div>
                  </div>
                </div>

                {canModerate && statusFilter === "bekliyor" && (
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      disabled={busyId === r.id}
                      onClick={() => rejectRequest(r)}
                      className="rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-[12px] text-red-100 hover:bg-red-500/15 disabled:opacity-60"
                    >
                      Reddet
                    </button>
                    <button
                      disabled={busyId === r.id}
                      onClick={() => approveRequest(r)}
                      className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-[12px] text-emerald-100 hover:bg-emerald-500/15 disabled:opacity-60"
                    >
                      Onayla
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-[11px] text-slate-500">
          Not: Onaylanan talepler otomatik olarak misafir ön kontrol kayıtlarına eklenir.
        </div>
      </div>
    </div>
  );
}
