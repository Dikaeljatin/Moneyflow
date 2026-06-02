// MoneyFlow — Type Definitions

export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'Uang Bulanan'
  | 'Gaji'
  | 'Bisnis'
  | string; // Allow custom categories

export type ExpenseCategory =
  | 'Nongkrong'
  | 'Transportasi'
  | 'Belanja'
  | 'Hiburan'
  | string; // Allow custom categories

export type Category = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // ISO datetime string
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO date string
  color: string;
  createdAt: string;
}

export interface MonthlyData {
  month: string; // "Jan", "Feb", etc.
  year: number;
  income: number;
  expense: number;
  label: string; // "Jan 2026"
}

export interface CategoryData {
  category: Category;
  amount: number;
  percentage: number;
  color: string;
}

export interface DateRange {
  start: string;
  end: string;
}
