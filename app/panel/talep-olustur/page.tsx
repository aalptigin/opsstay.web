import { supabase } from "@/lib/supabaseClient";
import { normTR } from "@/lib/normTR";

function readableSupabaseError(e: any) {
  return e?.message || e?.error_description || e?.details || JSON.stringify(e);
}

export async function submitRequest({
  fullName,
  riskLevel,
  summary,
  me,
  setErr,
  setOk,
}: {
  fullName: string;
  riskLevel: "bilgi" | "dikkat" | "kritik";
  summary: string;
  me: any; // staff_profiles row (hotel_id burada olmalı!)
  setErr: (s: string | null) => void;
  setOk: (s: string | null) => void;
}) {
  setErr(null);
  setOk(null);

  // 1) Oturum var mı?
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) {
    setErr("Auth hatası: " + readableSupabaseError(authErr));
    return;
  }
  const user = authData?.user;
  if (!user) {
    setErr("Oturum yok. Çıkış yapıp tekrar giriş yapın.");
    return;
  }

  // 2) Profilde hotel_id var mı? (ÇOK ÖNEMLİ)
  if (!me?.hotel_id) {
    setErr("Profilde hotel_id yok. Supabase’de staff_profiles kaydını kontrol et.");
    return;
  }

  // 3) Form kontrol
  const name = (fullName || "").trim();
  if (!name) {
    setErr("Ad soyad boş olamaz.");
    return;
  }

  // 4) DB’ye gidecek payload (risk_requests tablosuna uygun)
  const payload = {
    hotel_id: me.hotel_id, // ✅ EKLENDİ (RLS için şart)
    full_name: name,
    full_name_norm: normTR(name),
    risk_level: riskLevel,
    summary: (summary || "").trim() || "Ön kontrol notu girilmedi.",
    hotel_name: me?.hotel_name ?? null,
    department: me?.department ?? null,
    created_by: user.id,
    created_by_name: me?.full_name ?? user.email ?? null,
    created_by_role: me?.role ?? null,
    status: "pending",
  };

  // 5) Insert
  const { error } = await supabase.from("risk_requests").insert(payload);

  if (error) {
    console.error("RISK_REQUEST_INSERT_ERROR:", error);
    setErr("Talep oluşturma hatası: " + readableSupabaseError(error));
    return;
  }

  setOk("Talep oluşturuldu ✅");
}
