import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle2, X, SlidersHorizontal } from 'lucide-react';
import { BudgetAlertNotification, FinancialPlanItem } from '../types/finance';
import { formatIDR, formatMonthLabel } from '../utils/formatters';

interface BudgetNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: BudgetAlertNotification[];
  duePlans: FinancialPlanItem[];
  activeMonth: string;
  isVaultLocked: boolean;
  onNavigateToPlanning: () => void;
}

export const BudgetNotificationDrawer: React.FC<BudgetNotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  duePlans,
  activeMonth,
  isVaultLocked,
  onNavigateToPlanning,
}) => {
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleRequestBrowserPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setBrowserPerm(result);
    if (result === 'granted') {
      new Notification('Keuanganku — Pengingat Anggaran Aktif', {
        body: `Pemantauan anggaran untuk ${formatMonthLabel(activeMonth)} telah diaktifkan.`,
      });
    }
  };

  const handleSendTestAlert = () => {
    setTestSent(true);
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted' &&
      alerts.length > 0
    ) {
      const top = alerts[0];
      new Notification(`Peringatan Anggaran: ${top.category}`, {
        body: top.message,
      });
    }
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Pengingat Anggaran & Jatuh Tempo
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Periode pemantauan: {formatMonthLabel(activeMonth)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              aria-label="Tutup panel notifikasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Browser Notification Settings */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Notifikasi Sistem & Browser Real-Time
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Status:{' '}
                {browserPerm === 'granted'
                  ? 'Aktif'
                  : browserPerm === 'denied'
                  ? 'Diblokir'
                  : 'Belum Diaktifkan'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dapatkan peringatan otomatis saat kategori pengeluaran melewati ambang batas (75%–100%) dari anggaran bulanan.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {browserPerm !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestBrowserPermission}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer"
                >
                  Aktifkan Notifikasi Perangkat
                </button>
              )}
              <button
                type="button"
                onClick={handleSendTestAlert}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                {testSent ? 'Pengingat Terkirim!' : 'Uji Pengingat Sekarang'}
              </button>
            </div>
          </div>

          {/* Budget Threshold Alerts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Peringatan Anggaran Kategori ({alerts.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToPlanning();
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Atur Batas Anggaran
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-1.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Seluruh Kategori Dalam Batas Aman
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tidak ada pengeluaran yang melampaui ambang batas peringatan bulan ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const isCritical = alert.severity === 'critical';
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border ${
                        isCritical
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/80'
                          : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80'
                      } space-y-2`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`w-4 h-4 shrink-0 ${
                              isCritical
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          />
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {alert.category}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-mono tabular-nums font-semibold ${
                            isCritical
                              ? 'text-rose-700 dark:text-rose-300'
                              : 'text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {alert.percentage}% Terpakai
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {alert.message}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        <span>
                          Realisasi: {formatIDR(alert.spentAmount, isVaultLocked)} /{' '}
                          {formatIDR(alert.limitAmount, isVaultLocked)}
                        </span>
                        {alert.remainingDailySafe > 0 ? (
                          <span>
                            Batas aman: {formatIDR(alert.remainingDailySafe, isVaultLocked)}/hr
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 font-medium">
                            Overbudget
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Planned Financial Items Due This Month */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Pengingat Rencana Keuangan Bulan Ini ({duePlans.length})
            </h3>
            {duePlans.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tidak ada agenda perencanaan keuangan yang jatuh tempo pada {formatMonthLabel(activeMonth)}.
              </p>
            ) : (
              <div className="space-y-2.5">
                {duePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {plan.title}
                      </span>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        {plan.status === 'ready' ? 'Siap Eksekusi' : 'Direncanakan'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      <span>Estimasi: {formatIDR(plan.estimatedCost, isVaultLocked)}</span>
                      <span>Terkumpul: {formatIDR(plan.allocatedAmount, isVaultLocked)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
          >
            Tutup Panel Pengingat
          </button>
        </div>
      </div>
    </div>
  );
};
