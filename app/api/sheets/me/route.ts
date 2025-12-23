import { NextResponse } from "next/server";

const COOKIE_NAME = "opsstay_session";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const hasSession = cookie.includes(`${COOKIE_NAME}=1`);

  if (!hasSession) {
    return NextResponse.json({ ok: false, error: "NO_SESSION" }, { status: 401 });
  }

  // Kullanıcı bilgisi istersen localStorage'dan değil,
  // login'de Apps Script'ten gelen profile'ı cookie'ye yazacak şekilde büyütürüz.
  // Şimdilik sabit dönelim (senin ekran zaten manager gösteriyor).
  return NextResponse.json({
    ok: true,
    profile: {
      full_name: "Operasyon Müdürü",
      role: "manager",
      department: "Operasyon",
      hotel_name: "Opsstay Hotel Taksim",
    },
  });
}
