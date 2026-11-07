import React, { useState, useEffect } from 'react';
import { User, updateProfile } from 'firebase/auth';
import {
  User as UserIcon,
  Mail,
  CheckCircle2,
  Calendar,
  Clock,
  Shield,
  RefreshCw,
  Download,
  LogOut,
  Edit3,
  Save,
  X,
  LogIn,
  Wallet,
  Target,
  PieChart,
  CalendarCheck,
  KeyRound,
} from 'lucide-react';
import { auth } from '../firebase';
import { formatCompactIDR } from '../utils/formatters';

interface UserProfileSectionProps {
  currentUser: User | null;
  isVaultLocked: boolean;
  isSyncingCloud: boolean;
  totalNetWorth: number;
  totalSavingsAccumulated: number;
  transactionsCount: number;
  savingsCount: number;
  budgetsCount: number;
  plansCount: number;
  onUserUpdated: (user: User | null) => void;
  onSyncCloud: () => void;
  onOpenVaultModal: () => void;
  onExportCSV: () => void;
  onSignOut: () => void;
  onOpenAuthModal: () => void;
}

function formatTimestampID(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export const UserProfileSection: React.FC<UserProfileSectionProps> = ({
  currentUser,
  isVaultLocked,
  isSyncingCloud,
  totalNetWorth,
  totalSavingsAccumulated,
  transactionsCount,
  savingsCount,
  budgetsCount,
  plansCount,
  onUserUpdated,
  onSyncCloud,
  onOpenVaultModal,
  onExportCSV,
  onSignOut,
  onOpenAuthModal,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [displayNameInput, setDisplayNameInput] = useState<string>(
    currentUser?.displayName || ''
  );
  const [photoUrlInput, setPhotoUrlInput] = useState<string>(
    currentUser?.photoURL || ''
  );
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    setDisplayNameInput(currentUser?.displayName || '');
    setPhotoUrlInput(currentUser?.photoURL || '');
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setStatusMessage(null);
    setIsSavingProfile(true);
    try {
      await updateProfile(currentUser, {
        displayName: displayNameInput.trim().slice(0, 80) || 'Pengguna Keuanganku',
        photoURL: photoUrlInput.trim() || null,
      });
      await currentUser.reload();
      onUserUpdated(auth.currentUser);
      setIsEditing(false);
      setStatusMessage({
        type: 'success',
        text: 'Profil pengguna berhasil diperbarui.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Gagal memperbarui profil pengguna.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Anda Belum Login ke Akun Cloud
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Saat ini Anda menggunakan mode penyimpanan perangkat lokal. Masuk menggunakan akun <strong>Google</strong> atau <strong>GitHub</strong> untuk mengelola profil Anda dan menyinkronkan data keuangan secara otomatis di Cloud.
          </p>
        </div>
        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 inline-flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Login dengan Google / GitHub</span>
          </button>
        </div>
      </div>
    );
  }

  const userInitial = (
    currentUser.displayName ||
    currentUser.email ||
    'U'
  )
    .charAt(0)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* MAIN PROFILE CARD */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg shadow-blue-950/5">
        {/* Top Blue Accent Banner */}
        <div className="h-16 sm:h-20 bg-gradient-to-r from-blue-600 via-blue-700 to-sky-500 px-5 sm:px-8 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold tracking-wide text-white/90 uppercase">
            Profil & Identitas Akun Cloud
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sinkron Cloud Aktif
          </span>
        </div>

        <div className="px-5 sm:px-8 py-6 sm:py-7 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Foto Profil'}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-100 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center border-2 border-blue-100 dark:border-slate-700 shadow-md shrink-0">
                  {userInitial}
                </div>
              )}

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white break-words">
                    {currentUser.displayName || 'Pengguna Keuanganku'}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Akun Terverifikasi
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 break-all sm:break-normal">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>{currentUser.email || 'Email terhubung via OAuth'}</span>
                </div>
              </div>
            </div>

            {/* Edit Profile & Logout Quick Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-initial justify-center px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ubah Profil</span>
                </button>
              )}
              <button
                type="button"
                onClick={onSignOut}
                className="flex-1 sm:flex-initial justify-center px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>

          {/* EDIT PROFILE FORM (When active) */}
          {isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Perbarui Informasi Profil
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap / Nama Tampilan
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    placeholder="Nama tampilan Anda"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Foto Profil (Opsional)
                  </label>
                  <input
                    type="url"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* ACCOUNT DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200/70 dark:border-slate-800">
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                <span>Metode Login Terhubung</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentUser.providerData.map((p) => (
                  <span
                    key={p.providerId}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300"
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

            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Terdaftar Sejak</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 pt-1">
                {formatTimestampID(currentUser.metadata.creationTime)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Login Terakhir</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 pt-1">
                {formatTimestampID(currentUser.metadata.lastSignInTime)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RINGKASAN PORTOFOLIO & AKTIVITAS AKUN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Kekayaan Bersih Akun</span>
            <Wallet className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatCompactIDR(totalNetWorth, isVaultLocked)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {transactionsCount} total transaksi tercatat
          </div>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Tabungan</span>
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatCompactIDR(totalSavingsAccumulated, isVaultLocked)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {savingsCount} pos tabungan aktif
          </div>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Kategori Anggaran</span>
            <PieChart className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {budgetsCount} Kategori
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Batas anggaran terpantau
          </div>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Rencana Keuangan</span>
            <CalendarCheck className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {plansCount} Rencana
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Target pengadaan & alokasi
          </div>
        </div>
      </div>

      {/* PENGATURAN AKUN, PRIVASI & SINKRONISASI DATA */}
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Pengaturan Keamanan & Data Akun
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola sinkronisasi Cloud, kunci privasi layar, dan pencadangan laporan CSV akun Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={onSyncCloud}
            disabled={isSyncingCloud}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 bg-slate-50/70 dark:bg-slate-800/50 text-left space-y-1.5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Sinkronisasi Cloud Manual
              </span>
              <RefreshCw
                className={`w-4 h-4 text-blue-600 dark:text-sky-400 ${
                  isSyncingCloud ? 'animate-spin' : ''
                }`}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pastikan seluruh catatan terbaru tersimpan ke database Cloud Anda.
            </p>
          </button>

          <button
            type="button"
            onClick={onOpenVaultModal}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 bg-slate-50/70 dark:bg-slate-800/50 text-left space-y-1.5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Kunci Privasi Nominal ({isVaultLocked ? 'Terkunci' : 'Terbuka'})
              </span>
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Atur kata sandi kunci tampilan untuk menyembunyikan angka saldo.
            </p>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 bg-slate-50/70 dark:bg-slate-800/50 text-left space-y-1.5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Unduh Laporan CSV
              </span>
              <Download className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ekspor riwayat transaksi bulan aktif ke file spreadsheet CSV.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
