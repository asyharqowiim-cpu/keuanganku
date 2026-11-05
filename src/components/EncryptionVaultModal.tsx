import React, { useState } from 'react';
import { Shield, Lock, Unlock, KeyRound, Check, X, Eye } from 'lucide-react';
import { TransactionItem } from '../types/finance';

interface EncryptionVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyFingerprint: string;
  isVaultLocked: boolean;
  onToggleLock: (passphraseInput?: string) => boolean;
  onUpdatePassphrase: (newPassphrase: string) => Promise<void>;
  sampleTransaction?: TransactionItem;
}

export const EncryptionVaultModal: React.FC<EncryptionVaultModalProps> = ({
  isOpen,
  onClose,
  keyFingerprint,
  isVaultLocked,
  onToggleLock,
  onUpdatePassphrase,
  sampleTransaction,
}) => {
  const [newPassphrase, setNewPassphrase] = useState('');
  const [unlockInput, setUnlockInput] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSaveNewPassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassphrase.trim().length < 4) return;
    setIsUpdating(true);
    await onUpdatePassphrase(newPassphrase.trim());
    setIsUpdating(false);
    setNewPassphrase('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onToggleLock(unlockInput);
    if (!ok) {
      setUnlockError('Frasa sandi brankas tidak cocok. Coba lagi.');
    } else {
      setUnlockError('');
      setUnlockInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Pengaturan Privasi & Kunci Layar Nominal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lindungi tampilan saldo dan rincian transaksi Anda dengan kata sandi pribadi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
            aria-label="Tutup modal enkripsi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key Fingerprint & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Sidik Jari Kunci Aktif (SHA-256)
            </div>
            <div className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {keyFingerprint}
            </div>
            <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400">
              Algoritma: WebCrypto AES-GCM 256-bit
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Status Visibilitas Layar & Memori
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {isVaultLocked
                  ? 'Brankas Terkunci (Nominal Disamarkan)'
                  : 'Brankas Terbuka (Dekripsi Aktif)'}
              </div>
            </div>
            {!isVaultLocked && (
              <button
                type="button"
                onClick={() => onToggleLock()}
                className="mt-3 inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 hover:bg-amber-200/70 rounded-lg transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Kunci Tampilan Brankas Sekarang
              </button>
            )}
          </div>
        </div>

        {/* Unlock form if locked */}
        {isVaultLocked && (
          <form
            onSubmit={handleUnlockSubmit}
            className="p-4 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 space-y-3"
          >
            <div className="text-xs font-medium text-amber-900 dark:text-amber-200">
              Brankas sedang dikunci. Masukkan frasa sandi brankas untuk mendekripsi nominal dan rincian transaksi:
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={unlockInput}
                onChange={(e) => setUnlockInput(e.target.value)}
                placeholder="Masukkan frasa sandi brankas..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                Buka Brankas
              </button>
            </div>
            {unlockError && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{unlockError}</p>
            )}
          </form>
        )}

        {/* Configure / Rotate Master Passphrase */}
        <form onSubmit={handleSaveNewPassphrase} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            Perbarui Frasa Sandi Utama (Master Passphrase E2EE)
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mengubah frasa sandi akan menurunkan kunci AES-256 baru dan mengenkripsi ulang seluruh payload sebelum disinkronkan ke cloud Firestore. Frasa sandi tidak pernah dikirim ke server.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={newPassphrase}
                onChange={(e) => setNewPassphrase(e.target.value)}
                placeholder="Minimal 4 karakter frasa sandi rahasia..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdating || newPassphrase.trim().length < 4}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-50 rounded-lg whitespace-nowrap cursor-pointer"
            >
              {isUpdating ? 'Mengenkripsi Ulang...' : 'Terapkan Kunci Baru'}
            </button>
          </div>
          {savedNotice && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-4 h-4" />
              Kunci enkripsi berhasil diperbarui dan seluruh catatan telah dienkripsi ulang.
            </div>
          )}
        </form>

        {/* Live Ciphertext Inspector */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Inspektor Payload Terenkripsi Langsung (Bukti Zero-Knowledge)
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Contoh representasi kriptografi catatan terbaru Anda saat disimpan di Cloud Firestore:
          </p>
          <div className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto space-y-1.5">
            <div className="text-slate-400">
              Plaintext (Hanya di Memori Browser):{' '}
              <span className="text-emerald-400">
                {isVaultLocked
                  ? '[TERKUNCI - MASUKKAN FRASA SANDI]'
                  : sampleTransaction
                  ? `${sampleTransaction.title} — Rp ${sampleTransaction.amount.toLocaleString('id-ID')}`
                  : 'Belum ada transaksi'}
              </span>
            </div>
            <div className="text-slate-400 break-all">
              Ciphertext AES-256-GCM (Tersimpan di Cloud):{' '}
              <span className="text-amber-300">
                {sampleTransaction?.encryptedPayload ||
                  'v1:8fK2mP9xQ1vL4nR7:e9A2cF4b8D1e0F3a7C6b5E4d3F2a1B0c9D8e7F6a5B4c3D2e1F0a'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
