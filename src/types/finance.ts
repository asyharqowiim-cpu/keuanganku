export type TransactionType = 'income' | 'expense';

export interface TransactionItem {
  id: string;
  userId: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  monthKey: string; // YYYY-MM
  account: string;
  title: string;
  notes?: string;
  encryptedPayload: string;
  isEncrypted: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SavingGoalItem {
  id: string;
  userId: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: string; // YYYY-MM-DD
  notes?: string;
  encryptedPayload: string;
  isEncrypted: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BudgetLimitItem {
  id: string;
  userId: string;
  category: string;
  monthKey: string; // YYYY-MM
  limitAmount: number;
  alertThreshold: number; // 50..100
  notifyEnabled: boolean;
  encryptedPayload: string;
  isEncrypted: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type PlanPriority = 'high' | 'medium' | 'low';
export type PlanStatus = 'planned' | 'ready' | 'completed';

export interface FinancialPlanItem {
  id: string;
  userId: string;
  title: string;
  category: string;
  estimatedCost: number;
  allocatedAmount: number;
  targetMonth: string; // YYYY-MM
  priority: PlanPriority;
  status: PlanStatus;
  notes?: string;
  encryptedPayload: string;
  isEncrypted: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BudgetAlertNotification {
  id: string;
  category: string;
  monthKey: string;
  spentAmount: number;
  limitAmount: number;
  percentage: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  remainingDailySafe: number;
}

export const INCOME_CATEGORIES = [
  'Gaji & Tunjangan',
  'Bisnis & Usaha',
  'Freelance & Proyek',
  'Dividen & Investasi',
  'Bonus & Komisi',
  'Pemasukan Lainnya',
];

export const EXPENSE_CATEGORIES = [
  'Kebutuhan Pokok & Dapur',
  'Tempat Tinggal & Utilitas',
  'Transportasi & BBM',
  'Tagihan & Internet',
  'Kesehatan & Asuransi',
  'Pendidikan & Pengembangan',
  'Gaya Hidup & Hiburan',
  'Keluarga & Sosial',
];

export const SAVING_CATEGORIES = [
  'Dana Darurat',
  'Properti & KPR',
  'Investasi Jangka Panjang',
  'Dana Pendidikan',
  'Pensiun & Hari Tua',
  'Target Khusus',
];

export const ACCOUNT_OPTIONS = [
  'BCA Prioritas / Utama',
  'Mandiri Tabungan',
  'BNI / BRI Operasional',
  'Bibit / RDN Investasi',
  'GoPay / OVO / E-Wallet',
  'Dompet Tunai',
];
