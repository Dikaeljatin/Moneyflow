'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { Transaction, FinancialGoal } from './types';
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
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
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

    Promise.all([
      supabase.from('transactions').select('*').eq('username', username).order('date', { ascending: false }),
      supabase.from('goals').select('*').eq('username', username).order('createdat', { ascending: true })
    ])
      .then(([{ data: txData, error: txError }, { data: goalsData, error: goalsError }]) => {
        if (txError) console.error('Failed to load transactions:', txError);
        if (goalsError) console.error('Failed to load goals:', goalsError);

        setTransactions((txData || []).map(dbTxToApp));
        setGoals((goalsData || []).map(dbGoalToApp));
        setIsLoaded(true);
      })
      .catch(e => {
        console.error('Failed to load from Supabase:', e);
        setIsLoaded(true);
      });
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
