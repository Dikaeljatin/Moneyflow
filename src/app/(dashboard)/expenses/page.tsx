'use client';

import { useState, useMemo } from 'react';
import { useFinance } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import TransactionList from '@/components/TransactionList';
import TransactionModal from '@/components/TransactionModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { Transaction } from '@/lib/types';

export default function ExpensesPage() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoaded,
  } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Transaction | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'save' | 'delete';
    data: any;
  }>({
    isOpen: false,
    type: 'save',
    data: null,
  });

  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const years: string[] = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y.toString());
  }

  const expenseTransactions = useMemo(() => {
    let filtered = transactions.filter((t) => t.type === 'expense');
    
    filtered = filtered.filter(t => {
      const parts = t.date.split('-');
      return parts.length >= 2 && parts[0] === selectedYear && parts[1] === selectedMonth;
    });

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, selectedMonth, selectedYear]);

  const totalExpense = expenseTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const handleEdit = (t: Transaction) => {
    setEditData(t);
    setModalOpen(true);
  };

  const handleSave = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    // Show confirmation dialog before saving
    setConfirmDialog({
      isOpen: true,
      type: 'save',
      data: { ...data, id: editData?.id },
    });
  };

  const confirmSave = () => {
    if (confirmDialog.data) {
      if (confirmDialog.data.id) {
        updateTransaction(confirmDialog.data.id, confirmDialog.data);
      } else {
        addTransaction(confirmDialog.data);
      }
      setEditData(null);
      setModalOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    const transaction = expenseTransactions.find((t) => t.id === id);
    if (transaction) {
      setConfirmDialog({
        isOpen: true,
        type: 'delete',
        data: { id, transaction },
      });
    }
  };

  const confirmDelete = () => {
    if (confirmDialog.data?.id) {
      deleteTransaction(confirmDialog.data.id);
    }
  };

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="glass-card-static p-6">
          <div className="skeleton h-6 w-32 mb-2" />
          <div className="skeleton h-8 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Pengeluaran
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Pantau dan kelola pengeluaran harian Anda
          </p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          className="btn-danger"
          id="add-expense"
        >
          <span>+</span> Tambah Pengeluaran
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-text-secondary">Bulan:</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-slate-700 bg-white shadow-sm"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          
          <label className="text-sm font-medium text-text-secondary ml-2">Tahun:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-sm text-slate-700 bg-white shadow-sm"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 gap-4">
        <div className="glass-card p-5 bg-gradient-to-br from-accent-red/10 to-transparent">
          <p className="text-sm text-text-secondary mb-1">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-accent-red">
            {formatCurrency(totalExpense)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {expenseTransactions.length} transaksi
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-text-secondary mb-4">
          Daftar Pengeluaran
        </h2>
        <TransactionList
          transactions={expenseTransactions}
          showActions
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSave={handleSave}
        type="expense"
        editData={editData}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, type: 'save', data: null })
        }
        onConfirm={confirmDialog.type === 'save' ? confirmSave : confirmDelete}
        title={
          confirmDialog.type === 'save'
            ? editData ? 'Simpan Perubahan?' : 'Tambah Pengeluaran?'
            : 'Hapus Transaksi?'
        }
        message={
          confirmDialog.type === 'save'
            ? editData 
              ? 'Apakah Anda yakin ingin menyimpan perubahan transaksi ini?'
              : 'Apakah Anda yakin ingin menambahkan pengeluaran ini?'
            : 'Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.'
        }
        confirmText={confirmDialog.type === 'save' ? 'Simpan' : 'Hapus'}
        type={confirmDialog.type === 'save' ? 'info' : 'danger'}
      />
    </div>
  );
}
