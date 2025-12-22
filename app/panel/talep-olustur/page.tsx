function readableError(e: any) {
  return e?.message || e?.error || JSON.stringify(e);
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
  me: any; // demo profile object
  setErr: (s: string | null) => void;
  setOk: (s: string | null) => void;
}) {
  setErr(null);
  setOk(null);

  const name = (fullName || "").trim();
  if (!name) {
    setErr("Ad soyad boş olamaz.");
    return;
  }

  try {
    const r = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_request",
        full_name: name,
        risk_level: riskLevel,
        summary: (summary || "").trim() || "Ön kontrol notu girilmedi.",
        created_by_name: me?.full_name || "—",
        created_by_role: me?.role || "—",
        created_by_department: me?.department || "—",
        created_by_hotel: me?.hotel_name || "—",
      }),
    });

    const data = await r.json();
    if (!data?.ok) throw new Error(data?.error || "Talep oluşturma hatası");

    setOk("Talep oluşturuldu ✅");
  } catch (e: any) {
    setErr("Talep oluşturma hatası: " + readableError(e));
  }
}
export default function Page() {
  return <div />;
}
