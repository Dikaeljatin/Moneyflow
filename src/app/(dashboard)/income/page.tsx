'use client';

import { useState, useMemo } from 'react';
import { useFinance } from '@/lib/store';
import { formatCurrency, incomeCategories } from '@/lib/utils';
import TransactionList from '@/components/TransactionList';
import TransactionModal from '@/components/TransactionModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { Transaction, IncomeCategory } from '@/lib/types';

export default function IncomePage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, isLoaded } =
    useFinance();

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

  const incomeTransactions = useMemo(() => {
    let filtered = transactions.filter((t) => t.type === 'income');
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions]);

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

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
    const transaction = incomeTransactions.find((t) => t.id === id);
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
          <h1 className="text-2xl font-bold text-text-primary">Pemasukan</h1>
          <p className="text-sm text-text-secondary mt-1">
            Kelola semua sumber pemasukan Anda
          </p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          className="btn-primary"
          id="add-income"
        >
          <span>+</span> Tambah Pemasukan
        </button>
      </div>

      {/* Summary + Filter */}
      <div className="grid grid-cols-1 gap-4">
        <div className="glass-card p-5 bg-gradient-to-br from-accent-green/10 to-transparent">
          <p className="text-sm text-text-secondary mb-1">Total Pemasukan</p>
          <p className="text-2xl font-bold text-accent-green">
            {formatCurrency(totalIncome)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {incomeTransactions.length} transaksi
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-text-secondary mb-4">
          Daftar Pemasukan
        </h2>
        <TransactionList
          transactions={incomeTransactions}
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
        type="income"
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
            ? editData ? 'Simpan Perubahan?' : 'Tambah Pemasukan?'
            : 'Hapus Transaksi?'
        }
        message={
          confirmDialog.type === 'save'
            ? editData 
              ? 'Apakah Anda yakin ingin menyimpan perubahan transaksi ini?'
              : 'Apakah Anda yakin ingin menambahkan pemasukan ini?'
            : 'Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.'
        }
        confirmText={confirmDialog.type === 'save' ? 'Simpan' : 'Hapus'}
        type={confirmDialog.type === 'save' ? 'info' : 'danger'}
      />
    </div>
  );
}
