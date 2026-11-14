import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Share2,
  Package,
  WifiOff,
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

interface MobileAppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-5 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg">
      <WifiOff className="w-3.5 h-3.5 shrink-0 animate-pulse" />
      <span>Mode Offline — Catatan tersimpan di HP & otomatis sinkron saat online</span>
    </div>
  );
};

export const PWAInstallButton: React.FC<{
  onOpenGuideModal: () => void;
}> = ({ onOpenGuideModal }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (isInstalled) {
    return (
      <button
        type="button"
        onClick={onOpenGuideModal}
        className="px-3 py-2 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/95 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        title="Status Aplikasi Mobile Terinstal"
      >
        <Smartphone className="w-4 h-4" />
        <span className="hidden sm:inline">App Mobile Aktif</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        if (isInstallable) {
          const accepted = await install();
          if (!accepted) onOpenGuideModal();
        } else {
          onOpenGuideModal();
        }
      }}
      className="px-3.5 py-2 text-xs sm:text-sm font-bold text-blue-700 dark:text-sky-300 bg-blue-50/95 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 rounded-xl shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
      title="Instal Keuanganku sebagai Aplikasi Mobile di HP Android / iOS"
    >
      <Smartphone className="w-4 h-4 text-blue-600 dark:text-sky-400" />
      <span>Instal App HP</span>
    </button>
  );
};

export const MobileAppInstallModal: React.FC<MobileAppInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'apk' | 'pwa' | 'ios'>(
    isIOS ? 'ios' : 'apk'
  );
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const appPublicUrl = window.location.origin;

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(appPublicUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadIcon = () => {
    const link = document.createElement('a');
    link.href = '/pwa-512x512.png';
    link.download = 'keuanganku-icon-512x512.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Jadikan Aplikasi Mobile (APK / Android / iOS)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Solusi lengkap instal langsung di HP atau buat file .APK tanpa gagal di PWABuilder
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="p-4 rounded-2xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs sm:text-sm font-extrabold text-blue-950 dark:text-sky-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>
                {isInstalled
                  ? 'Aplikasi Sudah Terinstal di Perangkat Ini!'
                  : 'Manifest.json & Service Worker Statis Sudah Aktif'}
              </span>
            </div>
            <p className="text-xs text-blue-800/80 dark:text-sky-300/80">
              Pilih salah satu dari 3 metode di bawah untuk menginstal di HP atau membuat file APK.
            </p>
          </div>
          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={install}
              className="px-4 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Instal Sekarang (1-Klik)</span>
            </button>
          )}
        </div>

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Solusi Buat .APK
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pwa')}
            className={`py-2 px-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Instal Tanpa APK
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`py-2 px-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            iPhone / iOS
          </button>
        </div>

        {activeTab === 'apk' && (
          <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            {/* Explanation why PWABuilder fails on AI Studio preview URLs */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-1.5">
              <div className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Kenapa Link Preview AI Studio Ditolak PWABuilder?</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                Link preview AI Studio (<code>ais-dev-...</code> / <code>ais-pre-...</code>) memiliki layar proteksi cookie Google sehingga bot eksternal seperti <strong>PWABuilder</strong> diblokir saat mencoba memindai URL secara langsung.
              </p>
            </div>

            {/* Solution 1: WebIntoApp (Works with any URL + Icon) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Cara 1: Buat File .APK via WebIntoApp.com (100% Berhasil)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Berbeda dengan PWABuilder, <strong>WebIntoApp.com</strong> tidak memblokir URL aplikasi dan langsung menghasilkan file <code>.apk</code> Android siap instal:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs leading-relaxed">
                <li>Salin URL aplikasi dan unduh ikon 512x512 melalui tombol di bawah.</li>
                <li>Buka situs <strong>webintoapp.com/store/maker</strong> di browser.</li>
                <li>Masukkan Nama: <strong>Keuanganku</strong>, tempel URL, dan unggah ikon 512x512.</li>
                <li>Klik <strong>Next &rarr; Make App (Free)</strong> lalu unduh file <code>.apk</code> Android Anda.</li>
              </ol>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>URL Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                      <span>Salin URL Aplikasi</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadIcon}
                  className="px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Ikon App (512x512 PNG)</span>
                </button>
              </div>
            </div>

            {/* Solution 2: How to use PWABuilder after deploying to Cloud Run / Vercel / Firebase */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                Cara 2: Agar Bisa Dipindai PWABuilder (Deploy ke Cloud Run / Vercel)
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                File <code>/manifest.json</code> dan <code>/sw.js</code> statis kini sudah ditambahkan ke aplikasi ini lengkap dengan <code>screenshots</code>. Jika Anda men-deploy aplikasi ini ke <strong>Google Cloud Run</strong> (tombol Deploy di AI Studio), <strong>Vercel</strong>, atau <strong>Firebase Hosting</strong>, URL publik hasil deploy tersebut bisa langsung dimasukkan ke <strong>PWABuilder.com</strong> tanpa error.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'pwa' && (
          <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cara Instal Langsung di HP Android (Tanpa PWABuilder)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Anda sebenarnya <strong>tidak perlu membuat file APK di PWABuilder</strong> untuk menjadikannya aplikasi di HP Android Anda:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm leading-relaxed">
                <li>
                  Buka link aplikasi ini langsung di browser <strong>Google Chrome</strong> pada HP Android Anda.
                </li>
                <li>
                  Ketuk ikon <strong>Titik Tiga (⋮)</strong> di pojok kanan atas browser Chrome.
                </li>
                <li>
                  Pilih menu <strong>&quot;Tambahkan ke Layar Utama&quot; (Add to Home Screen)</strong> atau <strong>&quot;Instal aplikasi&quot;</strong>.
                </li>
                <li>
                  Aplikasi <strong>Keuanganku</strong> langsung terinstal di layar HP Anda dan berjalan layar penuh tanpa bar browser.
                </li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'ios' && (
          <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Cara Instal di iPhone / iPad (Safari)</span>
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm leading-relaxed">
                <li>
                  Buka aplikasi <strong>Keuanganku</strong> menggunakan browser <strong>Safari</strong> di iPhone/iPad.
                </li>
                <li>
                  Ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah Safari (ikon kotak dengan panah ke atas).
                </li>
                <li>
                  Gulir ke bawah dan pilih <strong>&quot;Tambah ke Layar Utama&quot; (Add to Home Screen)</strong>.
                </li>
                <li>
                  Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Aplikasi siap dibuka langsung dari Home Screen iPhone Anda.
                </li>
              </ol>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-blue-600 hover:opacity-90 rounded-xl cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
