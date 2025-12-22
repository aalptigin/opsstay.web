"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMyProfile, type StaffProfile } from "@/lib/authProfile";

type NavItem = { label: string; href: string };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyProfile();
        setProfile(p);
      } catch (e: any) {
        const msg = e?.message ?? "AUTH_OR_PROFILE_ERROR";
        setErr(msg);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
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

  // login’e yönlendirdik ama yine de debug için gösterelim
  if (err) {
    return (
      <div className="p-6 text-slate-200">
        <div className="font-semibold">Erişim Hatası</div>
        <div className="text-sm opacity-80 mt-2">
          {err === "PROFILE_MISSING"
            ? "Kullanıcı yetkilendirilmemiş (staff_profiles kaydı yok)."
            : err}
        </div>
      </div>
    );
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
