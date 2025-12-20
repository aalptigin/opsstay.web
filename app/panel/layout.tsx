// app/panel/layout.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type PanelPermission = "admin" | "editor" | "viewer";

type PanelUser = {
  hotelName: string;
  fullName: string;
  userId: string;
  roleLabel: string;
  department: string;
  permission: PanelPermission;
};

const defaultUser: PanelUser = {
  hotelName: "Opsstay Hotel",
  fullName: "Yetkili Kullanıcı",
  userId: "OPS-00000",
  roleLabel: "Operasyon",
  department: "Genel",
  permission: "viewer",
};

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<PanelUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("opsstay_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(defaultUser);
      }
    } else {
      setUser(defaultUser);
    }
  }, []);

  const isActive = (href: string) => pathname === href;

  const permissionLabel =
    user?.permission === "admin"
      ? "Yönetici"
      : user?.permission === "editor"
      ? "Düzenleyici"
      : "Görüntüleyici";

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("opsstay_logged_in");
      window.localStorage.removeItem("opsstay_user");
    }
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex">
      {/* SOL SİDEBAR */}
      <aside className="w-56 md:w-64 border-r border-slate-800 bg-slate-950/90 flex flex-col">
        {/* Kullanıcı + otel bilgisi */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
              O
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-slate-50 truncate">
                {user?.hotelName ?? "Opsstay panel"}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {user?.fullName ?? "Yetkili kullanıcı"}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/70 border border-slate-700/80 px-3 py-2.5 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">ID</span>
              <span className="font-mono text-[10px] text-slate-100">
                {user?.userId ?? "OPS-00000"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Departman</span>
              <span className="font-medium text-slate-100">
                {user?.department ?? "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Görev</span>
              <span className="font-medium text-sky-400">
                {user?.roleLabel ?? "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Yetki</span>
              <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/40">
                {permissionLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Menü */}
        <nav className="flex-1 px-4 py-4 text-sm space-y-1">
          {[
            { label: "Sorgu ekranı", href: "/panel/sorgu" },
            { label: "Kayıt ekle", href: "/panel/kayit-ekle" },
            { label: "Kayıt sil", href: "/panel/kayit-sil" },
            { label: "Talep oluştur", href: "/panel/talep-olustur" },
          ].map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  active
                    ? "bg-sky-600 text-white shadow"
                    : "text-slate-200 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer bilgi */}
        <div className="px-4 pb-4 pt-2 border-t border-slate-800 text-[11px] text-slate-500 space-y-2">
          <p className="leading-snug">
            Bu panel, yalnızca yetkili kullanıcılar tarafından misafir ön
            kontrol süreçlerini yönetmek için kullanılır.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sky-400 hover:text-sky-300"
          >
            Ana sayfaya dön
          </button>
        </div>
      </aside>

      {/* SAĞ TARAF: HEADER + CONTENT */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between px-6 text-xs">
          <div className="text-slate-400">
            <span className="text-slate-500">Panel</span>
            <span className="mx-1">/</span>
            <span className="text-slate-200">Misafir ön kontrol alanı</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            {user && (
              <span className="hidden sm:inline text-slate-400">
                Oturum:{" "}
                <span className="text-slate-100 font-medium">
                  {user.fullName}
                </span>{" "}
                • {user.hotelName}
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-600 px-3 py-1 text-[11px] hover:border-red-400 hover:text-red-300 transition-colors"
            >
              Çıkış yap
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
