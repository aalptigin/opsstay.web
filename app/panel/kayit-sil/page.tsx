// app/panel/kayit-sil/page.tsx
"use client";

export default function KayitSilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-50">
          Kayıt pasif et / sil
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Yanlış açılmış, güncelliğini yitirmiş veya sadece referans için
          tutulmuş kayıtları buradan pasif duruma alabilirsiniz. Operasyonel
          iz kaydı korunur, aktif sorgu sonuçlarından çıkarılır.
        </p>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="grid md:grid-cols-[2fr,1fr] gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-200">
              Kayıt arama
            </label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
              placeholder="Misafir adı, rezervasyon numarası veya iç referans kodu"
            />
          </div>
          <button
            type="button"
            className="w-full md:w-auto inline-flex items-center justify-center rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-100 shadow-md hover:bg-slate-700 hover:shadow-lg transition-all"
          >
            Kayıtları getir
          </button>
        </div>

        <div className="mt-4 border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Örnek sonuç listesi (ileride Supabase’den gelecek)</span>
            <span className="text-[10px] text-slate-500">
              Bu alan şu an taslak amaçlıdır.
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Misafir</th>
                  <th className="px-3 py-2 font-medium">Referans</th>
                  <th className="px-3 py-2 font-medium">Durum</th>
                  <th className="px-3 py-2 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800/70">
                  <td className="px-3 py-2">Örnek Misafir</td>
                  <td className="px-3 py-2 text-slate-400">RES-2025-001</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300 border border-emerald-500/30">
                      Aktif
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-100 hover:bg-slate-700 border border-slate-700">
                      Pasif et
                    </button>
                  </td>
                </tr>
                <tr className="border-t border-slate-800/70">
                  <td className="px-3 py-2">Diğer Misafir</td>
                  <td className="px-3 py-2 text-slate-400">RES-2025-002</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded-full bg-slate-700/40 px-2 py-0.5 text-[11px] text-slate-200 border border-slate-600">
                      Pasif
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300 border border-slate-700 cursor-default">
                      Kayıt tutuluyor
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-500">
            Gerçek sistemde, kayıt pasif edildiğinde sadece aktif sonuç
            ekranlarından düşer; geçmişe dönük süreç takibi için iz kaydı
            korunur.
          </p>
        </div>
      </div>
    </div>
  );
}
