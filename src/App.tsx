import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Plus,
  Search,
  Download,
  Bell,
  Shield,
  Sun,
  Moon,
  Cloud,
  LogOut,
  Edit3,
  Trash2,
  AlertTriangle,
  RefreshCw,
  User as UserIcon,
  LogIn,
  UserPlus,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  LayoutDashboard,
  ListOrdered,
  CalendarRange,
} from 'lucide-react';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  handleFirestoreError,
} from './firebase';
import {
  TransactionItem,
  TransactionType,
  SavingGoalItem,
  BudgetLimitItem,
  FinancialPlanItem,
  BudgetAlertNotification,
  PlanPriority,
  PlanStatus,
} from './types/finance';
import {
  formatIDR,
  formatCompactIDR,
  formatDateID,
  formatMonthLabel,
  AVAILABLE_MONTHS,
  INITIAL_TRANSACTIONS,
  INITIAL_SAVINGS,
  INITIAL_BUDGETS,
  INITIAL_PLANS,
} from './utils/formatters';
import {
  deriveVaultKey,
  computeKeyFingerprint,
  encryptPayload,
  decryptPayload,
} from './utils/crypto';
import { ChartsSection } from './components/ChartsSection';
import { EncryptionVaultModal } from './components/EncryptionVaultModal';
import { BudgetNotificationDrawer } from './components/BudgetNotificationDrawer';
import { TransactionModal } from './components/TransactionModal';
import { SavingsAndPlanningSection } from './components/SavingsAndPlanningSection';
import { AuthModal, AuthModalTab } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { UserProfileSection } from './components/UserProfileSection';

type ActiveTab = 'overview' | 'transactions' | 'savings' | 'planning' | 'profile';

const BRAND_LOGO_SRC = '/assets/aistudio/Gemini_Generated_Image_1refih1refih1ref_88cba733.jpeg';

const LOCAL_STORAGE_KEYS = {
  THEME: 'kasavault_theme_v1',
  PASSPHRASE: 'kasavault_passphrase_v1',
  TXS: 'kasavault_clean_txs_v2',
  SAVINGS: 'kasavault_clean_savings_v2',
  BUDGETS: 'kasavault_clean_budgets_v2',
  PLANS: 'kasavault_clean_plans_v2',
};

function generateSafeId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${Date.now()}_${rand}`;
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const [logoImgFailed, setLogoImgFailed] = useState<boolean>(false);
  const [transparentLogos, setTransparentLogos] = useState<{
    lightFull: string;
    darkFull: string;
    iconOnly: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) return;

        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = w;
        srcCanvas.height = h;
        const ctx = srcCanvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        let minX = w;
        let minY = h;
        let maxX = 0;
        let maxY = 0;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            if (r < 242 || g < 242 || b < 242) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (minX >= maxX || minY >= maxY) {
          minX = 0;
          minY = 0;
          maxX = w - 1;
          maxY = h - 1;
        } else {
          const pad = 8;
          minX = Math.max(0, minX - pad);
          minY = Math.max(0, minY - pad);
          maxX = Math.min(w - 1, maxX + pad);
          maxY = Math.min(h - 1, maxY + pad);
        }

        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;

        const lightCanvas = document.createElement('canvas');
        lightCanvas.width = cropW;
        lightCanvas.height = cropH;
        const lightCtx = lightCanvas.getContext('2d');

        const darkCanvas = document.createElement('canvas');
        darkCanvas.width = cropW;
        darkCanvas.height = cropH;
        const darkCtx = darkCanvas.getContext('2d');

        if (!lightCtx || !darkCtx) return;

        const lightData = lightCtx.createImageData(cropW, cropH);
        const darkData = darkCtx.createImageData(cropW, cropH);

        for (let cy = 0; cy < cropH; cy++) {
          for (let cx = 0; cx < cropW; cx++) {
            const srcIdx = ((minY + cy) * w + (minX + cx)) * 4;
            const dstIdx = (cy * cropW + cx) * 4;

            const r = data[srcIdx];
            const g = data[srcIdx + 1];
            const b = data[srcIdx + 2];

            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const whiteness = (r + g + b) / 3;
            const isNearNeutralWhite = maxChannel - minChannel < 22 && whiteness > 218;

            let alpha = 255;
            if (whiteness >= 246 && maxChannel - minChannel < 16) {
              alpha = 0;
            } else if (isNearNeutralWhite) {
              alpha = Math.round(Math.max(0, Math.min(255, ((246 - whiteness) / 28) * 255)));
            }

            // Light theme: preserve original colors with white background removed
            lightData.data[dstIdx] = r;
            lightData.data[dstIdx + 1] = g;
            lightData.data[dstIdx + 2] = b;
            lightData.data[dstIdx + 3] = alpha;

            // Dark theme: keep lime-green vibrant, lift dark navy text/icon to crisp white
            const isGreenish = g > r + 18 && g > b + 12;
            if (alpha > 0 && !isGreenish && whiteness < 160) {
              darkData.data[dstIdx] = 241;
              darkData.data[dstIdx + 1] = 245;
              darkData.data[dstIdx + 2] = 249;
              darkData.data[dstIdx + 3] = alpha;
            } else {
              darkData.data[dstIdx] = r;
              darkData.data[dstIdx + 1] = g;
              darkData.data[dstIdx + 2] = b;
              darkData.data[dstIdx + 3] = alpha;
            }
          }
        }

        lightCtx.putImageData(lightData, 0, 0);
        darkCtx.putImageData(darkData, 0, 0);

        // Extract left wallet+leaf emblem icon (approx left 24% of cropped lockup)
        const iconW = Math.min(cropW, Math.round(cropH * 0.95));
        const iconCanvas = document.createElement('canvas');
        iconCanvas.width = iconW;
        iconCanvas.height = cropH;
        const iconCtx = iconCanvas.getContext('2d');
        if (iconCtx) {
          iconCtx.drawImage(lightCanvas, 0, 0, iconW, cropH, 0, 0, iconW, cropH);
        }

        if (active) {
          setTransparentLogos({
            lightFull: lightCanvas.toDataURL('image/png'),
            darkFull: darkCanvas.toDataURL('image/png'),
            iconOnly: iconCtx ? iconCanvas.toDataURL('image/png') : lightCanvas.toDataURL('image/png'),
          });
        }
      } catch {
        // Fallback to raw image with CSS blend mode if canvas fails
      }
    };
    img.src = BRAND_LOGO_SRC;
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    document.body.classList.remove('dark');
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, 'light');
  }, [darkMode]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [activeMonth, setActiveMonth] = useState<string>('2026-11');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const [passphrase, setPassphrase] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.PASSPHRASE) || 'kasavault-default-key-2026';
  });
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [keyFingerprint, setKeyFingerprint] = useState<string>('MEMUAT...');
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(false);

  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [txModalDefaultType, setTxModalDefaultType] = useState<TransactionType>('expense');
  const [editingTx, setEditingTx] = useState<TransactionItem | null>(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTab>('login');
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);

  const isCloudVerifiedUser = Boolean(currentUser && currentUser.emailVerified);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    // Clear legacy sample storage keys so user starts 100% clean
    localStorage.removeItem('kasavault_local_txs_v1');
    localStorage.removeItem('kasavault_local_savings_v1');
    localStorage.removeItem('kasavault_local_budgets_v1');
    localStorage.removeItem('kasavault_local_plans_v1');
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TXS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [savings, setSavings] = useState<SavingGoalItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SAVINGS;
      }
    }
    return INITIAL_SAVINGS;
  });

  const [budgets, setBudgets] = useState<BudgetLimitItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BUDGETS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_BUDGETS;
      }
    }
    return INITIAL_BUDGETS;
  });

  const [plans, setPlans] = useState<FinancialPlanItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PLANS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PLANS;
      }
    }
    return INITIAL_PLANS;
  });

  useEffect(() => {
    let mounted = true;
    const contextId = currentUser?.uid || 'local_vault_user';
    async function initCrypto() {
      const derived = await deriveVaultKey(passphrase, contextId);
      const fp = await computeKeyFingerprint(passphrase, contextId);
      if (!mounted) return;
      setCryptoKey(derived);
      setKeyFingerprint(fp);
    }
    initCrypto();
    return () => {
      mounted = false;
    };
  }, [passphrase, currentUser?.uid]);

  useEffect(() => {
    if (!isCloudVerifiedUser) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TXS, JSON.stringify(transactions));
    }
  }, [transactions, isCloudVerifiedUser]);

  useEffect(() => {
    if (!isCloudVerifiedUser) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SAVINGS, JSON.stringify(savings));
    }
  }, [savings, isCloudVerifiedUser]);

  useEffect(() => {
    if (!isCloudVerifiedUser) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    }
  }, [budgets, isCloudVerifiedUser]);

  useEffect(() => {
    if (!isCloudVerifiedUser) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PLANS, JSON.stringify(plans));
    }
  }, [plans, isCloudVerifiedUser]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
      if (user) {
        setShowLandingPage(false);
      }
    });
    return () => unsub();
  }, []);

  const syncDatasetToCloud = useCallback(
    async (user: User, key: CryptoKey) => {
      if (!user.emailVerified) {
        setIsAuthModalOpen(true);
        return;
      }
      setIsSyncingCloud(true);
      const uid = user.uid;
      try {
        for (const tx of transactions) {
          const docId = tx.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
          const enc = await encryptPayload(
            { title: tx.title, notes: tx.notes || '', amount: tx.amount },
            key
          );
          const path = `users/${uid}/transactions`;
          try {
            await setDoc(doc(db, path, docId), {
              userId: uid,
              type: tx.type,
              category: tx.category.slice(0, 64),
              amount: Math.max(0, Math.round(tx.amount)),
              date: tx.date,
              monthKey: tx.monthKey,
              account: tx.account.slice(0, 64),
              title: tx.title.slice(0, 160),
              encryptedPayload: enc.slice(0, 4096),
              isEncrypted: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, path);
          }
        }

        for (const sav of savings) {
          const docId = sav.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
          const enc = await encryptPayload(
            { name: sav.name, notes: sav.notes || '' },
            key
          );
          const path = `users/${uid}/savings`;
          try {
            await setDoc(doc(db, path, docId), {
              userId: uid,
              name: sav.name.slice(0, 120),
              category: sav.category.slice(0, 64),
              targetAmount: Math.max(0, Math.round(sav.targetAmount)),
              currentAmount: Math.max(0, Math.round(sav.currentAmount)),
              monthlyContribution: Math.max(0, Math.round(sav.monthlyContribution)),
              targetDate: sav.targetDate,
              encryptedPayload: enc.slice(0, 4096),
              isEncrypted: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, path);
          }
        }

        for (const bgt of budgets) {
          const docId = bgt.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
          const enc = await encryptPayload({ category: bgt.category }, key);
          const path = `users/${uid}/budgets`;
          try {
            await setDoc(doc(db, path, docId), {
              userId: uid,
              category: bgt.category.slice(0, 64),
              monthKey: bgt.monthKey,
              limitAmount: Math.max(0, Math.round(bgt.limitAmount)),
              alertThreshold: Math.min(100, Math.max(50, Math.round(bgt.alertThreshold))),
              notifyEnabled: Boolean(bgt.notifyEnabled),
              encryptedPayload: enc.slice(0, 4096),
              isEncrypted: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, path);
          }
        }

        for (const pln of plans) {
          const docId = pln.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
          const enc = await encryptPayload(
            { title: pln.title, notes: pln.notes || '' },
            key
          );
          const path = `users/${uid}/plans`;
          try {
            await setDoc(doc(db, path, docId), {
              userId: uid,
              title: pln.title.slice(0, 160),
              category: pln.category.slice(0, 64),
              estimatedCost: Math.max(0, Math.round(pln.estimatedCost)),
              allocatedAmount: Math.max(0, Math.round(pln.allocatedAmount)),
              targetMonth: pln.targetMonth,
              priority: pln.priority,
              status: pln.status,
              encryptedPayload: enc.slice(0, 4096),
              isEncrypted: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, path);
          }
        }
      } finally {
        setIsSyncingCloud(false);
      }
    },
    [transactions, savings, budgets, plans]
  );

  useEffect(() => {
    if (!isAuthReady || !currentUser || !currentUser.emailVerified || !cryptoKey) return;
    const uid = currentUser.uid;

    const txPath = `users/${uid}/transactions`;
    const unsubTx = onSnapshot(
      collection(db, txPath),
      async (snap) => {
        if (snap.empty) {
          setTransactions([]);
          return;
        }
        const items: TransactionItem[] = await Promise.all(
          snap.docs.map(async (d) => {
            const raw = d.data();
            const dec = await decryptPayload<{ title?: string; notes?: string }>(
              raw.encryptedPayload,
              cryptoKey
            );
            return {
              id: d.id,
              userId: raw.userId,
              type: raw.type,
              category: raw.category,
              amount: Number(raw.amount) || 0,
              date: raw.date,
              monthKey: raw.monthKey,
              account: raw.account,
              title: dec?.title || raw.title,
              notes: dec?.notes || '',
              encryptedPayload: raw.encryptedPayload,
              isEncrypted: Boolean(raw.isEncrypted),
              createdAt: raw.createdAt,
              updatedAt: raw.updatedAt,
            };
          })
        );
        items.sort((a, b) => b.date.localeCompare(a.date));
        setTransactions(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, txPath)
    );

    const savPath = `users/${uid}/savings`;
    const unsubSav = onSnapshot(
      collection(db, savPath),
      async (snap) => {
        if (snap.empty) {
          setSavings([]);
          return;
        }
        const items: SavingGoalItem[] = await Promise.all(
          snap.docs.map(async (d) => {
            const raw = d.data();
            const dec = await decryptPayload<{ name?: string; notes?: string }>(
              raw.encryptedPayload,
              cryptoKey
            );
            return {
              id: d.id,
              userId: raw.userId,
              name: dec?.name || raw.name,
              category: raw.category,
              targetAmount: Number(raw.targetAmount) || 0,
              currentAmount: Number(raw.currentAmount) || 0,
              monthlyContribution: Number(raw.monthlyContribution) || 0,
              targetDate: raw.targetDate,
              notes: dec?.notes || '',
              encryptedPayload: raw.encryptedPayload,
              isEncrypted: Boolean(raw.isEncrypted),
            };
          })
        );
        setSavings(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, savPath)
    );

    const bgtPath = `users/${uid}/budgets`;
    const unsubBgt = onSnapshot(
      collection(db, bgtPath),
      (snap) => {
        if (snap.empty) {
          setBudgets([]);
          return;
        }
        const items: BudgetLimitItem[] = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            userId: raw.userId,
            category: raw.category,
            monthKey: raw.monthKey,
            limitAmount: Number(raw.limitAmount) || 0,
            alertThreshold: Number(raw.alertThreshold) || 80,
            notifyEnabled: Boolean(raw.notifyEnabled),
            encryptedPayload: raw.encryptedPayload,
            isEncrypted: Boolean(raw.isEncrypted),
          };
        });
        setBudgets(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, bgtPath)
    );

    const plnPath = `users/${uid}/plans`;
    const unsubPln = onSnapshot(
      collection(db, plnPath),
      async (snap) => {
        if (snap.empty) {
          setPlans([]);
          return;
        }
        const items: FinancialPlanItem[] = await Promise.all(
          snap.docs.map(async (d) => {
            const raw = d.data();
            const dec = await decryptPayload<{ title?: string; notes?: string }>(
              raw.encryptedPayload,
              cryptoKey
            );
            return {
              id: d.id,
              userId: raw.userId,
              title: dec?.title || raw.title,
              category: raw.category,
              estimatedCost: Number(raw.estimatedCost) || 0,
              allocatedAmount: Number(raw.allocatedAmount) || 0,
              targetMonth: raw.targetMonth,
              priority: raw.priority,
              status: raw.status,
              notes: dec?.notes || '',
              encryptedPayload: raw.encryptedPayload,
              isEncrypted: Boolean(raw.isEncrypted),
            };
          })
        );
        setPlans(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, plnPath)
    );

    return () => {
      unsubTx();
      unsubSav();
      unsubBgt();
      unsubPln();
    };
  }, [isAuthReady, currentUser, isCloudVerifiedUser, cryptoKey]);

  const handleClearAllData = async () => {
    if (currentUser && currentUser.emailVerified) {
      const uid = currentUser.uid;
      for (const t of transactions) {
        const path = `users/${uid}/transactions`;
        try {
          await deleteDoc(doc(db, path, t.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      }
      for (const s of savings) {
        const path = `users/${uid}/savings`;
        try {
          await deleteDoc(doc(db, path, s.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      }
      for (const b of budgets) {
        const path = `users/${uid}/budgets`;
        try {
          await deleteDoc(doc(db, path, b.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      }
      for (const p of plans) {
        const path = `users/${uid}/plans`;
        try {
          await deleteDoc(doc(db, path, p.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      }
    }
    setTransactions([]);
    setSavings([]);
    setBudgets([]);
    setPlans([]);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TXS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SAVINGS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PLANS);
    setConfirmReset(false);
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Gagal masuk dengan Google.'
      );
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setShowLandingPage(true);
  };

  const handleToggleLock = (inputPass?: string): boolean => {
    if (!isVaultLocked) {
      setIsVaultLocked(true);
      return true;
    }
    if (inputPass === passphrase) {
      setIsVaultLocked(false);
      return true;
    }
    return false;
  };

  const handleUpdatePassphrase = async (newPass: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PASSPHRASE, newPass);
    setPassphrase(newPass);
    const contextId = currentUser?.uid || 'local_vault_user';
    const newKey = await deriveVaultKey(newPass, contextId);
    setCryptoKey(newKey);
    if (currentUser && currentUser.emailVerified) {
      await syncDatasetToCloud(currentUser, newKey);
    }
  };

  const handleSaveTransaction = async (data: {
    id?: string;
    type: TransactionType;
    category: string;
    amount: number;
    date: string;
    account: string;
    title: string;
    notes: string;
  }) => {
    const monthKey = data.date.slice(0, 7);
    const docId = data.id || generateSafeId('tx');
    const enc = cryptoKey
      ? await encryptPayload(
          { title: data.title, notes: data.notes, amount: data.amount },
          cryptoKey
        )
      : 'v1:unencrypted:local';

    if (currentUser && currentUser.emailVerified) {
      const uid = currentUser.uid;
      const path = `users/${uid}/transactions`;
      try {
        if (data.id) {
          await updateDoc(doc(db, path, docId), {
            type: data.type,
            category: data.category.slice(0, 64),
            amount: Math.round(data.amount),
            date: data.date,
            monthKey,
            account: data.account.slice(0, 64),
            title: data.title.slice(0, 160),
            encryptedPayload: enc.slice(0, 4096),
            isEncrypted: true,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, path, docId), {
            userId: uid,
            type: data.type,
            category: data.category.slice(0, 64),
            amount: Math.round(data.amount),
            date: data.date,
            monthKey,
            account: data.account.slice(0, 64),
            title: data.title.slice(0, 160),
            encryptedPayload: enc.slice(0, 4096),
            isEncrypted: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const newItem: TransactionItem = {
        id: docId,
        userId: currentUser?.uid || 'local_user',
        type: data.type,
        category: data.category,
        amount: data.amount,
        date: data.date,
        monthKey,
        account: data.account,
        title: data.title,
        notes: data.notes,
        encryptedPayload: enc,
        isEncrypted: true,
      };
      setTransactions((prev) => {
        const exists = prev.some((t) => t.id === docId);
        const next = exists
          ? prev.map((t) => (t.id === docId ? newItem : t))
          : [newItem, ...prev];
        return next.sort((a, b) => b.date.localeCompare(a.date));
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (currentUser && currentUser.emailVerified) {
      const path = `users/${currentUser.uid}/transactions`;
      try {
        await deleteDoc(doc(db, path, id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleSaveSavingGoal = async (data: {
    id?: string;
    name: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    targetDate: string;
    notes?: string;
  }) => {
    const docId = data.id || generateSafeId('sav');
    const enc = cryptoKey
      ? await encryptPayload({ name: data.name, notes: data.notes || '' }, cryptoKey)
      : 'v1:unencrypted:local';

    if (currentUser && currentUser.emailVerified) {
      const uid = currentUser.uid;
      const path = `users/${uid}/savings`;
      try {
        await setDoc(doc(db, path, docId), {
          userId: uid,
          name: data.name.slice(0, 120),
          category: data.category.slice(0, 64),
          targetAmount: Math.round(data.targetAmount),
          currentAmount: Math.round(data.currentAmount),
          monthlyContribution: Math.round(data.monthlyContribution),
          targetDate: data.targetDate,
          encryptedPayload: enc.slice(0, 4096),
          isEncrypted: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      setSavings((prev) => [
        ...prev,
        {
          id: docId,
          userId: currentUser?.uid || 'local_user',
          name: data.name,
          category: data.category,
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount,
          monthlyContribution: data.monthlyContribution,
          targetDate: data.targetDate,
          notes: data.notes,
          encryptedPayload: enc,
          isEncrypted: true,
        },
      ]);
    }
  };

  const handleAdjustSavingBalance = async (goal: SavingGoalItem, delta: number) => {
    const nextAmount = Math.max(0, Math.round(goal.currentAmount + delta));
    const enc = cryptoKey
      ? await encryptPayload({ name: goal.name, currentAmount: nextAmount }, cryptoKey)
      : goal.encryptedPayload;

    if (currentUser && currentUser.emailVerified) {
      const path = `users/${currentUser.uid}/savings`;
      try {
        await updateDoc(doc(db, path, goal.id), {
          currentAmount: nextAmount,
          monthlyContribution: goal.monthlyContribution,
          encryptedPayload: enc.slice(0, 4096),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setSavings((prev) =>
        prev.map((s) =>
          s.id === goal.id
            ? { ...s, currentAmount: nextAmount, encryptedPayload: enc }
            : s
        )
      );
    }
  };

  const handleDeleteSavingGoal = async (id: string) => {
    if (currentUser && currentUser.emailVerified) {
      const path = `users/${currentUser.uid}/savings`;
      try {
        await deleteDoc(doc(db, path, id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setSavings((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSaveBudgetLimit = async (data: {
    id?: string;
    category: string;
    monthKey: string;
    limitAmount: number;
    alertThreshold: number;
    notifyEnabled: boolean;
  }) => {
    const docId = data.id || generateSafeId('bgt');
    const enc = cryptoKey
      ? await encryptPayload({ category: data.category, limitAmount: data.limitAmount }, cryptoKey)
      : 'v1:unencrypted:local';

    if (currentUser && currentUser.emailVerified) {
      const uid = currentUser.uid;
      const path = `users/${uid}/budgets`;
      try {
        if (data.id) {
          await updateDoc(doc(db, path, docId), {
            category: data.category.slice(0, 64),
            monthKey: data.monthKey,
            limitAmount: Math.round(data.limitAmount),
            alertThreshold: Math.round(data.alertThreshold),
            notifyEnabled: data.notifyEnabled,
            encryptedPayload: enc.slice(0, 4096),
            isEncrypted: true,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, path, docId), {
            userId: uid,
            category: data.category.slice(0, 64),
            monthKey: data.monthKey,
            limitAmount: Math.round(data.limitAmount),
            alertThreshold: Math.round(data.alertThreshold),
            notifyEnabled: data.notifyEnabled,
            encryptedPayload: enc.slice(0, 4096),
            isEncrypted: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const newItem: BudgetLimitItem = {
        id: docId,
        userId: currentUser?.uid || 'local_user',
        category: data.category,
        monthKey: data.monthKey,
        limitAmount: data.limitAmount,
        alertThreshold: data.alertThreshold,
        notifyEnabled: data.notifyEnabled,
        encryptedPayload: enc,
        isEncrypted: true,
      };
      setBudgets((prev) => {
        const exists = prev.some((b) => b.id === docId);
        return exists
          ? prev.map((b) => (b.id === docId ? newItem : b))
          : [...prev, newItem];
      });
    }
  };

  const handleDeleteBudgetLimit = async (id: string) => {
    if (currentUser && currentUser.emailVerified) {
      const path = `users/${currentUser.uid}/budgets`;
      try {
        await deleteDoc(doc(db, path, id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleSaveFinancialPlan = async (data: {
    id?: string;
    title: string;
    category: string;
    estimatedCost: number;
    allocatedAmount: number;
    targetMonth: string;
    priority: PlanPriority;
    status: PlanStatus;
    notes?: string;
  }) => {
    const docId = data.id || generateSafeId('pln');
    const enc = cryptoKey
      ? await encryptPayload({ title: data.title, notes: data.notes || '' }, cryptoKey)
      : 'v1:unencrypted:local';

    if (currentUser && currentUser.emailVerified) {
      const uid = currentUser.uid;
      const path = `users/${uid}/plans`;
      try {
        if (data.id) {
          await updateDoc(doc(db, path, docId), {
            title: data.title.slice(0, 160),
            category: data.category.slice(0, 64),
            estimatedCost: Math.round(data.estimatedCost),
            allocatedAmount: Math.round(data.allocatedAmount),
            targetMonth: data.targetMonth,
            priority: data.priority,
            status: data.status,
            encryptedPayload: enc.slice(0, 4096),
            isEncrypted: true,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, path, docId), {
            userId: uid,
            title: data.title.slice(0, 160),
            category: data.category.slice(0, 64),
            estimatedCost: Math.round(data.estimatedCost),
            allocatedAmount: Math.round(data.allocatedAmount),
            targetMonth: data.targetMonth,
            priority: data.priority,
            status: data.status,
            encryptedPayload: enc.slice(0, 4096),
            isEncrypted: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const newItem: FinancialPlanItem = {
        id: docId,
        userId: currentUser?.uid || 'local_user',
        title: data.title,
        category: data.category,
        estimatedCost: data.estimatedCost,
        allocatedAmount: data.allocatedAmount,
        targetMonth: data.targetMonth,
        priority: data.priority,
        status: data.status,
        notes: data.notes,
        encryptedPayload: enc,
        isEncrypted: true,
      };
      setPlans((prev) => {
        const exists = prev.some((p) => p.id === docId);
        return exists
          ? prev.map((p) => (p.id === docId ? newItem : p))
          : [newItem, ...prev];
      });
    }
  };

  const handleExecutePlanToExpense = async (plan: FinancialPlanItem) => {
    if (plan.status === 'completed') return;
    await handleSaveFinancialPlan({
      id: plan.id,
      title: plan.title,
      category: plan.category,
      estimatedCost: plan.estimatedCost,
      allocatedAmount: plan.estimatedCost,
      targetMonth: plan.targetMonth,
      priority: plan.priority,
      status: 'completed',
      notes: plan.notes,
    });
    await handleSaveTransaction({
      type: 'expense',
      category: plan.category,
      amount: plan.estimatedCost,
      date: `${activeMonth}-05`,
      account: 'BCA Prioritas / Utama',
      title: `${plan.title}`.slice(0, 160),
      notes: 'Realisasi dari Perencanaan Keuangan',
    });
  };

  const handleDeleteFinancialPlan = async (id: string) => {
    if (currentUser && currentUser.emailVerified) {
      const path = `users/${currentUser.uid}/plans`;
      try {
        await deleteDoc(doc(db, path, id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setPlans((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const monthTransactions = useMemo(
    () => transactions.filter((t) => t.monthKey === activeMonth),
    [transactions, activeMonth]
  );

  const totalIncomeMonth = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0),
    [monthTransactions]
  );

  const totalExpenseMonth = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0),
    [monthTransactions]
  );

  const netCashflowMonth = totalIncomeMonth - totalExpenseMonth;

  const totalSavingsAccumulated = useMemo(
    () => savings.reduce((s, g) => s + g.currentAmount, 0),
    [savings]
  );

  const totalPlannedActiveMonth = useMemo(
    () =>
      plans
        .filter((p) => p.targetMonth === activeMonth && p.status !== 'completed')
        .reduce((s, p) => s + p.estimatedCost, 0),
    [plans, activeMonth]
  );

  const totalNetWorth = useMemo(() => {
    const allTimeSurplus = transactions.reduce(
      (acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount),
      0
    );
    return totalSavingsAccumulated + Math.max(0, allTimeSurplus);
  }, [transactions, totalSavingsAccumulated]);

  const budgetAlerts: BudgetAlertNotification[] = useMemo(() => {
    const activeBudgets = budgets.filter(
      (b) => b.monthKey === activeMonth && b.notifyEnabled
    );
    const remainingDaysInMonth = 25;
    const list: BudgetAlertNotification[] = [];

    activeBudgets.forEach((b) => {
      const spent = monthTransactions
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((s, t) => s + t.amount, 0);
      if (b.limitAmount <= 0) return;
      const pct = Math.round((spent / b.limitAmount) * 100);
      const remainingBudget = Math.max(0, b.limitAmount - spent);
      const dailySafe = Math.round(remainingBudget / remainingDaysInMonth);

      if (pct >= 100) {
        const overrun = spent - b.limitAmount;
        list.push({
          id: `alert_${b.id}`,
          category: b.category,
          monthKey: activeMonth,
          spentAmount: spent,
          limitAmount: b.limitAmount,
          percentage: pct,
          threshold: b.alertThreshold,
          severity: 'critical',
          message: `Kategori ${b.category} melampaui batas anggaran sebesar ${formatIDR(
            overrun,
            isVaultLocked
          )} (${pct}%).`,
          remainingDailySafe: 0,
        });
      } else if (pct >= b.alertThreshold) {
        list.push({
          id: `alert_${b.id}`,
          category: b.category,
          monthKey: activeMonth,
          spentAmount: spent,
          limitAmount: b.limitAmount,
          percentage: pct,
          threshold: b.alertThreshold,
          severity: 'warning',
          message: `${b.category} sudah mencapai ${pct}% anggaran. Batas aman: ${formatIDR(
            dailySafe,
            isVaultLocked
          )}/hari.`,
          remainingDailySafe: dailySafe,
        });
      }
    });

    return list.sort((a, b) => b.percentage - a.percentage);
  }, [budgets, monthTransactions, activeMonth, isVaultLocked]);

  const duePlansThisMonth = useMemo(
    () =>
      plans.filter(
        (p) => p.targetMonth === activeMonth && p.status !== 'completed'
      ),
    [plans, activeMonth]
  );

  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter((tx) => {
      if (txTypeFilter !== 'all' && tx.type !== txTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          tx.title.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          tx.account.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [monthTransactions, txTypeFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Judul', 'Rekening', 'Nominal_IDR'];
    const rows = monthTransactions.map((t) => [
      t.date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${t.category}"`,
      `"${isVaultLocked ? 'TERKUNCI' : t.title.replace(/"/g, '""')}"`,
      `"${t.account}"`,
      isVaultLocked ? '0' : String(t.amount),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Keuanganku_${activeMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showLandingPage) {
    return (
      <>
        <LandingPage
          currentUser={currentUser}
          darkMode={darkMode}
          onToggleDarkMode={setDarkMode}
          onOpenLogin={() => {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
          }}
          onOpenRegister={() => {
            setAuthModalTab('register');
            setIsAuthModalOpen(true);
          }}
          onEnterDashboard={() => setShowLandingPage(false)}
          logoIconUrl={transparentLogos?.iconOnly}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          initialTab={authModalTab}
          currentUser={currentUser}
          onClose={() => setIsAuthModalOpen(false)}
          onUserUpdated={(user) => setCurrentUser(user)}
          onAuthSuccess={() => setShowLandingPage(false)}
          brandLogoUrl={transparentLogos?.iconOnly}
        />
      </>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      {/* STATIC HARDWARE-ACCELERATED CUSTOM PAGE BACKGROUND (NO FLICKER) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-slate-100 dark:bg-slate-950 app-custom-bg"
      >
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/78" />
      </div>

      {/* MODERN RESPONSIVE STICKY TOP BAR */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl xl:max-w-[1400px] mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 lg:px-10 py-3.5 sm:py-4">
          {/* Zone 1: Brand Wordmark with Transparent Keuanganku Emblem */}
          <a
            href="#beranda"
            onClick={(e) => {
              e.preventDefault();
              setShowLandingPage(true);
            }}
            title="Kembali ke Halaman Utama (Landing Page)"
            className="inline-flex items-center gap-2.5 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            {transparentLogos?.iconOnly && !logoImgFailed ? (
              <img
                src={transparentLogos.iconOnly}
                alt=""
                aria-hidden="true"
                className="w-9 h-9 object-contain shrink-0"
              />
            ) : (
              <svg
                viewBox="0 0 36 36"
                fill="none"
                aria-hidden="true"
                className="w-8 h-8 shrink-0"
              >
                <rect x="6" y="10" width="24" height="20" rx="4" className="fill-blue-950 dark:fill-slate-800" />
                <rect x="9" y="20" width="4" height="10" rx="1" className="fill-blue-800" />
                <rect x="15" y="16" width="4" height="14" rx="1" className="fill-lime-500" />
                <rect x="21" y="12" width="4" height="18" rx="1" className="fill-lime-500" />
              </svg>
            )}
            <span>
              keuangan<span className="text-blue-600 dark:text-sky-400">ku</span>
            </span>
          </a>

          {/* Zone 2: Pill-Style Desktop Navigation (lg and up) */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-sm font-semibold">
            {(
              [
                ['overview', 'Ringkasan'],
                ['transactions', 'Transaksi'],
                ['savings', 'Tabungan'],
                ['planning', 'Planning & Anggaran'],
                ['profile', 'Profil Pengguna'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === key
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action CTA */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setEditingTx(null);
                setTxModalDefaultType('expense');
                setIsTxModalOpen(true);
              }}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Mobile & Tablet 5-Column Navigation Bar in Header (Visible on all screens < lg) */}
        <nav
          aria-label="Menu Navigasi Utama Mobile & Tablet"
          className="grid lg:hidden grid-cols-5 gap-1.5 sm:gap-2 px-3 sm:px-6 pb-3 max-w-7xl mx-auto"
        >
          {(
            [
              ['overview', 'Ringkasan', LayoutDashboard],
              ['transactions', 'Transaksi', ListOrdered],
              ['savings', 'Tabungan', PiggyBank],
              ['planning', 'Planning', CalendarRange],
              ['profile', 'Profil', UserIcon],
            ] as const
          ).map(([key, label, IconComponent]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-center transition-all cursor-pointer truncate ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate max-w-full">{label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* EXPANDED RESPONSIVE WORKSPACE */}
      <main className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Brand Logo (Transparent Background) & Explicit Dark/Light Theme Controls */}
        <section
          aria-label="Identitas Keuanganku dan Pengaturan Tema"
          className="rounded-3xl border border-slate-200/80 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg shadow-blue-950/5 px-5 sm:px-8 py-4 sm:py-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Official Uploaded Keuanganku Logo with White Background Removed */}
            <div className="flex items-center">
              {!logoImgFailed ? (
                <img
                  src={
                    transparentLogos
                      ? darkMode
                        ? transparentLogos.darkFull
                        : transparentLogos.lightFull
                      : BRAND_LOGO_SRC
                  }
                  alt="keuanganku — Kelola Keuangan, Gapai Masa Depan"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoImgFailed(true)}
                  className={`h-14 sm:h-16 w-auto object-contain select-none ${
                    !transparentLogos && !darkMode ? 'mix-blend-multiply' : ''
                  }`}
                />
              ) : (
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Keuanganku
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Kelola Keuangan, Gapai Masa Depan
                  </p>
                </div>
              )}
            </div>

            {/* Right: Login / User Profile Quick Trigger */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Login / User Profile Quick Trigger */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`px-3.5 py-2 rounded-xl border transition-all inline-flex items-center gap-2 text-xs sm:text-sm font-bold cursor-pointer ${
                    activeTab === 'profile'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100'
                  }`}
                  title="Buka halaman Profil Pengguna"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  )}
                  <span className="max-w-[150px] truncate">
                    {currentUser.displayName || currentUser.email || 'Profil Saya'}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-xl inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk (Google / GitHub)</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Sub-Header Controls Bar (Responsive on Mobile & Tablet) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab !== 'profile' && (
              <select
                aria-label="Pilih periode bulan"
                value={activeMonth}
                onChange={(e) => setActiveMonth(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-slate-100 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AVAILABLE_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Utility Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 w-full sm:w-auto">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    currentUser.emailVerified && cryptoKey
                      ? syncDatasetToCloud(currentUser, cryptoKey)
                      : setIsAuthModalOpen(true)
                  }
                  disabled={isSyncingCloud}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-bold bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentUser.emailVerified
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                  title={
                    currentUser.emailVerified
                      ? 'Sinkronisasi real-time aktif'
                      : 'Klik untuk verifikasi email & aktifkan Cloud'
                  }
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                  <span>
                    {currentUser.emailVerified ? 'Cloud Aktif' : 'Verifikasi Cloud'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-2.5 text-slate-500 hover:text-rose-600 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs cursor-pointer transition-colors"
                  title="Keluar akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Cloud className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Sinkron Cloud</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsVaultModalOpen(true)}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              title="Pengaturan Privasi Nominal"
            >
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">
                {isVaultLocked ? 'Terkunci' : 'Privasi'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsAlertDrawerOpen(true)}
              className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl border shadow-xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                budgetAlerts.length > 0
                  ? 'text-amber-800 dark:text-amber-300 bg-amber-50/95 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
                  : 'text-slate-700 dark:text-slate-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200/90 dark:border-slate-800'
              }`}
              title="Pengingat Anggaran Bulanan"
            >
              <Bell className="w-4 h-4" />
              <span>{budgetAlerts.length + duePlansThisMonth.length}</span>
            </button>
          </div>
        </div>

        {authError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span>{authError}</span>
            <button
              type="button"
              onClick={() => setAuthError('')}
              className="font-bold underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW (4-Card Summary + Simple Chart + Clean Recent Transactions List) */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Modernized 4-Card Summary Strip (Only on Ringkasan / Awal Website) */}
            <section
              aria-label="Ringkasan Keuangan"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6"
            >
              {/* Featured Hero KPI Card: Total Net Worth */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6 sm:p-7 shadow-xl shadow-blue-600/20 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm font-bold text-blue-100">
                    Total Kekayaan Bersih
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight">
                  {formatCompactIDR(totalNetWorth, isVaultLocked)}
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums font-semibold bg-white/15 backdrop-blur-xs px-3 py-1.5 rounded-xl w-fit text-blue-50">
                  <span>Surplus bulan ini: {formatCompactIDR(netCashflowMonth, isVaultLocked)}</span>
                </div>
              </div>

              {/* KPI Card 2: Monthly Income */}
              <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-200/80 dark:border-emerald-900/50 p-6 sm:p-7 shadow-lg shadow-emerald-950/5 flex flex-col justify-between gap-4 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                    Pemasukan Bulan Ini
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {formatIDR(totalIncomeMonth, isVaultLocked)}
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl w-fit">
                  <span>{monthTransactions.filter((t) => t.type === 'income').length} catatan masuk</span>
                </div>
              </div>

              {/* KPI Card 3: Monthly Expense */}
              <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-rose-200/80 dark:border-rose-900/50 p-6 sm:p-7 shadow-lg shadow-rose-950/5 flex flex-col justify-between gap-4 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                    Pengeluaran Bulan Ini
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200/60 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                    <ArrowDownRight className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-rose-600 dark:text-rose-400 tracking-tight">
                  {formatIDR(totalExpenseMonth, isVaultLocked)}
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50/90 dark:bg-rose-950/60 px-3 py-1.5 rounded-xl w-fit">
                  <span>{monthTransactions.filter((t) => t.type === 'expense').length} catatan keluar</span>
                </div>
              </div>

              {/* KPI Card 4: Savings & Planning */}
              <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-sky-200/80 dark:border-sky-900/50 p-6 sm:p-7 shadow-lg shadow-blue-950/5 flex flex-col justify-between gap-4 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                    Tabungan & Target Planning
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-blue-600 dark:text-sky-400 tracking-tight">
                  {formatCompactIDR(totalSavingsAccumulated, isVaultLocked)}
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums font-semibold text-blue-700 dark:text-sky-300 bg-blue-50/90 dark:bg-blue-950/60 px-3 py-1.5 rounded-xl w-fit">
                  <span>Planning bln ini: {formatCompactIDR(totalPlannedActiveMonth, isVaultLocked)}</span>
                </div>
              </div>
            </section>

            {/* Simple One-Line Budget Reminder Banner (only if triggered) */}
            {budgetAlerts.length > 0 && (
              <div className="bg-amber-50/90 dark:bg-amber-950/40 backdrop-blur-md border border-amber-200/80 dark:border-amber-800/70 rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm shadow-xs">
                <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-medium">{budgetAlerts[0].message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAlertDrawerOpen(true)}
                  className="font-bold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer whitespace-nowrap"
                >
                  Lihat {budgetAlerts.length} Pengingat &rarr;
                </button>
              </div>
            )}
            <ChartsSection
              transactions={transactions}
              budgets={budgets}
              savings={savings}
              activeMonth={activeMonth}
              isVaultLocked={isVaultLocked}
            />

            {/* Modernized Recent Transactions Card */}
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-lg shadow-blue-950/5 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    Transaksi Terbaru
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Aktivitas pemasukan dan pengeluaran terakhir pada periode ini
                  </p>
                </div>
                {monthTransactions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('transactions')}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                  >
                    Lihat Semua ({monthTransactions.length})
                  </button>
                )}
              </div>

              {monthTransactions.length === 0 ? (
                <div className="py-12 px-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-4">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Data masih kosong (Rp 0). Belum ada catatan pemasukan atau pengeluaran pada bulan ini.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTx(null);
                        setTxModalDefaultType('income');
                        setIsTxModalOpen(true);
                      }}
                      className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm cursor-pointer transition-colors"
                    >
                      + Catat Pemasukan Pertama
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTx(null);
                        setTxModalDefaultType('expense');
                        setIsTxModalOpen(true);
                      }}
                      className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-sm cursor-pointer transition-colors"
                    >
                      + Catat Pengeluaran
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {monthTransactions.slice(0, 6).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-100/80 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                            {isVaultLocked ? '••••••••••••••••' : tx.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {formatDateID(tx.date)} · {tx.category} · {tx.account}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`font-mono tabular-nums text-sm sm:text-base font-extrabold whitespace-nowrap ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatIDR(tx.amount, isVaultLocked)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MODERN TRANSACTIONS LIST */}
        {activeTab === 'transactions' && (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-lg shadow-blue-950/5 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Daftar Transaksi ({formatMonthLabel(activeMonth)})
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Kelola seluruh catatan pemasukan dan pengeluaran bulanan
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {monthTransactions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Unduh CSV
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditingTx(null);
                    setTxModalDefaultType('income');
                    setIsTxModalOpen(true);
                  }}
                  className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTx(null);
                    setTxModalDefaultType('expense');
                    setIsTxModalOpen(true);
                  }}
                  className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-sm inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Pengeluaran
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul, kategori, atau rekening transaksi..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {(
                  [
                    ['all', 'Semua'],
                    ['income', 'Pemasukan'],
                    ['expense', 'Pengeluaran'],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTxTypeFilter(val)}
                    className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg cursor-pointer transition-colors ${
                      txTypeFilter === val
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="py-14 px-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs sm:text-sm text-slate-500">
                Belum ada transaksi tercatat pada periode ini.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          tx.type === 'income'
                            ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-100/80 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                          {isVaultLocked ? '••••••••••••••••' : tx.title}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                          <span>{formatDateID(tx.date)}</span>
                          <span>·</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                            {tx.category}
                          </span>
                          <span>·</span>
                          <span>{tx.account}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 ml-auto">
                      <span
                        className={`font-mono tabular-nums text-base sm:text-lg font-extrabold ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatIDR(tx.amount, isVaultLocked)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTx(tx);
                            setIsTxModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVINGS */}
        {activeTab === 'savings' && (
          <SavingsAndPlanningSection
            mode="savings"
            savings={savings}
            budgets={budgets}
            plans={plans}
            transactions={transactions}
            activeMonth={activeMonth}
            isVaultLocked={isVaultLocked}
            onSaveSavingGoal={handleSaveSavingGoal}
            onAdjustSavingBalance={handleAdjustSavingBalance}
            onDeleteSavingGoal={handleDeleteSavingGoal}
            onSaveBudgetLimit={handleSaveBudgetLimit}
            onDeleteBudgetLimit={handleDeleteBudgetLimit}
            onSaveFinancialPlan={handleSaveFinancialPlan}
            onExecutePlanToExpense={handleExecutePlanToExpense}
            onDeleteFinancialPlan={handleDeleteFinancialPlan}
          />
        )}

        {/* TAB 4: PLANNING & BUDGETS */}
        {activeTab === 'planning' && (
          <SavingsAndPlanningSection
            mode="planning"
            savings={savings}
            budgets={budgets}
            plans={plans}
            transactions={transactions}
            activeMonth={activeMonth}
            isVaultLocked={isVaultLocked}
            onSaveSavingGoal={handleSaveSavingGoal}
            onAdjustSavingBalance={handleAdjustSavingBalance}
            onDeleteSavingGoal={handleDeleteSavingGoal}
            onSaveBudgetLimit={handleSaveBudgetLimit}
            onDeleteBudgetLimit={handleDeleteBudgetLimit}
            onSaveFinancialPlan={handleSaveFinancialPlan}
            onExecutePlanToExpense={handleExecutePlanToExpense}
            onDeleteFinancialPlan={handleDeleteFinancialPlan}
          />
        )}

        {/* TAB 5: USER PROFILE */}
        {activeTab === 'profile' && (
          <UserProfileSection
            currentUser={currentUser}
            isVaultLocked={isVaultLocked}
            isSyncingCloud={isSyncingCloud}
            totalNetWorth={totalNetWorth}
            totalSavingsAccumulated={totalSavingsAccumulated}
            transactionsCount={transactions.length}
            savingsCount={savings.length}
            budgetsCount={budgets.length}
            plansCount={plans.length}
            onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
            onSyncCloud={() =>
              currentUser && cryptoKey && syncDatasetToCloud(currentUser, cryptoKey)
            }
            onOpenVaultModal={() => setIsVaultModalOpen(true)}
            onExportCSV={handleExportCSV}
            onSignOut={handleSignOut}
            onOpenAuthModal={() => {
              setAuthModalTab('login');
              setIsAuthModalOpen(true);
            }}
          />
        )}
      </main>

      <footer className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 border-t border-slate-200/60 dark:border-slate-800/60 text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <span>Keuanganku · Manajemen Keuangan Pribadi</span>
        {(transactions.length > 0 ||
          savings.length > 0 ||
          budgets.length > 0 ||
          plans.length > 0) && (
          <div className="flex items-center gap-2">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 underline cursor-pointer"
              >
                Kosongkan Semua Data
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-rose-600 dark:text-rose-400">
                  Hapus seluruh data?
                </span>
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md cursor-pointer"
                >
                  Ya, Kosongkan
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 rounded-md cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        )}
      </footer>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        editingItem={editingTx}
        defaultType={txModalDefaultType}
        activeMonth={activeMonth}
      />

      <EncryptionVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        keyFingerprint={keyFingerprint}
        isVaultLocked={isVaultLocked}
        onToggleLock={handleToggleLock}
        onUpdatePassphrase={handleUpdatePassphrase}
        sampleTransaction={transactions[0]}
      />

      <BudgetNotificationDrawer
        isOpen={isAlertDrawerOpen}
        onClose={() => setIsAlertDrawerOpen(false)}
        alerts={budgetAlerts}
        duePlans={duePlansThisMonth}
        activeMonth={activeMonth}
        isVaultLocked={isVaultLocked}
        onNavigateToPlanning={() => setActiveTab('planning')}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        currentUser={currentUser}
        onClose={() => setIsAuthModalOpen(false)}
        onUserUpdated={(user) => setCurrentUser(user)}
        onAuthSuccess={() => setShowLandingPage(false)}
        brandLogoUrl={transparentLogos?.iconOnly}
      />
    </div>
  );
}
