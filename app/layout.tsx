// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Opsstay | Misafir Ön Kontrol ve Güvenli Konaklama",
  description:
    "Opsstay, otel ve konaklama işletmelerine misafir ön kontrol ve risk değerlendirme çözümleri sunar. Check edildi, sorun beklenmez.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
