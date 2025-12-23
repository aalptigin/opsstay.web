"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type StaffProfile = {
  full_name?: string | null;
  role?: string | null;
  department?: string | null;
  hotel_name?: string | null;
};

type NavItem = { label: string; href: string };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Artık Supabase yok: kullanıcı bilgisi login'den sonra localStorage'a yazılıyor.
    // login page -> localStorage: "opsstay_user"
    try {
      const raw = localStorage.getItem("opsstay_user");
      if (!raw) {
        router.replace("/login");
        return;
      }
      const p = JSON.parse(raw) as any;

      // senin login modelin PanelUser -> StaffProfile'a uyarlıyoruz
      const mapped: StaffProfile = {
        full_name: p?.fullName ?? p?.full_name ?? "Yetkili Kullanıcı",
        role: p?.permission === "admin" ? "manager" : (p?.role ?? "staff"),
        department: p?.department ?? null,
        hotel_name: p?.hotelName ?? p?.hotel_name ?? null,
      };

      setProfile(mapped);
    } catch {
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const navItems: NavItem[] = useMemo(() => {
    const role = (profile?.role || "").toLowerCase();

    const base: NavItem[] = [
      { label: "Sorgu ekranı", href: "/panel/sorgu" },
      { label: "Talep oluştur", href: "/panel/talep-olustur" },
    ];

    // Müdür menüsü
    if (role === "manager") {
      return [
        ...base,
        { label: "Kayıt ekle", href: "/panel/kayit-ekle" },
        { label: "Kayıt sil", href: "/panel/kayit-sil" },
        { label: "Talepler", href: "/panel/talepler" },
      ];
    }

    return base;
  }, [profile]);

  if (loading) {
    return <div className="p-6 text-slate-200">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen flex">
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
          {profile?.full_name ?? "Yetkili Kullanıcı"} — {profile?.role}
        </div>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
