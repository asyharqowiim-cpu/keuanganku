/**
 * Firestore Security Rules Test Specification (Dirty Dozen Verification)
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'create' | 'update' | 'get' | 'list';
  authUid: string;
  emailVerified: boolean;
  path: string;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Cross-Tenant Write (userId Mismatch)',
    collection: 'transactions',
    operation: 'create',
    authUid: 'user_A',
    emailVerified: true,
    path: '/users/user_B/transactions/tx_1',
    payload: { userId: 'user_B', type: 'expense', amount: 50000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Spoof',
    collection: 'transactions',
    operation: 'create',
    authUid: 'user_A',
    emailVerified: false,
    path: '/users/user_A/transactions/tx_1',
    payload: { userId: 'user_A', type: 'income', amount: 1000000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection',
    collection: 'transactions',
    operation: 'create',
    authUid: 'user_A',
    emailVerified: true,
    path: '/users/user_A/transactions/tx_1',
    payload: { userId: 'user_A', type: 'expense', amount: 50000, isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'ID Poisoning Attack',
    collection: 'transactions',
    operation: 'create',
    authUid: 'user_A',
    emailVerified: true,
    path: '/users/user_A/transactions/bad$id!',
    payload: { userId: 'user_A', type: 'expense', amount: 50000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Oversized Ciphertext Exhaustion',
    collection: 'transactions',
    operation: 'create',
    authUid: 'user_A',
    emailVerified: true,
    path: '/users/user_A/transactions/tx_1',
    payload: { userId: 'user_A', encryptedPayload: 'A'.repeat(5000) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Negative Amount Injection',
    collection: 'transactions',
    operation: 'create',
    authUid: 'user_A',
    emailVerified: true,
    path: '/users/user_A/transactions/tx_1',
    payload: { userId: 'user_A', type: 'expense', amount: -1000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Forged Client Timestamp on Create',
    collection: 'savings',
    operation: 'create',
    authUid: 'user_A',
    emailVerified: true,
    path: '/users/user_A/savings/sav_1',
    payload: { userId: 'user_A', createdAt: '1999-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Mutating Immutable createdAt on Update',
    collection: 'savings',
    operation: 'update',
    authUid: 'user_A',
    emailVerified: true,
    path: '/users/user_A/savings/sav_1',
    payload: { userId: 'user_A', createdAt: '2026-11-05T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Ownership Transfer Attack on Update',
    collection: 'budgets',
    operation: 'update',
    authUid: 'user_A',
    emailVerified: true,
    path: '/users/user_A/budgets/b_1',
    payload: { userId: 'user_B', limitAmount: 2000000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Terminal State Bypass on FinancialPlan',
    collection: 'plans',
    operation: 'update',
    authUid: 'user_A',
    emailVerified: true,
    path: '/users/user_A/plans/plan_completed',
    payload: { status: 'planned', allocatedAmount: 0 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Invalid Enum Injection',
    collection: 'transactions',
    operation: 'create',
    authUid: 'user_A',
    emailVerified: true,
    path: '/users/user_A/transactions/tx_1',
    payload: { userId: 'user_A', type: 'crypto_swap', amount: 100000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Malformed MonthKey Pattern',
    collection: 'budgets',
    operation: 'create',
    authUid: 'user_A',
    emailVerified: true,
    path: '/users/user_A/budgets/b_1',
    payload: { userId: 'user_A', monthKey: '2026-13-99', limitAmount: 1000000 },
    expectedResult: 'PERMISSION_DENIED',
  },
];
