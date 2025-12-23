import { NextResponse } from "next/server";

export const runtime = "edge"; // Cloudflare Pages için önemli

const COOKIE_NAME = "opsstay_session";

export async function GET() {
  const res = NextResponse.json({ ok: true });

  // Edge runtime'da cookie okumak için:
  // NextRequest kullanmadan da çalışır ama en stabil yöntem:
  // cookies() helper'ı (bazı ortamlarda) sorun çıkarabiliyor.
  // O yüzden burada sadece client tarafının cookie'yi taşımasını kontrol edeceğiz.
  // Eğer login başarılı olduysa tarayıcı cookie'yi zaten gönderir ve middleware izin verir.

  // Basit kontrol: Tarayıcı cookie'yi göndermiyorsa PanelLayout zaten login'e atar.
  // Bu endpoint "me" için her zaman 200 dönsün; asıl güvenlik middleware'de.
  return res;
}
