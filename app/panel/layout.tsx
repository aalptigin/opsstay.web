// app/panel/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PanelPermission = "admin" | "editor" | "viewer";

type PanelUser = {
  hotelName: string;
  fullName: string;
  userId: string;
  roleLabel: string;
  department: string;
  permission: PanelPermission;
};

const ALL_NAV_ITEMS = [
  { key: "sorgu", label: "Sorgu ekranı", href: "/panel/sorgu" },
  { key: "kayit-ekle", label: "Kayıt ekle", href: "/panel/kayit-ekle" },
  { key: "kayit-sil", label: "Kayıt sil", href: "/panel/kayit-sil" },
  { key: "talep-olustur", label: "Talep oluştur", href: "/panel/talep-olustur" },
  { key: "talepler", label: "Talepler", href: "/panel/talepler" }, // ✅ yeni
];

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<PanelUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const isLoginPage = pathname === "/panel/login";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("opsstay_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    } else if (!isLoginPage) {
      router.replace("/panel/login");
    }

    setLoaded(true);
  }, [router, isLoginPage]);

  const isReception =
    !!user &&
    (
      user.roleLabel?.toLocaleLowerCase("tr-TR").includes("resepsiyon") ||
      user.department?.toLocaleLowerCase("tr-TR").includes("resepsiyon")
    );

  const isAdmin =
    !!user &&
    (
      user.permission === "admin" ||
      user.roleLabel?.toLocaleLowerCase("tr-TR").includes("yönetici") ||
      user.roleLabel?.toLocaleLowerCase("tr-TR").includes("admin")
    );

  const visibleNavItems = isReception
    ? ALL_NAV_ITEMS.filter((item) =>
        ["sorgu", "talep-olustur"].includes(item.key)
      )
    : isAdmin
    ? ALL_NAV_ITEMS.filter((item) =>
        ["sorgu", "kayit-ekle", "kayit-sil", "talepler"].includes(item.key)
      )
    : ALL_NAV_ITEMS;

  // URL korumaları
  useEffect(() => {
    if (!loaded || isLoginPage) return;

    if (isReception) {
      if (
        pathname.startsWith("/panel/kayit-ekle") ||
        pathname.startsWith("/panel/kayit-sil") ||
        pathname.startsWith("/panel/talepler")
      ) {
        router.replace("/panel/sorgu");
      }
    }

    if (isAdmin) {
      if (pathname.startsWith("/panel/talep-olustur")) {
        router.replace("/panel/sorgu");
      }
    }
  }, [loaded, isLoginPage, isReception, isAdmin, pathname, router]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-400">Panel yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50 flex">
      {!isLoginPage && (
        <aside className="hidden md:flex w-56 flex-col border-r border-slate-800 bg-slate-950/95">
          <div className="px-5 pt-4 pb-4 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-2xl bg-sky-500 flex items-center justify-center text-xs font-bold text-slate-950">
                o
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400">
                  opsstay panel
                </div>
                <div className="text-[10px] text-slate-500">
                  Misafir ön kontrol alanı
                </div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
            {visibleNavItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cx(
                    "flex items-center rounded-xl px-3 py-2.5 transition-colors",
                    active
                      ? "bg-sky-500/15 text-sky-100 border border-sky-500/60"
                      : "text-slate-300 hover:bg-slate-900/70 hover:text-slate-50 border border-transparent"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-2">
            {user && (
              <div className="space-y-1">
                <div className="font-semibold text-slate-200">
                  {user.fullName}
                </div>
                <div className="text-slate-400">{user.roleLabel}</div>
                <div className="text-slate-500 text-[10px]">
                  {user.hotelName}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.removeItem("opsstay_user");
                  router.replace("/");
                }
              }}
              className="mt-2 inline-flex items-center rounded-full border border-slate-600 px-3 py-1 text-[10px] text-slate-300 hover:bg-slate-800/80"
            >
              Çıkış yap
            </button>

            <p className="mt-2 text-[10px] text-slate-600">
              Bu panel, yalnızca yetkili kullanıcılar tarafından misafir ön
              kontrol süreçlerini yönetmek için kullanılır.
            </p>
          </div>
        </aside>
      )}

      <main className="flex-1 min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
        {children}
      </main>
    </div>
  );
}
