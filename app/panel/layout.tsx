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
];

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<PanelUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Şu an login sayfasında mıyız?
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
    } else {
      // Kullanıcı yoksa ve login sayfasında değilsek login'e at
      if (!isLoginPage) {
        router.replace("/panel/login");
      }
    }

    setLoaded(true);
  }, [router, isLoginPage]);

  const isReception =
    user?.department &&
    user.department.toLocaleLowerCase("tr-TR").includes("resepsiyon");

  // Resepsiyon ise sadece Sorgu + Talep
  const visibleNavItems = isReception
    ? ALL_NAV_ITEMS.filter((item) =>
        ["sorgu", "talep-olustur"].includes(item.key)
      )
    : ALL_NAV_ITEMS;

  // Resepsiyon kullanıcısı /kayit-ekle veya /kayit-sil'e gitmeye çalışırsa sorguya at
  useEffect(() => {
    if (!loaded || !isReception || isLoginPage) return;

    if (
      pathname.startsWith("/panel/kayit-ekle") ||
      pathname.startsWith("/panel/kayit-sil")
    ) {
      router.replace("/panel/sorgu");
    }
  }, [loaded, isReception, pathname, router, isLoginPage]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-400">Panel yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50 flex">
      {/* Sol menü – login sayfasında gizli */}
      {!isLoginPage && (
        <aside className="hidden md:flex w-56 flex-col border-r border-slate-800 bg-slate-950/95">
          {/* Logo + başlık */}
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

          {/* Menü */}
          <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
            {visibleNavItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={classNames(
                    "flex items-center rounded-xl px-3 py-2.5 transition-colors",
                    active
                      ? "bg-sky-500/15 text-sky-100 border border-sky-500/60"
                      : "text-slate-300 hover:bg-slate-900/70 hover:text-slate-50 border border-transparent"
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Kullanıcı bilgisi + alt metin + Çıkış */}
          <div className="px-4 py-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-2">
            {user && (
              <div className="space-y-1">
                <div className="font-semibold text-slate-200">
                  {user.fullName}
                </div>
                <div className="text-slate-400">
                  {user.department} • {user.roleLabel}
                </div>
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
                  // Çıkıştan sonra ANASAYFAYA yönlendiriyoruz
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

      {/* Sağ taraf (içerik) */}
      <main className="flex-1 min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
        {children}
      </main>
    </div>
  );
}
