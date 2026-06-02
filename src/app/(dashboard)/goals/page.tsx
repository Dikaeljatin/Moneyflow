'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import GoalCard from '@/components/GoalCard';
import GoalModal from '@/components/GoalModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { FinancialGoal } from '@/lib/types';

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, addToGoal, isLoaded } =
    useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<FinancialGoal | null>(null);
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [fundGoalId, setFundGoalId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'save' | 'delete' | 'addFund';
    data: any;
  }>({
    isOpen: false,
    type: 'save',
    data: null,
  });

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const completedGoals = goals.filter(
    (g) => g.currentAmount >= g.targetAmount
  ).length;

  const handleEdit = (goal: FinancialGoal) => {
    setEditData(goal);
    setModalOpen(true);
  };

  const handleSave = (data: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
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
        updateGoal(confirmDialog.data.id, confirmDialog.data);
      } else {
        addGoal(confirmDialog.data);
      }
      setEditData(null);
      setModalOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) {
      setConfirmDialog({
        isOpen: true,
        type: 'delete',
        data: { id, goal },
      });
    }
  };

  const confirmDelete = () => {
    if (confirmDialog.data?.id) {
      deleteGoal(confirmDialog.data.id);
    }
  };

  const handleAddFunds = (id: string) => {
    setFundGoalId(id);
    setFundAmount('');
    setFundModalOpen(true);
  };

  const submitAddFunds = () => {
    const amount = parseFloat(fundAmount);
    if (fundGoalId && amount > 0) {
      // Show confirmation dialog before adding funds
      setConfirmDialog({
        isOpen: true,
        type: 'addFund',
        data: { goalId: fundGoalId, amount },
      });
    }
  };

  const confirmAddFunds = () => {
    if (confirmDialog.data?.goalId && confirmDialog.data?.amount) {
      addToGoal(confirmDialog.data.goalId, confirmDialog.data.amount);
      setFundModalOpen(false);
      setFundGoalId(null);
      setFundAmount('');
    }
  };

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card-static p-5">
              <div className="skeleton h-6 w-32 mb-3" />
              <div className="skeleton h-20 w-20 rounded-full mb-3" />
              <div className="skeleton h-4 w-full" />
            </div>
          ))}
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
            Target Keuangan
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Atur dan pantau tujuan keuangan Anda
          </p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          className="btn-primary"
          id="add-goal"
          style={{
            background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
          }}
        >
          <span>+</span> Tambah Target
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 bg-gradient-to-br from-accent-violet/10 to-transparent">
          <p className="text-sm text-text-secondary mb-1">Total Target</p>
          <p className="text-xl font-bold text-accent-violet">
            {formatCurrency(totalTarget)}
          </p>
        </div>
        <div className="glass-card p-5 bg-gradient-to-br from-accent-green/10 to-transparent">
          <p className="text-sm text-text-secondary mb-1">Total Terkumpul</p>
          <p className="text-xl font-bold text-accent-green">
            {formatCurrency(totalSaved)}
          </p>
        </div>
        <div className="glass-card p-5 bg-gradient-to-br from-accent-amber/10 to-transparent">
          <p className="text-sm text-text-secondary mb-1">Target Tercapai</p>
          <p className="text-xl font-bold text-accent-amber">
            {completedGoals} / {goals.length}
          </p>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-violet">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
              <path d="M12 18V6"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Belum ada target
          </h3>
          <p className="text-sm text-text-muted mb-4">
            Mulai buat target keuangan pertama Anda!
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
            }}
          >
            + Buat Target Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onAddFunds={handleAddFunds}
              onEdit={handleEdit}
              onDelete={handleDelete}
              delay={i}
            />
          ))}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSave={handleSave}
        editData={editData}
      />

      {/* Add Funds Modal */}
      {fundModalOpen && (
        <div className="modal-overlay" onClick={() => setFundModalOpen(false)}>
          <div
            className="modal-content max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Tambah Dana
            </h2>
            <div className="mb-4">
              <label htmlFor="fund-amount" className="input-label">
                Jumlah (Rp)
              </label>
              <input
                id="fund-amount"
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="0"
                className="input-field text-lg font-semibold"
                min="1"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setFundModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={submitAddFunds}
                className="flex-1 font-semibold py-2.5 rounded-xl text-white text-sm gradient-green hover:shadow-lg hover:shadow-accent-green/30 transition-all"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, type: 'save', data: null })
        }
        onConfirm={
          confirmDialog.type === 'save' 
            ? confirmSave 
            : confirmDialog.type === 'delete'
            ? confirmDelete
            : confirmAddFunds
        }
        title={
          confirmDialog.type === 'save'
            ? editData ? 'Simpan Perubahan?' : 'Tambah Target?'
            : confirmDialog.type === 'delete'
            ? 'Hapus Target?'
            : 'Tambah Dana?'
        }
        message={
          confirmDialog.type === 'save'
            ? editData 
              ? 'Apakah Anda yakin ingin menyimpan perubahan target ini?'
              : 'Apakah Anda yakin ingin menambahkan target keuangan ini?'
            : confirmDialog.type === 'delete'
            ? 'Apakah Anda yakin ingin menghapus target ini? Tindakan ini tidak dapat dibatalkan.'
            : `Apakah Anda yakin ingin menambahkan dana sebesar ${formatCurrency(confirmDialog.data?.amount || 0)}?`
        }
        confirmText={
          confirmDialog.type === 'save' 
            ? 'Simpan' 
            : confirmDialog.type === 'delete'
            ? 'Hapus'
            : 'Tambah'
        }
        type={
          confirmDialog.type === 'delete' 
            ? 'danger' 
            : 'info'
        }
      />
    </div>
  );
}
