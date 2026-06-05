'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { Transaction, FinancialGoal, CustomCategory } from './types';
import { filterByCurrentMonth } from './utils';
import { supabase } from './supabase';

// ─── Column Name Mapping Helpers ───────────────────────────────────
// PostgreSQL lowercases all unquoted column names.
// These helpers convert between camelCase (app) and lowercase (DB).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbGoalToApp(row: any): FinancialGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: row.targetamount ?? row.targetAmount ?? 0,
    currentAmount: row.currentamount ?? row.currentAmount ?? 0,
    deadline: row.deadline ?? '',
    color: row.color ?? '',
    createdAt: row.createdat ?? row.createdAt ?? '',
    username: row.username ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbCategoryToApp(row: any): CustomCategory {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon ?? '',
    color: row.color ?? '',
    isCustom: row.iscustom ?? row.isCustom ?? true,
    type: row.type,
    isEnabled: row.isenabled ?? row.isEnabled ?? true,
    username: row.username ?? '',
    createdAt: row.createdat ?? row.createdAt ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbTxToApp(row: any): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    category: row.category,
    description: row.description ?? '',
    date: row.date,
    createdAt: row.createdat ?? row.createdAt ?? '',
    username: row.username ?? '',
  };
}

function goalToDb(g: Partial<FinancialGoal>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (g.name !== undefined) row.name = g.name;
  if (g.targetAmount !== undefined) row.targetamount = g.targetAmount;
  if (g.currentAmount !== undefined) row.currentamount = g.currentAmount;
  if (g.deadline !== undefined) row.deadline = g.deadline;
  if (g.color !== undefined) row.color = g.color;
  if (g.username !== undefined) row.username = g.username;
  return row;
}

function categoryToDb(c: Partial<CustomCategory>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (c.name !== undefined) row.name = c.name;
  if (c.icon !== undefined) row.icon = c.icon;
  if (c.color !== undefined) row.color = c.color;
  if (c.isCustom !== undefined) row.iscustom = c.isCustom;
  if (c.type !== undefined) row.type = c.type;
  if (c.isEnabled !== undefined) row.isenabled = c.isEnabled;
  if (c.username !== undefined) row.username = c.username;
  return row;
}

function txToDb(t: Partial<Transaction>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (t.type !== undefined) row.type = t.type;
  if (t.amount !== undefined) row.amount = t.amount;
  if (t.category !== undefined) row.category = t.category;
  if (t.description !== undefined) row.description = t.description;
  if (t.date !== undefined) row.date = t.date;
  if (t.username !== undefined) row.username = t.username;
  return row;
}

// ─── Context Shape ─────────────────────────────────────────────────

interface FinanceContextType {
  // Data
  transactions: Transaction[];
  goals: FinancialGoal[];
  customCategories: CustomCategory[];
  isLoaded: boolean;
  currentUser: string | null;

  // Computed
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyIncome: number;
  monthlyExpense: number;

  // Transaction CRUD
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Goal CRUD
  addGoal: (g: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, g: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  addToGoal: (id: string, amount: number) => void;

  // Custom Category CRUD
  addCustomCategory: (c: Omit<CustomCategory, 'id' | 'createdAt'>) => void;
  updateCustomCategory: (id: string, c: Partial<CustomCategory>) => void;
  deleteCustomCategory: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Load from Supabase on mount
  useEffect(() => {
    // Get logged in user from localStorage
    const username = typeof window !== 'undefined' ? localStorage.getItem('moneyflow_username') : null;
    setCurrentUser(username);
    
    if (!username) {
      setIsLoaded(true);
      return;
    }

    const migrateLocalCategories = async () => {
      try {
        const localKey = `moneyflow_custom_categories_${username}`;
        const localFallbackKey = 'moneyflow_custom_categories';
        const localDataStr = localStorage.getItem(localKey) || localStorage.getItem(localFallbackKey);
        
        if (localDataStr) {
          const localCats = JSON.parse(localDataStr);
          if (Array.isArray(localCats) && localCats.length > 0) {
            // Check if there are already records to avoid duplicates
            const { data: existing } = await supabase
              .from('custom_categories')
              .select('id')
              .eq('username', username)
              .limit(1);
              
            if (!existing || existing.length === 0) {
              const rowsToInsert = localCats.map((c: any) => categoryToDb({ 
                ...c, 
                username, 
                isCustom: c.isCustom !== false 
              }));
              await supabase.from('custom_categories').insert(rowsToInsert);
            }
          }
          // Always clear so it doesn't run again
          localStorage.removeItem(localKey);
          localStorage.removeItem(localFallbackKey);
        }
      } catch (e) {
        console.error('Failed to migrate local categories:', e);
      }
    };

    const loadData = async () => {
      await migrateLocalCategories();

      const [txRes, goalsRes, catsRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('username', username).order('date', { ascending: false }),
        supabase.from('goals').select('*').eq('username', username).order('createdat', { ascending: true }),
        supabase.from('custom_categories').select('*').eq('username', username).order('createdat', { ascending: true })
      ]);

      if (txRes.error) console.error('Failed to load transactions:', txRes.error);
      if (goalsRes.error) console.error('Failed to load goals:', goalsRes.error);
      if (catsRes.error) console.error('Failed to load custom categories:', catsRes.error);

      setTransactions((txRes.data || []).map(dbTxToApp));
      setGoals((goalsRes.data || []).map(dbGoalToApp));
      setCustomCategories((catsRes.data || []).map(dbCategoryToApp));
      setIsLoaded(true);
    };

    loadData();
  }, []);

  // ─── Computed Values ───────────────────────────────────────────

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const currentMonthTx = filterByCurrentMonth(transactions);

  const monthlyIncome = currentMonthTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = currentMonthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // ─── Transaction CRUD ──────────────────────────────────────────

  const addTransaction = useCallback(
    async (t: Omit<Transaction, 'id' | 'createdAt'>) => {
      if (!currentUser) return;
      try {
        const dbRow = txToDb({ ...t, username: currentUser });
        const { data, error } = await supabase.from('transactions').insert([dbRow]).select().single();
        if (error) throw error;
        if (data) {
          setTransactions((prev) => [dbTxToApp(data), ...prev]);
        }
      } catch (e) {
        console.error('Failed to add transaction:', e);
      }
    },
    [currentUser]
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Transaction>) => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      try {
        const dbRow = txToDb(updates);
        const { error } = await supabase.from('transactions').update(dbRow).eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Failed to update transaction:', e);
      }
    },
    []
  );

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error('Failed to delete transaction:', e);
    }
  }, []);

  // ─── Goal CRUD ─────────────────────────────────────────────────

  const addGoal = useCallback(
    async (g: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
      if (!currentUser) return;
      try {
        const dbRow = goalToDb({ ...g, username: currentUser });
        const { data, error } = await supabase.from('goals').insert([dbRow]).select().single();
        if (error) throw error;
        if (data) {
          setGoals((prev) => [...prev, dbGoalToApp(data)]);
        }
      } catch (e) {
        console.error('Failed to add goal:', e);
      }
    },
    [currentUser]
  );

  const updateGoal = useCallback(
    async (id: string, updates: Partial<FinancialGoal>) => {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
      );
      try {
        const dbRow = goalToDb(updates);
        const { error } = await supabase.from('goals').update(dbRow).eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Failed to update goal:', e);
      }
    },
    []
  );

  const deleteGoal = useCallback(async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error('Failed to delete goal:', e);
    }
  }, []);

  const addToGoal = useCallback(async (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, currentAmount: newAmount } : g
      )
    );

    try {
      const { error } = await supabase.from('goals').update({ currentamount: newAmount }).eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error('Failed to add to goal:', e);
    }
  }, [goals]);

  // ─── Custom Category CRUD ────────────────────────────────────────

  const addCustomCategory = useCallback(
    async (c: Omit<CustomCategory, 'id' | 'createdAt'>) => {
      if (!currentUser) return;
      try {
        const dbRow = categoryToDb({ ...c, username: currentUser });
        const { data, error } = await supabase.from('custom_categories').insert([dbRow]).select().single();
        if (error) throw error;
        if (data) {
          setCustomCategories((prev) => [...prev, dbCategoryToApp(data)]);
        }
      } catch (e) {
        console.error('Failed to add custom category:', e);
      }
    },
    [currentUser]
  );

  const updateCustomCategory = useCallback(
    async (id: string, updates: Partial<CustomCategory>) => {
      setCustomCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      try {
        const dbRow = categoryToDb(updates);
        const { error } = await supabase.from('custom_categories').update(dbRow).eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Failed to update custom category:', e);
      }
    },
    []
  );

  const deleteCustomCategory = useCallback(async (id: string) => {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      const { error } = await supabase.from('custom_categories').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error('Failed to delete custom category:', e);
    }
  }, []);

  // ─── Context Value ─────────────────────────────────────────────

  const value: FinanceContextType = {
    transactions,
    goals,
    isLoaded,
    currentUser,
    totalBalance,
    totalIncome,
    totalExpense,
    monthlyIncome,
    monthlyExpense,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    addToGoal,
    customCategories,
    addCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
  };

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────

export function useFinance(): FinanceContextType {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
