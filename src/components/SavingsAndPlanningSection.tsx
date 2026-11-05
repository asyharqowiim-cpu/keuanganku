import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  PiggyBank,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import {
  SavingGoalItem,
  BudgetLimitItem,
  FinancialPlanItem,
  TransactionItem,
  SAVING_CATEGORIES,
  EXPENSE_CATEGORIES,
  PlanPriority,
  PlanStatus,
} from '../types/finance';
import {
  formatIDR,
  formatCompactIDR,
  formatMonthLabel,
  AVAILABLE_MONTHS,
} from '../utils/formatters';

interface SavingsAndPlanningSectionProps {
  mode: 'savings' | 'planning';
  savings: SavingGoalItem[];
  budgets: BudgetLimitItem[];
  plans: FinancialPlanItem[];
  transactions: TransactionItem[];
  activeMonth: string;
  isVaultLocked: boolean;
  onSaveSavingGoal: (data: {
    id?: string;
    name: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    targetDate: string;
    notes?: string;
  }) => Promise<void>;
  onAdjustSavingBalance: (goal: SavingGoalItem, delta: number) => Promise<void>;
  onDeleteSavingGoal: (id: string) => Promise<void>;
  onSaveBudgetLimit: (data: {
    id?: string;
    category: string;
    monthKey: string;
    limitAmount: number;
    alertThreshold: number;
    notifyEnabled: boolean;
  }) => Promise<void>;
  onDeleteBudgetLimit: (id: string) => Promise<void>;
  onSaveFinancialPlan: (data: {
    id?: string;
    title: string;
    category: string;
    estimatedCost: number;
    allocatedAmount: number;
    targetMonth: string;
    priority: PlanPriority;
    status: PlanStatus;
    notes?: string;
  }) => Promise<void>;
  onExecutePlanToExpense: (plan: FinancialPlanItem) => Promise<void>;
  onDeleteFinancialPlan: (id: string) => Promise<void>;
}

export const SavingsAndPlanningSection: React.FC<SavingsAndPlanningSectionProps> = ({
  mode,
  savings,
  budgets,
  plans,
  transactions,
  activeMonth,
  isVaultLocked,
  onSaveSavingGoal,
  onAdjustSavingBalance,
  onDeleteSavingGoal,
  onSaveBudgetLimit,
  onDeleteBudgetLimit,
  onSaveFinancialPlan,
  onExecutePlanToExpense,
  onDeleteFinancialPlan,
}) => {
  // Saving Form
  const [showSavingForm, setShowSavingForm] = useState(false);
  const [savName, setSavName] = useState('');
  const [savCat, setSavCat] = useState(SAVING_CATEGORIES[0]);
  const [savTarget, setSavTarget] = useState('');
  const [savCurrent, setSavCurrent] = useState('');
  const [savMonthly, setSavMonthly] = useState('');

  // Budget Form
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [bgtCategory, setBgtCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [bgtLimit, setBgtLimit] = useState('');
  const [bgtThreshold, setBgtThreshold] = useState('80');

  // Plan Form
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planCategory, setPlanCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [planCost, setPlanCost] = useState('');
  const [planMonth, setPlanMonth] = useState(activeMonth);

  const handleCreateSaving = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savName.trim() || Number(savTarget) <= 0) return;
    await onSaveSavingGoal({
      name: savName.trim().slice(0, 120),
      category: savCat,
      targetAmount: Math.round(Number(savTarget)),
      currentAmount: Math.max(0, Math.round(Number(savCurrent) || 0)),
      monthlyContribution: Math.max(0, Math.round(Number(savMonthly) || 1000000)),
      targetDate: '2027-12-01',
    });
    setSavName('');
    setSavTarget('');
    setSavCurrent('');
    setSavMonthly('');
    setShowSavingForm(false);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = Math.round(Number(bgtLimit));
    if (isNaN(limitNum) || limitNum <= 0) return;
    const existing = budgets.find(
      (b) => b.monthKey === activeMonth && b.category === bgtCategory
    );
    await onSaveBudgetLimit({
      id: existing?.id,
      category: bgtCategory,
      monthKey: activeMonth,
      limitAmount: limitNum,
      alertThreshold: Math.min(100, Math.max(50, Math.round(Number(bgtThreshold) || 80))),
      notifyEnabled: true,
    });
    setBgtLimit('');
    setShowBudgetForm(false);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim() || Number(planCost) <= 0) return;
    const costNum = Math.round(Number(planCost));
    await onSaveFinancialPlan({
      title: planTitle.trim().slice(0, 160),
      category: planCategory,
      estimatedCost: costNum,
      allocatedAmount: 0,
      targetMonth: planMonth,
      priority: 'medium',
      status: 'planned',
    });
    setPlanTitle('');
    setPlanCost('');
    setShowPlanForm(false);
  };

  if (mode === 'savings') {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-lg shadow-blue-950/5 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Pos Tabungan & Dana Darurat
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Pantau progres setiap target tabungan dan tambah setoran kapan saja
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSavingForm(!showSavingForm)}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showSavingForm ? 'Tutup Formulir' : 'Tambah Pos Tabungan'}
          </button>
        </div>

        {showSavingForm && (
          <form
            onSubmit={handleCreateSaving}
            className="p-5 sm:p-6 rounded-2xl bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Target Tabungan
              </label>
              <input
                type="text"
                required
                value={savName}
                onChange={(e) => setSavName(e.target.value)}
                placeholder="Contoh: Dana Darurat, DP Rumah, Pendidikan..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori
              </label>
              <select
                value={savCat}
                onChange={(e) => setSavCat(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SAVING_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Nominal (Rp)
              </label>
              <input
                type="number"
                required
                value={savTarget}
                onChange={(e) => setSavTarget(e.target.value)}
                placeholder="50000000"
                className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                Simpan Pos
              </button>
            </div>
          </form>
        )}

        {savings.length === 0 ? (
          <div className="py-14 px-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              Belum Ada Pos Tabungan
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Klik tombol <strong>Tambah Pos Tabungan</strong> di kanan atas untuk mulai menyisihkan dana darurat atau target masa depan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {savings.map((goal) => {
              const pct =
                goal.targetAmount > 0
                  ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                  : 0;
              return (
                <div
                  key={goal.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100/80 dark:bg-blue-950 text-blue-700 dark:text-sky-300 mb-1.5">
                          {goal.category}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {goal.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteSavingGoal(goal.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Hapus Pos Tabungan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-lg sm:text-xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatCompactIDR(goal.currentAmount, isVaultLocked)}
                        </span>
                        <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                          dari {formatCompactIDR(goal.targetAmount, isVaultLocked)} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onAdjustSavingBalance(goal, goal.monthlyContribution || 1000000)
                      }
                      className="flex-1 py-2 px-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 hover:bg-emerald-200/80 rounded-xl inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Setor {formatCompactIDR(goal.monthlyContribution || 1000000, isVaultLocked)}
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustSavingBalance(goal, -1000000)}
                      className="py-2 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-700/70 hover:bg-slate-300/70 dark:hover:bg-slate-700 rounded-xl inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      Tarik
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // MODE === 'planning'
  const monthBudgets = budgets.filter((b) => b.monthKey === activeMonth);
  const monthExpenses = transactions.filter(
    (t) => t.monthKey === activeMonth && t.type === 'expense'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
      {/* 1. Monthly Budget Limits Card (6 cols) */}
      <div className="lg:col-span-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-lg shadow-blue-950/5 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Anggaran Bulanan ({formatMonthLabel(activeMonth)})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Batas pengeluaran kategori & pengingat otomatis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBudgetForm(!showBudgetForm)}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showBudgetForm ? 'Tutup' : 'Atur Anggaran'}
          </button>
        </div>

        {showBudgetForm && (
          <form
            onSubmit={handleSaveBudget}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori Pengeluaran
              </label>
              <select
                value={bgtCategory}
                onChange={(e) => setBgtCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Batas Bulanan (Rp)
              </label>
              <input
                type="number"
                required
                value={bgtLimit}
                onChange={(e) => setBgtLimit(e.target.value)}
                placeholder="3500000"
                className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Peringatan (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={bgtThreshold}
                onChange={(e) => setBgtThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer transition-colors"
              >
                Simpan Batas Anggaran
              </button>
            </div>
          </form>
        )}

        {monthBudgets.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Belum ada anggaran bulanan. Klik <strong>Atur Anggaran</strong> untuk menambahkan batas pengeluaran.
          </div>
        ) : (
          <div className="space-y-3.5">
            {monthBudgets.map((b) => {
              const spent = monthExpenses
                .filter((t) => t.category === b.category)
                .reduce((s, t) => s + t.amount, 0);
              const pct =
                b.limitAmount > 0 ? Math.round((spent / b.limitAmount) * 100) : 0;
              return (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {b.category}
                      </span>
                      <span className="font-mono tabular-nums text-xs sm:text-sm text-slate-600 dark:text-slate-300 shrink-0">
                        {formatCompactIDR(spent, isVaultLocked)} / {formatCompactIDR(b.limitAmount, isVaultLocked)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, pct)}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 100
                            ? 'bg-rose-500'
                            : pct >= b.alertThreshold
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteBudgetLimit(b.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer shrink-0"
                    title="Hapus anggaran"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Upcoming Financial Planning List (6 cols) */}
      <div className="lg:col-span-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-lg shadow-blue-950/5 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/80 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Rencana Kebutuhan Mendatang
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Agenda pengeluaran terencana & estimasi biaya
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPlanForm(!showPlanForm)}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 dark:bg-blue-600 hover:opacity-90 rounded-xl shadow-sm inline-flex items-center gap-1.5 cursor-pointer transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {showPlanForm ? 'Tutup' : 'Tambah Rencana'}
          </button>
        </div>

        {showPlanForm && (
          <form
            onSubmit={handleCreatePlan}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Rencana Kebutuhan
              </label>
              <input
                type="text"
                required
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder="Contoh: Pajak Kendaraan, Liburan Keluarga..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Estimasi Biaya (Rp)
              </label>
              <input
                type="number"
                required
                value={planCost}
                onChange={(e) => setPlanCost(e.target.value)}
                placeholder="5000000"
                className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Bulan
              </label>
              <select
                value={planMonth}
                onChange={(e) => setPlanMonth(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {AVAILABLE_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer transition-colors"
              >
                Simpan Rencana Kebutuhan
              </button>
            </div>
          </form>
        )}

        {plans.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Belum ada rencana keuangan. Klik <strong>Tambah Rencana</strong> untuk mencatat agenda kebutuhan mendatang.
          </div>
        ) : (
          <div className="space-y-3.5">
            {plans.map((plan) => {
              const isDone = plan.status === 'completed';
              return (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div
                      className={`font-bold text-sm sm:text-base ${
                        isDone
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {plan.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 font-semibold">
                        {formatMonthLabel(plan.targetMonth)}
                      </span>
                      <span>·</span>
                      <span>{plan.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono tabular-nums font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      {formatIDR(plan.estimatedCost, isVaultLocked)}
                    </span>
                    {!isDone ? (
                      <button
                        type="button"
                        onClick={() => onExecutePlanToExpense(plan)}
                        className="px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 hover:bg-emerald-200/80 rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Realisasikan
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold inline-flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Selesai
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteFinancialPlan(plan.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Hapus rencana"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
