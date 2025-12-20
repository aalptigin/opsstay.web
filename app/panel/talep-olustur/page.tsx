// app/panel/talep-olustur/page.tsx
"use client";

export default function TalepOlusturPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-50">
          Operasyon talebi oluştur
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Misafirle ilgili daha detaylı inceleme, ek kontrol veya yönetim
          bilgilendirmesi gerektiğinde buradan talep açabilirsiniz. İlgili
          departman, talebi panel üzerinden takip eder.
        </p>
      </div>

      <form className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-200">
              Misafir / kayıt referansı
            </label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
              placeholder="Örn: RES-2025-001 veya Ad Soyad"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-200">
              Talep tipi
            </label>
            <select className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70">
              <option>Ek değerlendirme isteği</option>
              <option>Yönetim bilgilendirmesi</option>
              <option>Departman içi not paylaşımı</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-200">
            Talep detayı
          </label>
          <textarea
            rows={5}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
            placeholder="Durumu, ekipten ne beklediğinizi ve olası zamanlamayı burada açıklayabilirsiniz."
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-500 max-w-sm">
            Talep oluşturulduğunda ilgili ekip bilgilendirilecek ve süreç
            panel üzerinden izlenebilecektir. Gerçek sistemde bu alan, görev
            yönetimi ve bildirim altyapısına bağlanacaktır.
          </p>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md hover:bg-sky-600 hover:shadow-lg transition-all"
          >
            Talebi kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
