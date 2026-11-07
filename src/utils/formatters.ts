import {
  TransactionItem,
  SavingGoalItem,
  BudgetLimitItem,
  FinancialPlanItem,
} from '../types/finance';

export function formatIDR(amount: number, masked = false): string {
  if (masked) return 'Rp ••••••••';
  const rounded = Math.round(amount || 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
}

export function formatCompactIDR(amount: number, masked = false): string {
  if (masked) return 'Rp •••';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2).replace('.', ',')} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace('.', ',')} Jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${Math.round(abs / 1_000)} Rb`;
  }
  return `${sign}Rp ${abs}`;
}

export function formatRupiahInput(value: string | number): string {
  const digits = String(value ?? '').replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseRupiahInput(formatted: string | number): number {
  const digits = String(formatted ?? '').replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return 0;
  const num = Number(digits);
  return Number.isFinite(num) ? num : 0;
}

const INDONESIAN_MONTHS: Record<string, string> = {
  '01': 'Januari',
  '02': 'Februari',
  '03': 'Maret',
  '04': 'April',
  '05': 'Mei',
  '06': 'Juni',
  '07': 'Juli',
  '08': 'Agustus',
  '09': 'September',
  '10': 'Oktober',
  '11': 'November',
  '12': 'Desember',
};

const SHORT_MONTHS: Record<string, string> = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'Mei',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Agu',
  '09': 'Sep',
  '10': 'Okt',
  '11': 'Nov',
  '12': 'Des',
};

export function formatMonthLabel(monthKey: string): string {
  const parts = monthKey.split('-');
  if (parts.length === 3) {
    return `${parts[2]} ${INDONESIAN_MONTHS[parts[1]] || parts[1]} ${parts[0]}`;
  }
  const [year, month] = parts;
  if (!year || !month) return monthKey;
  return `${INDONESIAN_MONTHS[month] || month} ${year}`;
}

export function formatShortMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  if (!year || !month) return monthKey;
  return `${SHORT_MONTHS[month] || month} '${year.slice(2)}`;
}

export function formatDateID(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 2) {
    return `${INDONESIAN_MONTHS[parts[1]] || parts[1]} ${parts[0]}`;
  }
  if (parts.length !== 3) return dateStr;
  return `${parts[2]} ${SHORT_MONTHS[parts[1]] || parts[1]} ${parts[0]}`;
}

export function getLastSixMonths(currentMonthKey: string): string[] {
  const [yStr, mStr] = currentMonthKey.split('-');
  let year = parseInt(yStr, 10) || 2026;
  let month = parseInt(mStr, 10) || 11;
  const result: string[] = [];

  for (let i = 5; i >= 0; i--) {
    let targetMonth = month - i;
    let targetYear = year;
    while (targetMonth <= 0) {
      targetMonth += 12;
      targetYear -= 1;
    }
    const mm = String(targetMonth).padStart(2, '0');
    result.push(`${targetYear}-${mm}`);
  }
  return result;
}

export const AVAILABLE_MONTHS = [
  '2026-06',
  '2026-07',
  '2026-08',
  '2026-09',
  '2026-10',
  '2026-11',
  '2026-12',
];

export const INITIAL_TRANSACTIONS: TransactionItem[] = [];

export const INITIAL_SAVINGS: SavingGoalItem[] = [];

export const INITIAL_BUDGETS: BudgetLimitItem[] = [];

export const INITIAL_PLANS: FinancialPlanItem[] = [];

