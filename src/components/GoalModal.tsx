'use client';

import { useState, useEffect } from 'react';
import { FinancialGoal } from '@/lib/types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  editData?: FinancialGoal | null;
}

const colorOptions = [
  { label: 'Hijau', value: '#10b981' },
  { label: 'Ungu', value: '#8b5cf6' },
  { label: 'Biru', value: '#3b82f6' },
  { label: 'Kuning', value: '#f59e0b' },
  { label: 'Merah Muda', value: '#ec4899' },
  { label: 'Oranye', value: '#f97316' },
];

export default function GoalModal({
  isOpen,
  onClose,
  onSave,
  editData,
}: GoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#10b981');

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setTargetAmount(editData.targetAmount.toString());
      setCurrentAmount(editData.currentAmount.toString());
      setDeadline(editData.deadline);
      setColor(editData.color);
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      setColor('#10b981');
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;
    if (!name || !target || target <= 0 || !deadline) return;

    onSave({
      name,
      targetAmount: target,
      currentAmount: current,
      deadline,
      color,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-text-primary">
            {editData ? 'Edit Target' : 'Tambah Target Keuangan'}
          </h2>
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Tutup modal"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="goal-name" className="input-label">
              Nama Target
            </label>
            <input
              id="goal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Dana Darurat"
              className="input-field"
              required
              autoFocus
            />
          </div>

          {/* Target Amount */}
          <div>
            <label htmlFor="goal-target" className="input-label">
              Jumlah Target (Rp)
            </label>
            <input
              id="goal-target"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0"
              className="input-field"
              min="1"
              required
            />
          </div>

          {/* Initial Amount */}
          <div>
            <label htmlFor="goal-current" className="input-label">
              Dana Saat Ini (Rp)
            </label>
            <input
              id="goal-current"
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0"
              className="input-field"
              min="0"
            />
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="goal-deadline" className="input-label">
              Tenggat Waktu
            </label>
            <input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Color */}
          <div>
            <label className="input-label">Warna</label>
            <div className="flex gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${
                    color === opt.value
                      ? 'ring-2 ring-offset-2 ring-offset-white scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: opt.value,
                    outlineColor: color === opt.value ? opt.value : 'transparent',
                  }}
                  title={opt.label}
                  aria-label={`Pilih warna ${opt.label}`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 font-semibold py-2.5 rounded-xl text-white text-sm transition-all duration-200 hover:-translate-y-0.5 bg-accent-violet hover:shadow-lg hover:shadow-accent-violet/20"
            >
              {editData ? 'Simpan Perubahan' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
