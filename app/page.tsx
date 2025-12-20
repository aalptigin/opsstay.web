// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const stories = [
  {
    role: "Resepsiyon / Ön Büro",
    badge: "Ön büro ekibi",
    title: "Kişisel veri yok, tam kontrol sizde.",
    summary:
      "Opsstay, misafir otele gelmeden önce geçmişini anonim ve kurumsal bir dille özetler. Ön büro ekibi, check-in anında ne ile karşılaşacağını bilir.",
    details: [
      "Rezervasyon açıldığı anda misafir ön kontrol süreci otomatik tetiklenir.",
      "Ekip, karmaşık veriler yerine sade bir değerlendirme görür.",
      "Misafir masaya geldiğinde operasyon hazır ve sakin olur.",
    ],
    quote:
      "“Misafir gelmeden önce net bir özet görmek, resepsiyon ekibinin tonunu tamamen değiştiriyor.”",
    image: "/opsstay/resepsiyon.jpg",
  },
  {
    role: "Güvenlik / Gece Operasyonu",
    badge: "Güvenlik ekibi",
    title: "Gece vardiyasında sürpriz değil, öngörü var.",
    summary:
      "Gece ekibi için misafir geçmişi önceden özetlenir, olağan dışı durumlar kurumsal bir ifadeyle belirtilir. Ekibiniz refleksle değil, bilgiyle hareket eder.",
    details: [
      "Olası riskli durumlar, kişisel veri paylaşmadan işaretlenir.",
      "Güvenlik ve resepsiyon aynı dilde, aynı ekrandan konuşur.",
      "Gece vardiyalarında ani ve stresli kararlar azalır.",
    ],
    quote:
      "“Opsstay ile gece vardiyası daha sakin; kimi, neden nasıl karşılayacağımızı biliyoruz.”",
    image: "/opsstay/guvenlik.jpg",
  },
  {
    role: "F&B / Servis Ekibi",
    badge: "Restoran & bar",
    title: "Masaya oturmadan önce misafir beklentisini bilirsiniz.",
    summary:
      "Opsstay, misafirin geçmiş tercihlerini ve hassasiyetlerini özetleyerek F&B tarafına hazırlık alanı açar. Deneyim, ilk temasla birlikte başlar.",
    details: [
      "Alerji, tercih edilen saatler, alışkanlıklar önceden görünür.",
      "Servis ekibi misafire “ilk kez görüyormuş” gibi değil, tanıyor gibi yaklaşır.",
      "Bu da otelin genel marka algısını yukarı taşır.",
    ],
    quote:
      "“Misafir daha sipariş vermeden neyi sevdiğini bilmek servisin kalitesini ciddi etkiliyor.”",
    image: "/opsstay/fb.jpg",
  },
  {
    role: "Yönetim / Revenue",
    badge: "Genel müdür & gelir",
    title: "Oda numarasından değil, ilişki değerinden bakarsınız.",
    summary:
      "Opsstay, misafirleri tek tek olaylar yerine bütün yolculuklarıyla gösterir. Böylece stratejik kararlar daha net ve veri destekli alınır.",
    details: [
      "Operasyonel riskler ile değerli misafir segmentleri ayrışır.",
      "Farklı departmanların notları ortak ve standart bir dile oturtulur.",
      "Yönetim, misafir portföyüne büyük resimden bakabilir.",
    ],
    quote:
      "“Opsstay, misafirlerimizi sadece ‘oda’ değil, ‘ilişki’ olarak görmemizi sağladı.”",
    image: "/opsstay/yonetim.jpg",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 80 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const flag = window.localStorage.getItem("opsstay_logged_in");
      setIsLoggedIn(flag === "1");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-slate-50">
      {/* Sol üst sabit panel butonu – sadece giriş yaptıysa */}
      {isLoggedIn && (
        <div className="fixed left-4 top-20 z-40 hidden md:flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className="h-10 w-10 rounded-full bg-slate-950/90 border border-sky-700/70 flex flex-col items-center justify-center hover:bg-slate-900 hover:border-sky-400 transition-all shadow-lg"
          >
            <span className="h-0.5 w-3 rounded-full bg-sky-300" />
            <span className="h-0.5 w-3 rounded-full bg-sky-300" />
            <span className="h-0.5 w-3 rounded-full bg-sky-300" />
          </button>

          {panelOpen && (
            <div className="mt-2 w-64 rounded-2xl bg-slate-950/95 border border-sky-700/70 shadow-2xl p-4 text-xs text-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400">
                    Opsstay
                  </div>
                  <div className="text-sm font-semibold">Check Paneli</div>
                </div>
                <span className="text-[10px] text-slate-400">
                  Yetkili giriş
                </span>
              </div>

              <div className="space-y-1.5">
                {[
                  { label: "Sorgu ekranı", href: "/panel/sorgu" },
                  { label: "Kayıt ekle", href: "/panel/kayit-ekle" },
                  { label: "Kayıt sil", href: "/panel/kayit-sil" },
                  { label: "Talep oluştur", href: "/panel/talep-olustur" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="w-full block rounded-lg bg-slate-900/80 hover:bg-sky-900/70 border border-sky-800/70 px-3 py-2 text-[11px] text-slate-100 flex items-center justify-between gap-2 transition-all"
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[9px] text-sky-300 uppercase tracking-wide">
                      Panel
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Üst bar */}
      <header className="border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
              O
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-50">
                opsstay
              </span>
              <span className="text-[11px] text-slate-400">
                Misafir Ön Kontrol &amp; Güvenli Konaklama
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-5 text-xs sm:text-sm">
            <button type="button" className="text-slate-200 hover:text-white">
              Çözümler
            </button>
            <button type="button" className="text-slate-200 hover:text-white">
              Hakkımızda
            </button>
            <button type="button" className="text-slate-200 hover:text-white">
              Neler yapabiliriz
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/login";
              }}
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-sky-400 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 shadow-md hover:shadow-lg hover:brightness-110 transition-all"
            >
              Giriş Yap
            </button>
          </nav>
        </div>
      </header>

      {/* Ana içerik – aşağısı senin mevcut tasarımın (değişmeden kaldı) */}
      <main className="px-0 sm:px-0 py-0">
        <div className="min-h-[calc(100vh-4rem)] w-full bg-gradient-to-b from-slate-50 via-sky-50/70 to-slate-50 text-slate-900">
          {/* HERO – büyük arka plan görsel + metin */}
          <section className="relative h-[65vh] min-h-[420px]">
            <Image
              src="/opsstay/hero-dashboard.jpg"
              alt="Opsstay kontrol paneli"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/45" />

            <div className="relative h-full flex items-center">
              <div className="px-6 sm:px-10 max-w-4xl space-y-4">
                <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] text-sky-200 uppercase">
                  KVKK uyumlu ön kontrol
                </p>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight">
                  Kişisel veri yok,{" "}
                  <br className="hidden sm:block" />
                  tam kontrol sizde.
                  <br />
                  Otel karar verir, sistem bilgilendirir.
                </h1>
                <p className="text-sm sm:text-base text-slate-100/90 max-w-xl">
                  Opsstay, misafir geçmişini anonim ve kurumsal bir dile
                  çevirerek, yalnızca operasyon için gerekli özet bilgiyi
                  sunar. Risk uyarısı gelir, son kararı her zaman otel yönetimi
                  verir.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-sky-700 hover:shadow-lg transition-all"
                  >
                    Opsstay&apos;i keşfedin
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-sky-100 bg-white/95 px-4 py-2 text-sm font-medium text-sky-700 hover:border-sky-300 hover:bg-sky-50 transition-all"
                  >
                    Çözüm detaylarını inceleyin
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Orta bölüm – kurumsal başlık + görseller */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.4 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="px-6 sm:px-10 pt-14 pb-16 bg-gradient-to-b from-sky-50/80 via-slate-50 to-slate-100"
          >
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-4 sm:gap-8 mb-10">
                {/* Sol küçük görsel */}
                <div className="relative h-40 sm:h-56 rounded-3xl overflow-hidden shadow-md">
                  <Image
                    src="/opsstay/lobi.jpg"
                    alt="Otel lobisi"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Orta büyük görsel */}
                <div className="relative h-52 sm:h-72 md:h-80 rounded-3xl overflow-hidden shadow-lg">
                  <Image
                    src="/opsstay/toplanti.jpg"
                    alt="Otel yönetim toplantısı"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Sağ küçük görsel */}
                <div className="relative h-32 sm:h-48 rounded-3xl overflow-hidden shadow-md">
                  <Image
                    src="/opsstay/analytics.jpg"
                    alt="Analitik ekran"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="text-center max-w-3xl mx-auto">
                <p className="text-[11px] tracking-[0.25em] uppercase text-sky-600 font-semibold mb-2">
                  Tek bakışta ön kontrol çerçevesi
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 mb-3">
                  Her misafir için aynı standart,{" "}
                  <span className="text-sky-600">
                    her karar için aynı güven.
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600">
                  Opsstay, kişisel veri paylaşmadan, misafir yolculuğuna dair
                  kritik bilgileri tek ekranda toplar. Operasyon ekibi farklı
                  sistemlere dağılmış notların peşinden koşmaz; net bir çerçeve
                  üzerinden, tutarlı ve güvenli karar alır.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Hakkımızda */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.35 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            id="hakkimizda"
            className="px-6 sm:px-10 py-12 border-t border-slate-200 bg-white/95"
          >
            <div className="max-w-6xl mx-auto">
              <div className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 border border-sky-100 mb-4">
                Opsstay hakkında
              </div>
              <div className="grid md:grid-cols-2 gap-10 items-start">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                    Opsstay, misafir yolculuğuna{" "}
                    <span className="text-sky-600">ön kontrol katmanı</span>{" "}
                    ekler.
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                    Günümüz konaklama işletmelerinde misafir bilgisi; farklı
                    sistemlere dağılmış, tutarsız ve çoğu zaman operasyon
                    ekibinin elinde yeterince hazırlanmamış halde. Opsstay, bu
                    dağınık yapıyı tek bir kurumsal görüşe çevirir.
                  </p>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                    Amacımız, resepsiyon, güvenlik, F&amp;B ve yönetim
                    ekiplerine misafir daha otele gelmeden önce{" "}
                    <span className="font-medium">
                      “Bu misafir bizim için ne ifade ediyor?”
                    </span>{" "}
                    sorusunun cevabını, sade ve anlaşılır bir dille sunmak.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Neleri önemsiyoruz?
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li>• KVKK uyumu ve kişisel verinin gizliliği</li>
                      <li>• Departmanlar arası ortak ve sade bir dil</li>
                      <li>
                        • Operasyon ekibine gerçek anlamda zaman kazandırmak
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Nasıl sonuçlar hedefliyoruz?
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li>
                        • Misafir ön kontrolünde %80’e varan zaman tasarrufu
                      </li>
                      <li>• Daha öngörülebilir check-in süreçleri</li>
                      <li>
                        • “Check edildi, sorun beklenmez” diyebildiğiniz bir
                        misafir portföyü
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Senaryolar */}
          <section
            id="senaryolar"
            className="px-6 sm:px-10 py-14 space-y-10 bg-gradient-to-b from-[#f5f8ff] via-[#f8fafc] to-[#f5f7fb] border-t border-slate-200"
          >
            <div className="max-w-6xl mx-auto space-y-3">
              <div className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 border border-sky-100">
                Opsstay sahada nasıl görünür?
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                Ekranda sadece bir panel değil,{" "}
                <span className="text-sky-600">
                  tüm ekibinize net bir çerçeve
                </span>{" "}
                sunar.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
                Aşağı kaydırdıkça; resepsiyon, güvenlik, F&amp;B ve yönetim
                ekiplerinin Opsstay ile nasıl çalıştığını göreceksiniz. Her
                senaryo, scroll ettikçe yavaşça yukarı çıkan kartlarla
                anlatılır ve her kaydırmada bu akış yeniden canlanır.
              </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-14">
              {stories.map((story, index) => (
                <motion.article
                  key={story.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ amount: 0.4 }}
                  transition={{
                    duration: 0.7,
                    ease: "easeOut",
                    delay: index * 0.08,
                  }}
                  className={`grid gap-8 items-center ${
                    index % 2 === 0
                      ? "md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)]"
                      : "md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)] md:flex-row-reverse"
                  }`}
                >
                  {/* Görsel */}
                  <div className="relative h-56 sm:h-72 rounded-3xl overflow-hidden shadow-xl">
                    <Image
                      src={story.image}
                      alt={story.role}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/25 mix-blend-multiply" />
                    <div className="absolute inset-5 flex flex-col justify-between text-white">
                      <div className="space-y-2">
                        <span className="inline-flex rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium backdrop-blur-sm border border-white/25">
                          {story.badge}
                        </span>
                        <h3 className="text-lg font-semibold leading-snug drop-shadow">
                          {story.role}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-[13px] text-sky-50/95 max-w-xs leading-relaxed">
                        Bu görselleri otelinizden gerçek karelerle
                        güncelleyerek, Opsstay&apos;in sahadaki kullanımını
                        misafir yolculuğu üzerinden gösterebilirsiniz.
                      </p>
                    </div>
                  </div>

                  {/* Metin */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                      {story.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {story.summary}
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                      {story.details.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2"
                        >
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs sm:text-sm text-slate-500 italic border-l-2 border-sky-200 pl-3">
                      {story.quote}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          {/* Footer */}
          <section className="border-t border-slate-200 pt-8 pb-6 px-6 sm:px-10 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/95">
            <span>
              © {new Date().getFullYear()} Opsstay. Tüm hakları saklıdır.
            </span>
            <span>
              Hiçbir misafir doğrudan etiketlenmez; Opsstay yalnızca{" "}
              <span className="font-medium">
                operasyon ekiplerine destekleyici görüş
              </span>{" "}
              sunar.
            </span>
          </section>
        </div>
      </main>
    </div>
  );
}
