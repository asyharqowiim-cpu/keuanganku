import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileSpreadsheet,
  PieChart,
  Target,
  BarChart3,
  TrendingUp,
  LogIn,
  UserPlus,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  Lock,
  Cloud,
  BellRing,
  Wallet,
  CalendarCheck,
  HeartHandshake,
  Award,
  Layers,
} from 'lucide-react';
import { User } from 'firebase/auth';

type LandingSubPage = 'beranda' | 'fitur' | 'manfaat' | 'tentang';

const HERO_MOCKUP_SRC =
  '/assets/aistudio/Mockup_Aplikasi_Keuangan_Biru_808f830d.png';

interface LandingPageProps {
  currentUser: User | null;
  darkMode: boolean;
  onToggleDarkMode: (dark: boolean) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onEnterDashboard: () => void;
  logoIconUrl?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  darkMode,
  onToggleDarkMode,
  onOpenLogin,
  onOpenRegister,
  onEnterDashboard,
  logoIconUrl,
}) => {
  const [activePage, setActivePage] = useState<LandingSubPage>('beranda');
  const [transparentMockupSrc, setTransparentMockupSrc] = useState<string | null>(
    null
  );

  // Remove only the outer white background of the uploaded 3D mockup via border flood-fill
  // so the white smartphone screen and white ceramic vase remain 100% solid white.
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) return;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const isOuterBgPixel = (idx4: number): boolean => {
          const r = data[idx4];
          const g = data[idx4 + 1];
          const b = data[idx4 + 2];
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          return r >= 238 && g >= 238 && b >= 238 && maxC - minC <= 14;
        };

        const enqueueIfBg = (x: number, y: number) => {
          const p = y * w + x;
          if (visited[p]) return;
          if (isOuterBgPixel(p * 4)) {
            visited[p] = 1;
            queue[tail++] = p;
          }
        };

        for (let x = 0; x < w; x++) {
          enqueueIfBg(x, 0);
          enqueueIfBg(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          enqueueIfBg(0, y);
          enqueueIfBg(w - 1, y);
        }

        while (head < tail) {
          const p = queue[head++];
          const idx4 = p * 4;
          data[idx4 + 3] = 0;

          const x = p % w;
          const y = (p - x) / w;

          if (x > 0) enqueueIfBg(x - 1, y);
          if (x + 1 < w) enqueueIfBg(x + 1, y);
          if (y > 0) enqueueIfBg(x, y - 1);
          if (y + 1 < h) enqueueIfBg(x, y + 1);
        }

        ctx.putImageData(imgData, 0, 0);
        if (active) {
          setTransparentMockupSrc(canvas.toDataURL('image/png'));
        }
      } catch {
        // Fallback to raw image
      }
    };
    img.src = HERO_MOCKUP_SRC;
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/70 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors">
      {/* TOP NAVIGATION BAR (Login & Register ONLY here in Header) */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-blue-100/80 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-3.5 sm:px-6 lg:px-10 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo (Clicks back to Beranda) */}
          <button
            type="button"
            onClick={() => setActivePage('beranda')}
            className="inline-flex items-center gap-2 sm:gap-2.5 group shrink-0 cursor-pointer text-left"
          >
            {logoIconUrl ? (
              <img
                src={logoIconUrl}
                alt=""
                aria-hidden="true"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-blue-900 dark:text-white">
              keuangan<span className="text-blue-600 dark:text-sky-400">ku</span>
            </span>
          </button>

          {/* Center Multi-Page Navigation Tabs (Not Scrolldown) */}
          <nav
            aria-label="Navigasi Halaman Utama"
            className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-semibold"
          >
            {(
              [
                ['beranda', 'Beranda'],
                ['fitur', 'Fitur'],
                ['manfaat', 'Manfaat'],
                ['tentang', 'Tentang'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActivePage(key)}
                className={`px-3.5 lg:px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  activePage === key
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-sky-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right Actions: Login & Register Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {currentUser ? (
              <button
                type="button"
                onClick={onEnterDashboard}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer"
              >
                <span>Buka Aplikasi</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/70 border border-blue-200 dark:border-blue-800 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden xs:inline sm:inline" />
                  <span>Register</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Full-Width 4-Column Page Switcher Bar */}
        <div className="grid grid-cols-4 md:hidden gap-1.5 px-3.5 pb-3">
          {(
            [
              ['beranda', 'Beranda'],
              ['fitur', 'Fitur'],
              ['manfaat', 'Manfaat'],
              ['tentang', 'Tentang'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActivePage(key)}
              className={`py-2 text-xs font-bold rounded-xl text-center transition-colors cursor-pointer ${
                activePage === key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT AREA: RENDERS ONLY THE SELECTED PAGE (NO SCROLLDOWN SECTIONS) */}
      <main className="flex-1 flex flex-col justify-center">
        {/* =========================================================
            HALAMAN 1: BERANDA (HOME)
           ========================================================= */}
        {activePage === 'beranda' && (
          <div className="py-8 lg:py-10 space-y-10">
            <section className="relative overflow-hidden">
              {/* Decorative Soft Blue Background Blob */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-4 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-100/80 via-sky-100/60 to-indigo-100/40 dark:from-blue-950/40 dark:via-sky-950/25 dark:to-transparent blur-2xl -z-10"
              />

              <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
                  {/* LEFT COLUMN: Headline, Subtitle, Mulai Sekarang & Pelajari Lebih Lanjut */}
                  <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left">
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.14] text-slate-900 dark:text-white">
                      Kelola keuanganmu
                      <br />
                      dengan mudah,
                      <br />
                      <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        wujudkan masa depanmu.
                      </span>
                    </h1>

                    <p className="text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                      Catat pemasukan, kelola pengeluaran, buat anggaran, dan capai
                      tujuan keuanganmu bersama{' '}
                      <span className="font-bold text-blue-600 dark:text-sky-400">
                        Keuanganku.
                      </span>
                    </p>

                    {/* Clean Reference CTA Buttons (Full-width on mobile, inline on tablet/desktop) */}
                    <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-3.5">
                      <button
                        type="button"
                        onClick={onEnterDashboard}
                        className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all cursor-pointer text-center"
                      >
                        Mulai Sekarang
                      </button>

                      <button
                        type="button"
                        onClick={() => setActivePage('fitur')}
                        className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold text-blue-700 dark:text-sky-300 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 border-2 border-blue-600 dark:border-sky-500 transition-all cursor-pointer text-center"
                      >
                        Pelajari Lebih Lanjut
                      </button>
                    </div>

                    {/* Trust Badge */}
                    <div className="pt-1 flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                      <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-sky-400 shrink-0" />
                      <span>Data aman dan privasi terjaga</span>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Uploaded Blue Smartphone, Vase, and Wallet Illustration */}
                  <div className="lg:col-span-6 relative flex items-center justify-center">
                    <div
                      aria-hidden="true"
                      className="w-[260px] h-[260px] sm:w-[380px] sm:h-[380px] lg:w-[430px] lg:h-[430px] rounded-full bg-blue-100/75 dark:bg-blue-950/50 absolute -z-10"
                    />

                    <img
                      src={transparentMockupSrc || HERO_MOCKUP_SRC}
                      alt="Ilustrasi Aplikasi Keuanganku — Smartphone, Vas Bunga, dan Dompet Biru"
                      className={`w-full max-w-[340px] sm:max-w-[460px] lg:max-w-[540px] h-auto object-contain select-none drop-shadow-2xl ${
                        !transparentMockupSrc && !darkMode ? 'mix-blend-multiply' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 4-CARD SUMMARY STRIP ON BERANDA (Matches Reference Image) */}
            <section className="px-4 sm:px-6 lg:px-10">
              <div className="max-w-7xl xl:max-w-[1400px] mx-auto rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-blue-100/90 dark:border-slate-800 shadow-xl shadow-blue-950/5 p-6 sm:p-8 lg:p-10 space-y-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-center text-slate-900 dark:text-white">
                  Semua yang kamu butuhkan untuk keuangan yang lebih baik
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        Catat Transaksi
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Catat setiap pemasukan dan pengeluaran dengan mudah.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <PieChart className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        Kelola Anggaran
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Buat anggaran bulanan dan kontrol pengeluaran lebih terencana.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        Capai Tujuan
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Tentukan tujuan keuangan dan pantau progresnya setiap saat.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        Laporan Keuangan
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Lihat ringkasan dan laporan keuanganmu dalam grafik yang mudah dipahami.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            HALAMAN 2: FITUR (DEDICATED PAGE VIEW)
           ========================================================= */}
        {activePage === 'fitur' && (
          <section className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300">
                Fitur Lengkap Keuanganku
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Semua Fitur untuk Mengatur Arus Kas & Masa Depanmu
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Dirancang khusus agar pencatatan keuangan harian, tabungan, dan anggaran bulanan terasa ringan serta terstruktur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-6 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pencatatan Transaksi Cepat
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Catat pemasukan dan pengeluaran harian lengkap dengan kategori, rekening/dompet, serta ekspor laporan ke format CSV kapan saja.
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-6 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                  <PieChart className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Batas Anggaran Bulanan
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tetapkan plafon anggaran untuk setiap kategori pengeluaran dan pantau sisa batas aman harian agar tidak boros.
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-6 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pos Tabungan & Dana Darurat
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Buat target tabungan masa depan, pantau persentase capaian, dan tambahkan setoran rutin bulanan dengan satu klik.
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-6 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Financial Planning Terjadwal
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Rencanakan kebutuhan besar di bulan-bulan mendatang, atur skala prioritas, dan realisasikan langsung menjadi transaksi saat siap.
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-6 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Grafik & Visualisasi Interaktif
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Analisis perbandingan pemasukan dan pengeluaran serta komposisi biaya bulanan melalui grafik visual yang bersih dan jelas.
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-6 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                  <BellRing className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pengingat Anggaran Otomatis
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Terima peringatan instan ketika pengeluaran suatu kategori mendekati atau melampaui ambang batas yang telah Anda tentukan.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            HALAMAN 3: MANFAAT (DEDICATED PAGE VIEW)
           ========================================================= */}
        {activePage === 'manfaat' && (
          <section className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300">
                Manfaat Utama
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Mengapa Mengelola Keuangan Bersama Keuanganku?
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Bukan sekadar buku kas digital, Keuanganku membantu membangun kebiasaan finansial yang sehat dan terukur setiap bulan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-6 flex items-start gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Kendali Penuh atas Pengeluaran Bulanan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ketahui dengan pasti ke mana perginya uang Anda setiap minggu dan cegah pengeluaran impulsif sebelum menggerus tabungan.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-6 flex items-start gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Cloud className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Sinkronisasi Cloud Lintas Perangkat
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Terhubung dengan akun Google atau GitHub sehingga seluruh catatan transaksi, tabungan, dan anggaran tersimpan aman di Cloud.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-6 flex items-start gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Privasi Nominal & Keamanan Terjaga
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Dilengkapi fitur kunci privasi untuk menyamarkan angka saldo dan nominal transaksi saat Anda membuka aplikasi di ruang publik.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-6 flex items-start gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tujuan Finansial Lebih Cepat Tercapai
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Dengan memisahkan pos dana darurat, tabungan impian, dan rencana belanja bulanan, target masa depan Anda menjadi jauh lebih terukur.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            HALAMAN 4: TENTANG (DEDICATED PAGE VIEW)
           ========================================================= */}
        {activePage === 'tentang' && (
          <section className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300">
                Tentang Kami
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Tentang Keuanganku
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Platform manajemen keuangan pribadi modern dengan filosofi{" "}
                <strong className="text-blue-600 dark:text-sky-400">
                  &ldquo;Kelola Keuangan, Gapai Masa Depan&rdquo;
                </strong>.
              </p>
            </div>

            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>Keuanganku</strong> hadir untuk membantu setiap individu dan keluarga di Indonesia mengelola arus kas bulanan secara sederhana, transparan, dan aman. Kami percaya bahwa ketenangan finansial berawal dari pencatatan yang rapi serta perencanaan anggaran yang disiplin.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-slate-800/70 border border-blue-100 dark:border-slate-700 space-y-2">
                  <HeartHandshake className="w-6 h-6 text-blue-600 dark:text-sky-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Mudah Digunakan
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Antarmuka bersih dengan dukungan mode Terang dan Gelap yang nyaman digunakan setiap hari.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-slate-800/70 border border-blue-100 dark:border-slate-700 space-y-2">
                  <Award className="w-6 h-6 text-blue-600 dark:text-sky-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Privasi Utama
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Data keuangan adalah milik Anda sepenuhnya, dilengkapi proteksi privasi dan isolasi akun pengguna.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-slate-800/70 border border-blue-100 dark:border-slate-700 space-y-2">
                  <Layers className="w-6 h-6 text-blue-600 dark:text-sky-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Terintegrasi Penuh
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Mulai dari transaksi harian, anggaran kategori, pos tabungan, hingga rencana keuangan dalam satu tempat.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* BOTTOM CALLOUT FOOTER BANNER (No Login/Register buttons here as requested) */}
      <footer className="bg-blue-50/80 dark:bg-slate-900 border-t border-blue-100 dark:border-slate-800 py-6 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-1">
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
            <span className="font-bold text-blue-600 dark:text-sky-400">
              Keuanganku
            </span>{' '}
            siap membantumu hidup lebih tenang secara finansial.
          </p>
          <p className="text-base sm:text-lg font-extrabold text-blue-700 dark:text-sky-400">
            Yuk, mulai perjalanan keuanganmu sekarang!
          </p>
        </div>
      </footer>
    </div>
  );
};
