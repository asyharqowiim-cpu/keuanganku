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
  Copy,
  Check,
  FileCode2,
} from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

interface MobileAppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWABUILDER_READY_MANIFEST = JSON.stringify(
  {
    id: '/',
    name: 'Keuanganku — Manajemen Keuangan Pribadi',
    short_name: 'Keuanganku',
    description:
      'Aplikasi manajemen keuangan pribadi lengkap dengan pencatatan pemasukan, pengeluaran, tabungan, perencanaan anggaran, laporan PDF, dan sinkronisasi Cloud.',
    lang: 'id-ID',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'window-controls-overlay'],
    orientation: 'portrait',
    theme_color: '#2563eb',
    background_color: '#0f172a',
    categories: ['finance', 'productivity', 'utilities'],
    prefer_related_applications: false,
    related_applications: [],
    launch_handler: {
      client_mode: 'navigate-existing',
    },
    icons: [
      {
        src: 'https://placehold.co/192x192/0f172a/38bdf8.png?text=Keuanganku',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://placehold.co/512x512/0f172a/38bdf8.png?text=Keuanganku',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://placehold.co/512x512/0f172a/38bdf8.png?text=Keuanganku',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: 'https://placehold.co/540x960/0f172a/38bdf8.png?text=Keuanganku+Mobile',
        sizes: '540x960',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Tampilan Mobile Keuanganku',
      },
      {
        src: 'https://placehold.co/1280x720/0f172a/38bdf8.png?text=Keuanganku+Dashboard',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Dashboard Lengkap Keuanganku',
      },
    ],
  },
  null,
  2
);

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
  const [activeTab, setActiveTab] = useState<'pwabuilder' | 'pwa' | 'ios'>(
    isIOS ? 'ios' : 'pwabuilder'
  );
  const [copiedManifest, setCopiedManifest] = useState(false);

  if (!isOpen) return null;

  const handleCopyManifest = () => {
    navigator.clipboard?.writeText(PWABUILDER_READY_MANIFEST);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2500);
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
                Solusi PWABuilder & Instal Aplikasi Mobile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Atasi &quot;Manifest Timed Out&quot; di PWABuilder atau instal langsung di HP
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

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('pwabuilder')}
            className={`py-2 px-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'pwabuilder'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Solusi PWABuilder
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
            Instal Langsung HP
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

        {activeTab === 'pwabuilder' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="font-extrabold text-blue-950 dark:text-sky-200 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Cara Mengatasi &quot;Edit Your Manifest&quot; di PWABuilder:</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                <li>
                  Klik tombol <strong>&quot;Salin Kode JSON Manifest&quot;</strong> di bawah ini.
                </li>
                <li>
                  Di halaman <strong>PWABuilder</strong> yang sedang terbuka di HP Anda, ketuk tombol ungu <strong>&quot;Edit Your Manifest&quot;</strong> (di kanan atas).
                </li>
                <li>
                  Pilih tab <strong>Code</strong> (atau kotak editor kode JSON), hapus isinya, lalu <strong>Tempel (Paste)</strong> kode JSON yang baru Anda salin.
                </li>
                <li>
                  Semua tanda seru merah (<em>Required: name, icons, short_name, start_url</em>) dan kuning (<em>Recommended</em>) akan langsung berubah menjadi <strong>Hijau / Valid</strong>, dan tombol <strong>Package For Store &rarr; Android (Download APK)</strong> akan langsung aktif!
                </li>
              </ol>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyManifest}
                  className="px-4 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedManifest ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Kode JSON Manifest Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Kode JSON Manifest PWABuilder</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadIcon}
                  className="px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Ikon 512x512 PNG</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pwa' && (
          <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cara Instal Langsung dari Chrome Android (Tanpa PWABuilder)</span>
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm leading-relaxed">
                <li>
                  Buka aplikasi <strong>Keuanganku</strong> di browser <strong>Google Chrome</strong> pada HP Android Anda.
                </li>
                <li>
                  Ketuk ikon <strong>Titik Tiga (⋮)</strong> di pojok kanan atas Chrome.
                </li>
                <li>
                  Pilih menu <strong>&quot;Tambahkan ke Layar Utama&quot; (Add to Home Screen)</strong> atau <strong>&quot;Instal aplikasi&quot;</strong>.
                </li>
                <li>
                  Aplikasi <strong>Keuanganku</strong> langsung terinstal di layar HP Anda dan berjalan layar penuh tanpa bar browser.
                </li>
              </ol>
              {isInstallable && !isInstalled && (
                <button
                  type="button"
                  onClick={install}
                  className="mt-2 px-4 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Instal Langsung Sekarang</span>
                </button>
              )}
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
                  Ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah Safari.
                </li>
                <li>
                  Gulir ke bawah dan pilih <strong>&quot;Tambah ke Layar Utama&quot; (Add to Home Screen)</strong>.
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
