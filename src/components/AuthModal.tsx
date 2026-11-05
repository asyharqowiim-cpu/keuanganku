import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  User,
  AuthProvider,
} from 'firebase/auth';
import {
  X,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  githubProvider,
  FIREBASE_PROJECT_ID,
} from '../firebase';

export type AuthModalTab = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: AuthModalTab;
  currentUser: User | null;
  onClose: () => void;
  onUserUpdated: (user: User | null) => void;
  onAuthSuccess?: () => void;
  brandLogoUrl?: string;
}

function formatAuthError(err: unknown, providerLabel?: string): {
  message: string;
  needsConsoleEnable: boolean;
} {
  const raw = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: string })?.code || '';

  if (
    code === 'auth/operation-not-allowed' ||
    raw.includes('auth/operation-not-allowed')
  ) {
    return {
      message: `Metode login ${
        providerLabel || 'GitHub'
      } belum diaktifkan di Firebase Console proyek Anda (${FIREBASE_PROJECT_ID}). Silakan aktifkan terlebih dahulu di menu Authentication > Sign-in method.`,
      needsConsoleEnable: true,
    };
  }
  if (
    code === 'auth/popup-closed-by-user' ||
    raw.includes('auth/popup-closed-by-user')
  ) {
    return {
      message: 'Jendela login ditutup sebelum proses autentikasi selesai.',
      needsConsoleEnable: false,
    };
  }
  if (code === 'auth/popup-blocked' || raw.includes('auth/popup-blocked')) {
    return {
      message: 'Popup login diblokir oleh browser. Izinkan popup untuk situs ini lalu coba lagi.',
      needsConsoleEnable: false,
    };
  }
  if (
    code === 'auth/account-exists-with-different-credential' ||
    raw.includes('auth/account-exists-with-different-credential')
  ) {
    return {
      message:
        'Alamat email akun ini sudah terhubung dengan metode login lain (misalnya Google). Silakan masuk menggunakan metode tersebut.',
      needsConsoleEnable: false,
    };
  }
  if (
    code === 'auth/unauthorized-domain' ||
    raw.includes('auth/unauthorized-domain')
  ) {
    const currentHost =
      typeof window !== 'undefined' ? window.location.hostname : '';
    return {
      message: `Domain aplikasi saat ini (${currentHost}) belum terdaftar di Authorized Domains Firebase Console (${FIREBASE_PROJECT_ID}). Tambahkan "${currentHost}" pada menu Authentication > Settings > Authorized domains.`,
      needsConsoleEnable: true,
    };
  }
  if (code === 'auth/too-many-requests' || raw.includes('auth/too-many-requests')) {
    return {
      message: 'Terlalu banyak percobaan login. Silakan tunggu beberapa saat sebelum mencoba kembali.',
      needsConsoleEnable: false,
    };
  }

  return {
    message: raw || 'Terjadi kendala saat memproses autentikasi.',
    needsConsoleEnable: false,
  };
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  currentUser,
  onClose,
  onUserUpdated,
  onAuthSuccess,
  brandLogoUrl,
}) => {
  const [activeTab, setActiveTab] = useState<AuthModalTab>(initialTab);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProvider, setLoadingProvider] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [needsConsoleSetup, setNeedsConsoleSetup] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMsg('');
      setSuccessMsg('');
      setNeedsConsoleSetup(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setNeedsConsoleSetup(false);
  };

  const handleProviderSignIn = async (
    provider: AuthProvider,
    providerKey: 'google' | 'github',
    providerLabel: string
  ) => {
    resetMessages();
    setIsLoading(true);
    setLoadingProvider(providerKey);
    try {
      const cred = await signInWithPopup(auth, provider);
      onUserUpdated(cred.user);
      setSuccessMsg(
        `Berhasil ${
          activeTab === 'register' ? 'mendaftar & masuk' : 'masuk'
        } dengan ${providerLabel}!`
      );
      setTimeout(() => {
        onAuthSuccess?.();
        onClose();
      }, 500);
    } catch (err) {
      const formatted = formatAuthError(err, providerLabel);
      setErrorMsg(formatted.message);
      setNeedsConsoleSetup(formatted.needsConsoleEnable);
    } finally {
      setIsLoading(false);
      setLoadingProvider('');
    }
  };

  const handleLogout = async () => {
    resetMessages();
    setIsLoading(true);
    try {
      await signOut(auth);
      onUserUpdated(null);
      setSuccessMsg('Anda telah keluar dari akun.');
    } catch (err) {
      const formatted = formatAuthError(err);
      setErrorMsg(formatted.message);
    } finally {
      setIsLoading(false);
    }
  };

  const consoleProvidersUrl = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {brandLogoUrl && (
              <img
                src={brandLogoUrl}
                alt=""
                aria-hidden="true"
                className="w-7 h-7 object-contain shrink-0"
              />
            )}
            <div>
              <h2
                id="auth-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                {currentUser
                  ? 'Akun Keuanganku Anda'
                  : activeTab === 'register'
                  ? 'Register Akun Keuanganku'
                  : 'Login ke Keuanganku'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser
                  ? 'Kelola profil & sinkronisasi data lintas perangkat'
                  : 'Gunakan akun Google atau GitHub Anda'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-xs text-rose-700 dark:text-rose-300 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              {needsConsoleSetup && (
                <div className="pt-1 pl-6">
                  <a
                    href={consoleProvidersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Buka Firebase Console (Sign-in Method)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* STATE 1: USER IS ALREADY LOGGED IN */}
          {currentUser ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Profil'}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-slate-300 dark:border-slate-600 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0">
                    {(currentUser.displayName || currentUser.email || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {currentUser.displayName || 'Pengguna Keuanganku'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email || 'Akun Terhubung'}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      Terhubung ke Akun Cloud
                    </span>
                  </div>
                </div>
              </div>

              {/* Connected Providers Info */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Metode Login Aktif
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.providerData.map((p) => (
                    <span
                      key={p.providerId}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {p.providerId === 'google.com'
                        ? 'Google / Gmail'
                        : p.providerId === 'github.com'
                        ? 'GitHub'
                        : p.providerId}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          ) : (
            /* STATE 2: LOGGED OUT -> LOGIN / REGISTER WITH GOOGLE & GITHUB */
            <>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setActiveTab('login');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Login (Masuk)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setActiveTab('register');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Register (Daftar)
                </button>
              </div>

              <div className="space-y-3">
                {/* 1. Google / Gmail */}
                <button
                  type="button"
                  onClick={() =>
                    handleProviderSignIn(googleProvider, 'google', 'Google / Gmail')
                  }
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-white text-sm font-semibold flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 20.9 7.4 24 12 24z"
                    />
                  </svg>
                  <span>
                    {loadingProvider === 'google'
                      ? 'Menghubungkan Google...'
                      : activeTab === 'register'
                      ? 'Daftar dengan Google / Gmail'
                      : 'Login dengan Google / Gmail'}
                  </span>
                </button>

                {/* 2. GitHub */}
                <button
                  type="button"
                  onClick={() =>
                    handleProviderSignIn(githubProvider, 'github', 'GitHub')
                  }
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl border border-slate-900 dark:border-slate-700 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-semibold flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <svg
                    className="w-4 h-4 fill-current shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.05 11.05 0 0 1 5.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
                  </svg>
                  <span>
                    {loadingProvider === 'github'
                      ? 'Menghubungkan GitHub...'
                      : activeTab === 'register'
                      ? 'Daftar dengan GitHub'
                      : 'Login dengan GitHub'}
                  </span>
                </button>
              </div>

              {/* Collapsible Info: Cara Mengaktifkan GitHub di Firebase Console */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSetupGuide((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer py-1"
                >
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                    <span>Panduan Aktivasi Login GitHub di Firebase</span>
                  </span>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {showSetupGuide ? 'Sembunyikan' : 'Lihat Cara'}
                  </span>
                </button>

                {showSetupGuide && (
                  <div className="mt-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                    <p>
                      Login <strong>Google / Gmail</strong> sudah aktif secara bawaan. Untuk mengaktifkan login <strong>GitHub</strong>:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>
                        Buka{' '}
                        <a
                          href="https://github.com/settings/developers"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          GitHub Developer Settings &gt; OAuth Apps
                        </a>{' '}
                        lalu klik <strong>New OAuth App</strong>.
                      </li>
                      <li>
                        Isi <strong>Authorization callback URL</strong> dengan:{' '}
                        <code className="px-1 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 font-mono text-[11px]">
                          https://{FIREBASE_PROJECT_ID}.firebaseapp.com/__/auth/handler
                        </code>
                      </li>
                      <li>
                        Salin <strong>Client ID</strong> &amp; <strong>Client Secret</strong> dari GitHub ke menu <strong>Authentication &gt; Sign-in method &gt; GitHub</strong> di Firebase Console.
                      </li>
                    </ol>
                    <div className="pt-1">
                      <a
                        href={consoleProvidersUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>Buka Pengaturan Sign-in Firebase Console</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
