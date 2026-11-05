import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  TransactionItem,
  BudgetLimitItem,
  SavingGoalItem,
} from '../types/finance';
import {
  formatCompactIDR,
  formatShortMonth,
  getLastSixMonths,
} from '../utils/formatters';

interface ChartsSectionProps {
  transactions: TransactionItem[];
  budgets: BudgetLimitItem[];
  savings: SavingGoalItem[];
  activeMonth: string;
  isVaultLocked: boolean;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  transactions,
  budgets,
  activeMonth,
  isVaultLocked,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const sixMonths = getLastSixMonths(activeMonth);

  const monthlySeries = sixMonths.map((mKey) => {
    const monthTxs = transactions.filter((t) => t.monthKey === mKey);
    const income = monthTxs
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = monthTxs
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      monthKey: mKey,
      label: formatShortMonth(mKey),
      income,
      expense,
      surplus: income - expense,
    };
  });

  const maxVal = Math.max(
    10_000_000,
    ...monthlySeries.map((d) => Math.max(d.income, d.expense))
  );

  const activeExpenses = transactions.filter(
    (t) => t.monthKey === activeMonth && t.type === 'expense'
  );
  const activeBudgets = budgets.filter((b) => b.monthKey === activeMonth);

  const focusedMonth =
    hoveredIdx !== null
      ? monthlySeries[hoveredIdx]
      : monthlySeries[monthlySeries.length - 1];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
      {/* Left: Modern 6-Month Cashflow Bar Chart (7 cols) */}
      <div className="lg:col-span-7 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-lg shadow-blue-950/5 flex flex-col justify-between transition-all">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Grafik Arus Kas 6 Bulan
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Perbandingan pemasukan & pengeluaran bulanan secara interaktif
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-xs shadow-emerald-500/50" />
                Pemasukan
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-xs shadow-rose-500/50" />
                Pengeluaran
              </span>
            </div>
          </div>

          <div className="w-full">
            <svg
              viewBox="0 0 600 215"
              className="w-full h-44 sm:h-56 md:h-60 overflow-visible select-none"
              role="img"
              aria-label="Grafik arus kas 6 bulan"
            >
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 175 - ratio * 145;
                return (
                  <g key={idx}>
                    <line
                      x1={56}
                      y1={y}
                      x2={585}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-800/90"
                      strokeDasharray={ratio === 0 ? undefined : '4 4'}
                      strokeWidth={1}
                    />
                    <text
                      x={48}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-400 dark:fill-slate-500 text-[11px] font-mono tabular-nums font-medium"
                    >
                      {formatCompactIDR(maxVal * ratio, isVaultLocked).replace('Rp ', '')}
                    </text>
                  </g>
                );
              })}

              {monthlySeries.map((item, i) => {
                const groupX = 82 + i * 85;
                const incH = Math.max(6, (item.income / maxVal) * 145);
                const expH = Math.max(6, (item.expense / maxVal) * 145);
                const isActive = item.monthKey === activeMonth;
                const isHovered = hoveredIdx === i;

                return (
                  <g
                    key={item.monthKey}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <rect
                      x={groupX - 14}
                      y={16}
                      width={68}
                      height={166}
                      rx={12}
                      className={
                        isHovered
                          ? 'fill-blue-50/80 dark:fill-slate-800/70'
                          : isActive
                          ? 'fill-slate-50/70 dark:fill-slate-800/30'
                          : 'fill-transparent'
                      }
                    />
                    <rect
                      x={groupX}
                      y={175 - incH}
                      width={18}
                      height={incH}
                      rx={5}
                      fill="url(#incGrad)"
                    />
                    <rect
                      x={groupX + 22}
                      y={175 - expH}
                      width={18}
                      height={expH}
                      rx={5}
                      fill="url(#expGrad)"
                    />
                    <text
                      x={groupX + 20}
                      y={198}
                      textAnchor="middle"
                      className={`text-xs ${
                        isActive || isHovered
                          ? 'fill-blue-600 dark:fill-sky-400 font-extrabold'
                          : 'fill-slate-500 dark:fill-slate-400 font-medium'
                      }`}
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="inline-flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            <span>Periode {focusedMonth.label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono tabular-nums">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{formatCompactIDR(focusedMonth.income, isVaultLocked)}
            </span>
            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5" />
              -{formatCompactIDR(focusedMonth.expense, isVaultLocked)}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 font-bold">
              Selisih: {formatCompactIDR(focusedMonth.surplus, isVaultLocked)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Monthly Budget Progress Card (5 cols) */}
      <div className="lg:col-span-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-lg shadow-blue-950/5 flex flex-col justify-between transition-all">
        <div className="space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Batas Anggaran Bulanan
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Realisasi pemakaian anggaran per kategori
              </p>
            </div>
          </div>

          {activeBudgets.length === 0 ? (
            <div className="py-12 px-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1.5">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Belum Ada Batas Anggaran
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur batas pengeluaran di menu Planning & Anggaran untuk memantau pemakaian.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBudgets.slice(0, 5).map((b) => {
                const spent = activeExpenses
                  .filter((t) => t.category === b.category)
                  .reduce((s, t) => s + t.amount, 0);
                const pct =
                  b.limitAmount > 0
                    ? Math.round((spent / b.limitAmount) * 100)
                    : 0;
                const isOver = pct >= 100;
                const isWarn = !isOver && pct >= b.alertThreshold;

                return (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                      <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                        {b.category}
                      </span>
                      <span className="font-mono tabular-nums text-xs sm:text-sm text-slate-600 dark:text-slate-300 shrink-0">
                        {formatCompactIDR(spent, isVaultLocked)} /{' '}
                        {formatCompactIDR(b.limitAmount, isVaultLocked)}{' '}
                        <strong
                          className={`ml-1 px-1.5 py-0.5 rounded-md text-xs ${
                            isOver
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                              : isWarn
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {pct}%
                        </strong>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, pct)}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver
                            ? 'bg-gradient-to-r from-rose-500 to-red-600'
                            : isWarn
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Aman
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Mendekati Batas
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Melebihi Batas
          </span>
        </div>
      </div>
    </div>
  );
};
