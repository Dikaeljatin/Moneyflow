'use client';

import { useFinance } from '@/lib/store';
import { getCategoryBreakdown, formatCurrency } from '@/lib/utils';
import StatCard from '@/components/StatCard';
import TransactionList from '@/components/TransactionList';
import DonutChart from '@/components/charts/DonutChart';
import TransactionModal from '@/components/TransactionModal';
import TimeFilter, { TimeFilterMode } from '@/components/TimeFilter';
import { useState, useEffect } from 'react';
import type { TransactionType } from '@/lib/types';

export default function DashboardPage() {
  const {
    transactions,
    goals,
    isLoaded,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    addTransaction,
  } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('income');
  const [username, setUsername] = useState<string>('');
  const [timeFilterMode, setTimeFilterMode] = useState<TimeFilterMode>('week');
  const [dateRange, setDateRange] = useState<{start: Date, end: Date} | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('moneyflow_username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card-static p-5">
              <div className="skeleton h-10 w-10 mb-3 rounded-xl" />
              <div className="skeleton h-4 w-20 mb-2" />
              <div className="skeleton h-6 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }


  // Apply Time Filter
  let filteredTransactions = transactions;
  if (dateRange) {
    filteredTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= dateRange.start && d <= dateRange.end;
    });
  }

  const expenseBreakdown = getCategoryBreakdown(filteredTransactions, 'expense');
  const incomeBreakdown = getCategoryBreakdown(filteredTransactions, 'income');

  const periodIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const openModal = (type: TransactionType) => {
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header with Enhanced Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-base text-slate-600 font-medium flex items-center gap-2">
            {username ? (
              <span>Selamat datang kembali, <span className="font-bold text-slate-800">{username}</span> <span className="text-xl inline-block ml-1 origin-bottom-right animate-wave">👋</span></span>
            ) : (
              <span>Ringkasan kondisi keuangan Anda saat ini <span className="text-xl inline-block ml-1 origin-bottom-right animate-wave">👋</span></span>
            )}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => openModal('income')}
            className="btn-primary shadow-lg shadow-accent-green/30"
            id="add-income-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Pemasukan
          </button>
          <button
            onClick={() => openModal('expense')}
            className="btn-danger shadow-lg shadow-accent-red/30"
            id="add-expense-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Pengeluaran
          </button>
        </div>
      </div>

      {/* Full Width Time Filter Card */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex justify-center animate-fade-in w-full">
        <TimeFilter 
          mode={timeFilterMode}
          onModeChange={setTimeFilterMode}
          onDateRangeChange={(start, end) => setDateRange({ start, end })}
        />
      </div>

      {/* Summary Cards with Enhanced Animation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="animate-slide-up stagger-1">
          <StatCard
            label="Total Saldo"
            value={totalBalance}
            variant="blue"
            delay={0}
          />
        </div>
        <div className="animate-slide-up stagger-2">
          <StatCard
            label={timeFilterMode === 'week' ? 'Pemasukan Minggu Ini' : timeFilterMode === 'month' ? 'Pemasukan Bulan Ini' : 'Pemasukan Rentang Ini'}
            value={periodIncome}
            variant="green"
            delay={1}
          />
        </div>
        <div className="animate-slide-up stagger-3">
          <StatCard
            label={timeFilterMode === 'week' ? 'Pengeluaran Minggu Ini' : timeFilterMode === 'month' ? 'Pengeluaran Bulan Ini' : 'Pengeluaran Rentang Ini'}
            value={periodExpense}
            variant="red"
            delay={2}
          />
        </div>
      </div>

      {/* Charts Row with Enhanced Styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">

        {/* Donut Chart Pemasukan - Enhanced */}
        <div className="glass-card p-7 group">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green/20 to-accent-green-light/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-green">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a10 10 0 0 1 10 10"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-text-primary">
              Kategori Pemasukan
            </h2>
          </div>
          <DonutChart
            data={incomeBreakdown}
            size={220}
          />
        </div>

        {/* Donut Chart Pengeluaran - Enhanced */}
        <div className="glass-card p-7 group">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-red/20 to-accent-red-light/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-red">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a10 10 0 0 1 10 10"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-text-primary">
              Kategori Pengeluaran
            </h2>
          </div>
          <DonutChart
            data={expenseBreakdown}
            size={220}
          />
        </div>
      </div>

      {/* Recent Transactions + Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Recent Transactions - Enhanced */}
        <div className="lg:col-span-2 glass-card p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green/20 to-accent-green-light/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-green">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-text-primary">
                Transaksi Terbaru
              </h2>
            </div>
          </div>
          <TransactionList transactions={recentTransactions} limit={7} />
        </div>

        {/* Financial Goals Summary - Enhanced */}
        <div className="glass-card p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-violet/20 to-accent-violet-light/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-violet">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-text-primary">
                Target
              </h2>
            </div>
            <a
              href="/goals"
              className="text-xs font-bold text-accent-red hover:text-accent-red-dark transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-accent-red/10"
            >
              Kelola
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-surface-2 to-surface-3 flex items-center justify-center shadow-inner">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <p className="text-sm text-text-secondary font-semibold mb-1">Belum ada target</p>
              <p className="text-xs text-text-muted">Buat target keuanganmu sekarang</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal, idx) => {
                const progress = Math.min(
                  (goal.currentAmount / goal.targetAmount) * 100,
                  100
                );
                return (
                  <div 
                    key={goal.id} 
                    className="p-5 rounded-2xl bg-gradient-to-br from-surface-2/60 to-surface-3/40 border border-border/60 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-accent-red/5 group"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-text-primary truncate flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                        {goal.name}
                      </p>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm"
                        style={{ 
                          color: goal.color,
                          backgroundColor: goal.color + '20',
                          border: `1px solid ${goal.color}40`
                        }}
                      >
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: goal.color,
                          boxShadow: `0 0 8px ${goal.color}40`
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-3">
                      <span className="text-[11px] text-text-secondary font-bold">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-[11px] text-text-muted font-semibold">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => addTransaction(data)}
        type={modalType}
      />
    </div>
  );
}
