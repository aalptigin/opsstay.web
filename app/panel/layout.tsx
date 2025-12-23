"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type StaffProfile = {
  full_name?: string | null;
  role?: string | null;
  department?: string | null;
  hotel_name?: string | null;

  // ✅ asıl yetki buradan:
  permission?: "admin" | "editor" | "viewer" | string | null;
};

type NavItem = { label: string; href: string };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [me, setMe] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // ✅ cookie var mı? middleware zaten /panel/* için kontrol ediyor
        // ama bu çağrı PanelLayout’un “yükleniyor -> login” loop’unu kırmak için:
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        if (!r.ok) throw new Error("NO_SESSION");

        // ✅ login sonrası localStorage’a yazdığımız profili oku
        try {
          const raw = localStorage.getItem("opsstay_profile");
          if (raw) setMe(JSON.parse(raw));
        } catch {}
      } catch {
        router.replace(`/login?next=${encodeURIComponent(pathname || "/panel/sorgu")}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, pathname]);

  // ✅ role değil permission kullan
  const perm = (me as any)?.permission || "viewer";
  const isAdmin = String(perm).toLowerCase() === "admin";

  const navItems: NavItem[] = useMemo(() => {
    // Resepsiyon/editor/viewer menüsü:
    const base: NavItem[] = [
      { label: "Sorgu ekranı", href: "/panel/sorgu" },
      { label: "Talep oluştur", href: "/panel/talep-olustur" },
    ];

    // ✅ Müdür (admin) menüsü:
    // İSTEDİĞİN: müdürde “talep oluştur” OLMASIN
    if (isAdmin) {
      return [
        { label: "Sorgu ekranı", href: "/panel/sorgu" },
        { label: "Kayıt ekle", href: "/panel/kayit-ekle" },
        { label: "Kayıt sil", href: "/panel/kayit-sil" },
        { label: "Talepler", href: "/panel/talepler" },
      ];
    }

    return base;
  }, [isAdmin]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("opsstay_profile");
    router.replace("/login");
  }

  if (loading) return <div className="p-6 text-slate-200">Yükleniyor...</div>;

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <aside className="w-64 border-r border-slate-800 p-4">
        <div className="text-sm font-semibold mb-4">OPSSTAY PANEL</div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-2 text-sm ${
                  active ? "bg-slate-900 border border-slate-700" : "hover:bg-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 text-xs text-slate-400">
          {me?.full_name ?? "Yetkili Kullanıcı"} — {String(perm).toLowerCase()}
        </div>

        <button
          onClick={logout}
          className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900 px-3 py-2 text-sm"
        >
          Çıkış yap
        </button>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
