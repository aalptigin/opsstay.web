"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);

  try {
    const r = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // ✅ çok önemli
  body: JSON.stringify({ email, password }),
});


    const data = await r.json();
    if (!data?.ok) throw new Error(data?.error || "Giriş başarısız");

    // Panel menüsü için profili saklayalım
    if (typeof window !== "undefined") {
      localStorage.setItem("opsstay_profile", JSON.stringify(data.user || {}));
    }

    router.push("/panel/sorgu");
  } catch (err: any) {
    alert(err?.message || "Giriş hatası");
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-[1.1fr,0.9fr] gap-10 bg-slate-950/70 border border-slate-800 rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.9)] overflow-hidden">

        <div className="px-8 sm:px-10 py-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                O
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-50">opsstay</div>
                <div className="text-xs text-slate-400">Misafir Ön Kontrol &amp; Güvenli Konaklama</div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-50">
              Check paneline giriş yapın
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-md">
              Bu alan sadece yetkilendirilmiş kullanıcılar içindir. Misafir ön kontrol sonuçları,
              operasyon notları ve yönetim raporlarına buradan erişebilirsiniz.
            </p>

            {errMsg ? (
              <div className="mt-6 rounded-2xl border border-rose-900/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
                {errMsg}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-medium text-slate-200">
                  Kurumsal e-posta
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
                  placeholder="ornek@oteliniz.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-medium text-slate-200">
                  Şifre
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-70"
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>
            </form>
          </div>

          <div className="mt-8 text-[11px] text-slate-500">
            Bu panele giriş yaparak, sadece görev tanımınız kapsamında misafir bilgilerine erişmeyi kabul etmiş olursunuz.
          </div>
        </div>

        <div className="relative hidden md:block bg-slate-900">
          <Image
            src="/opsstay/analytics.jpg"
            alt="Opsstay panel görünümü"
            fill
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/80 to-sky-900/60" />
          <div className="relative h-full flex flex-col justify-between p-8">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-sky-300 font-semibold mb-3">
                Operasyon ekibi için tasarlandı
              </p>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                Tek ekranda misafir ön kontrol süreci.
              </h2>
              <p className="text-xs text-slate-200/90 leading-relaxed">
                Opsstay, farklı kaynaklardan gelen misafir geçmişini standart bir dile çevirerek,
                resepsiyon, güvenlik ve yönetim ekiplerine net bir operasyon çerçevesi sunar.
                Karar her zaman otel yönetimindedir; sistem sadece destekleyici görüş üretir.
              </p>
            </div>

            <div className="space-y-2 text-[11px] text-slate-200/90">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Anlık ön kontrol sonuçları ve özet görüşler
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                KVKK prensiplerine uygun, sadeleştirilmiş bilgi akışı
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Departmanlar arası tutarlı dil ve kayıt yönetimi
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
