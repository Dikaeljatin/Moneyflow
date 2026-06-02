// MoneyFlow — Utility Functions

import {
  Transaction,
  Category,
  MonthlyData,
  CategoryData,
  IncomeCategory,
  ExpenseCategory,
} from './types';

// ─── Currency Formatting ───────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp${(amount / 1_000_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000_000) {
    return `Rp${(amount / 1_000_000).toFixed(1)}Jt`;
  }
  if (amount >= 1_000) {
    return `Rp${(amount / 1_000).toFixed(0)}Rb`;
  }
  return formatCurrency(amount);
}

// ─── Date Formatting ───────────────────────────────────────────────

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── ID Generator ──────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Category Icons ────────────────────────────────────────────────

// Removed emoji icons - using category names only
export function getCategoryIcon(category: Category): string {
  return ''; // Return empty string, no icons needed
}

// ─── Category Colors ───────────────────────────────────────────────

const categoryColors: Record<Category, string> = {
  // Income — green shades
  'Uang Bulanan': '#10b981',
  Gaji: '#34d399',
  Bisnis: '#059669',
  // Expense — warm/cool shades
  Nongkrong: '#f43f5e',
  Transportasi: '#f59e0b',
  Belanja: '#f97316',
  Hiburan: '#8b5cf6',
};

export function getCategoryColor(category: Category): string {
  return categoryColors[category] || '#94a3b8';
}

// ─── Income & Expense Categories ───────────────────────────────────

export const incomeCategories: IncomeCategory[] = [
  'Uang Bulanan',
  'Gaji',
  'Bisnis',
];

export const expenseCategories: ExpenseCategory[] = [
  'Nongkrong',
  'Transportasi',
  'Belanja',
  'Hiburan',
];

// ─── Data Aggregation ──────────────────────────────────────────────

export function getMonthlyData(
  transactions: Transaction[],
  monthCount: number = 6
): MonthlyData[] {
  const now = new Date();
  const months: MonthlyData[] = [];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const label = `${month} ${year}`;

    const monthTransactions = transactions.filter((t) => {
      const td = new Date(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    months.push({ month, year, income, expense, label });
  }

  return months;
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  type: 'income' | 'expense'
): CategoryData[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const grouped: Record<string, number> = {};
  for (const t of filtered) {
    grouped[t.category] = (grouped[t.category] || 0) + t.amount;
  }

  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category: category as Category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: getCategoryColor(category as Category),
    }))
    .filter(data => data.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

// ─── Filtering ─────────────────────────────────────────────────────

export function filterByDateRange(
  transactions: Transaction[],
  start: string,
  end: string
): Transaction[] {
  return transactions.filter((t) => t.date >= start && t.date <= end);
}

export function filterByCurrentMonth(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

// ─── Date Calculators ────────────────────────────────────────────────

export function getMonthStartEnd(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function getWeekStartEnd(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function formatWeekRangeString(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const endStr = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  
  if (start.getFullYear() !== end.getFullYear()) {
    return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${endStr}`;
  }
  return `${startStr} - ${endStr}`;
}

export function formatMonthString(date: Date): string {
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

// ─── Export ────────────────────────────────────────────────────────

export function exportToCSV(transactions: Transaction[]): string {
  const headers = ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah'];
  const rows = transactions.map((t) => [
    t.date,
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    t.category,
    `"${t.description}"`,
    t.amount.toString(),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportToJSON(transactions: Transaction[]): string {
  return JSON.stringify(
    transactions.map((t) => ({
      tanggal: t.date,
      tipe: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      kategori: t.category,
      deskripsi: t.description,
      jumlah: t.amount,
    })),
    null,
    2
  );
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Sample Data ───────────────────────────────────────────────────

export function generateSampleData(): {
  transactions: Transaction[];
  goals: import('./types').FinancialGoal[];
} {
  const now = new Date();
  const transactions: Transaction[] = [];

  // Generate 3 months of sample data
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const year = d.getFullYear();
    const month = d.getMonth();

    // Monthly salary
    transactions.push({
      id: generateId() + `-salary-${monthOffset}`,
      type: 'income',
      amount: 8500000,
      category: 'Gaji',
      description: 'Gaji bulanan',
      date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
      createdAt: new Date(year, month, 1).toISOString(),
    });

    // Freelance income (some months)
    if (monthOffset !== 1) {
      transactions.push({
        id: generateId() + `-freelance-${monthOffset}`,
        type: 'income',
        amount: 2000000 + Math.floor(Math.random() * 1500000),
        category: 'Bisnis',
        description: 'Proyek bisnis',
        date: `${year}-${String(month + 1).padStart(2, '0')}-15`,
        createdAt: new Date(year, month, 15).toISOString(),
      });
    }

    // Expenses
    const expenseData = [
      { cat: 'Nongkrong' as const, desc: 'Cafe & nongkrong', min: 1500000, max: 2500000, day: 3 },
      { cat: 'Transportasi' as const, desc: 'Bensin & transportasi online', min: 400000, max: 800000, day: 5 },
      { cat: 'Belanja' as const, desc: 'Belanja bulanan', min: 800000, max: 1200000, day: 7 },
      { cat: 'Hiburan' as const, desc: 'Netflix, Spotify, nonton', min: 200000, max: 500000, day: 10 },
    ];

    for (const e of expenseData) {
      transactions.push({
        id: generateId() + `-${e.cat}-${monthOffset}`,
        type: 'expense',
        amount: e.min + Math.floor(Math.random() * (e.max - e.min)),
        category: e.cat,
        description: e.desc,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(e.day).padStart(2, '0')}`,
        createdAt: new Date(year, month, e.day).toISOString(),
      });
    }
  }

  const goals = [
    {
      id: generateId() + '-goal-1',
      name: 'Dana Darurat',
      targetAmount: 50000000,
      currentAmount: 18500000,
      deadline: `${now.getFullYear() + 1}-06-01`,
      color: '#10b981',
      createdAt: new Date(now.getFullYear(), 0, 1).toISOString(),
    },
    {
      id: generateId() + '-goal-2',
      name: 'Liburan Bali',
      targetAmount: 15000000,
      currentAmount: 9200000,
      deadline: `${now.getFullYear()}-12-15`,
      color: '#8b5cf6',
      createdAt: new Date(now.getFullYear(), 2, 1).toISOString(),
    },
    {
      id: generateId() + '-goal-3',
      name: 'Laptop Baru',
      targetAmount: 20000000,
      currentAmount: 5000000,
      deadline: `${now.getFullYear() + 1}-03-01`,
      color: '#3b82f6',
      createdAt: new Date(now.getFullYear(), 4, 1).toISOString(),
    },
  ];

  return { transactions, goals };
}
