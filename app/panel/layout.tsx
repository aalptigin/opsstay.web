"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getMyProfile, StaffProfile } from "@/lib/authProfile";

type NavItem = { label: string; href: string };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }

      const p = await getMyProfile();
      setProfile(p);
      setLoading(false);
    })();
  }, [router]);

  const navItems: NavItem[] = useMemo(() => {
    const role = (profile?.role || "").toLowerCase();

    const base: NavItem[] = [{ label: "Sorgu ekranı", href: "/panel/sorgu" }];

    // staff (resepsiyon/güvenlik vb): sadece sorgu + talep
    if (role === "staff" || role === "resepsiyon") {
      return [...base, { label: "Talep oluştur", href: "/panel/talep-olustur" }];
    }

    // manager/admin: sorgu + ekle + sil + talepler
    return [
      ...base,
      { label: "Kayıt ekle", href: "/panel/kayit-ekle" },
      { label: "Kayıt sil", href: "/panel/kayit-sil" },
      { label: "Talepler", href: "/panel/talepler" },
    ];
  }, [profile]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Left sidebar */}
      <aside className="w-[260px] border-r border-slate-800/70 bg-slate-950/60 backdrop-blur">
        <div className="p-4 border-b border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-600/90 flex items-center justify-center font-bold">
              O
            </div>
            <div>
              <div className="text-sm tracking-widest font-semibold">OPSSTAY PANEL</div>
              <div className="text-[11px] text-slate-300">Misafir ön kontrol alanı</div>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-2">
          {navItems.map((it) => {
            const active = pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={[
                  "block rounded-xl px-3 py-2 text-sm border transition",
                  active
                    ? "bg-sky-900/40 border-sky-600/40 text-slate-100"
                    : "bg-slate-900/20 border-slate-800/60 text-slate-200 hover:bg-slate-900/35 hover:border-slate-700/70",
                ].join(" ")}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-slate-800/70 space-y-2">
          <div className="text-[11px] text-slate-300">
            <div className="font-semibold text-slate-100">
              {profile?.full_name || "Yetkili Kullanıcı"}
            </div>
            <div>{profile?.role || "rol"}{profile?.department ? ` • ${profile.department}` : ""}</div>
            <div className="text-slate-400">{profile?.hotel_name || ""}</div>
          </div>

          <button
            onClick={logout}
            className="w-full rounded-xl border border-slate-700/70 bg-slate-900/30 hover:bg-slate-900/50 px-3 py-2 text-sm"
          >
            Çıkış yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
