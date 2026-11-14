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
  const [activeTab, setActiveTab] = useState<'pwa' | 'ios' | 'apk'>(
    isIOS ? 'ios' : 'pwa'
  );

  if (!isOpen) return null;

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
                Jadikan Aplikasi Mobile (Android & iOS)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Keuanganku sudah dilengkapi teknologi PWA & siap diinstal di layar utama HP Anda
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
                  : 'Siap Diinstal Sebagai Aplikasi Mobile (Full-Screen)'}
              </span>
            </div>
            <p className="text-xs text-blue-800/80 dark:text-sky-300/80">
              Berjalan layar penuh tanpa bar browser, hemat kuota, bisa dicatat saat offline, dan sinkron Cloud.
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
            onClick={() => setActiveTab('pwa')}
            className={`py-2 px-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            1. HP Android
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
            2. iPhone / iOS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            3. Build File APK
          </button>
        </div>

        {activeTab === 'pwa' && (
          <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cara Instal Langsung di HP Android (Google Chrome)</span>
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm leading-relaxed">
                <li>
                  Buka link aplikasi <strong>Keuanganku</strong> di browser <strong>Google Chrome</strong> pada HP Android Anda.
                </li>
                <li>
                  Ketuk tombol <strong>Instal Sekarang (1-Klik)</strong> di atas, atau ketuk ikon <strong>Titik Tiga (⋮)</strong> di pojok kanan atas Chrome.
                </li>
                <li>
                  Pilih menu <strong>&quot;Instal aplikasi&quot; (Install app)</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.
                </li>
                <li>
                  Ikon <strong>Keuanganku</strong> otomatis muncul di daftar aplikasi HP Anda dan terbuka layar penuh persis seperti aplikasi native.
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

        {activeTab === 'apk' && (
          <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Cara Mengubah Menjadi File .APK / .AAB (Play Store)</span>
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Karena aplikasi ini sudah memiliki <strong>Web App Manifest</strong> & <strong>Service Worker</strong> standar industri, Anda punya 2 cara mudah membuat file <code>.apk</code>:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Opsi A — Tanpa Coding via PWABuilder.com (Paling Cepat)
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    Buka <strong>pwabuilder.com</strong>, tempel URL publik aplikasi ini, lalu klik <strong>Package for Store &rarr; Android</strong> untuk mengunduh file <code>.apk</code> dan <code>.aab</code> siap rilis Play Store.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Opsi B — Menggunakan Ionic Capacitor (Native Android Studio)
                  </div>
                  <code className="block mt-1.5 p-2 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                    npm i @capacitor/core @capacitor/cli @capacitor/android{'\n'}
                    npx cap init Keuanganku com.keuanganku.app --web-dir=dist{'\n'}
                    npm run build && npx cap add android && npx cap open android
                  </code>
                </div>
              </div>
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
