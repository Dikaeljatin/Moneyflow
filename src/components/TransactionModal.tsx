'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category } from '@/lib/types';
import {
  incomeCategories,
  expenseCategories,
  getToday,
} from '@/lib/utils';
import { useFinance } from '@/lib/store';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  type: TransactionType;
  editData?: Transaction | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  type,
  editData,
}: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getToday());
  const [category, setCategory] = useState<Category>(
    type === 'income' ? incomeCategories[0] : expenseCategories[0]
  );
  
  const [activeExpenseCategories, setActiveExpenseCategories] = useState<string[]>(expenseCategories);
  const [activeIncomeCategories, setActiveIncomeCategories] = useState<string[]>(incomeCategories);

  const { customCategories } = useFinance();

  // Load custom categories when modal opens
  useEffect(() => {
    if (isOpen) {
      let expCats = [...expenseCategories];
      let incCats = [...incomeCategories];
      
      // First, add all pure custom categories
      const pureCustomExp = customCategories.filter((c) => (c.type === 'expense' || !c.type) && c.isCustom).map((c) => c.name);
      const pureCustomInc = customCategories.filter((c) => c.type === 'income' && c.isCustom).map((c) => c.name);
      
      expCats = [...expCats, ...pureCustomExp];
      incCats = [...incCats, ...pureCustomInc];
      
      // Then filter out any (default or custom) that are disabled
      const disabledNames = customCategories.filter((c) => c.isEnabled === false).map((c) => c.name);
      
      expCats = expCats.filter(name => !disabledNames.includes(name));
      incCats = incCats.filter(name => !disabledNames.includes(name));
      
      setActiveExpenseCategories(expCats);
      setActiveIncomeCategories(incCats);
    }
  }, [isOpen, type, customCategories]);

  const categories = type === 'income' ? activeIncomeCategories : activeExpenseCategories;

  // Format number with Indonesian dot separator (e.g. 90000 → "90.000")
  const formatAmountDisplay = (num: number | string): string => {
    const clean = num.toString().replace(/\D/g, '');
    if (!clean) return '';
    return parseInt(clean, 10).toLocaleString('id-ID');
  };

  // Strip dots and parse to number (e.g. "90.000" → 90000)
  const parseAmountInput = (val: string): number => {
    const clean = val.replace(/\./g, '').replace(/,/g, '');
    return parseFloat(clean) || 0;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '').replace(/,/g, '').replace(/\D/g, '');
    if (raw === '') { setAmount(''); return; }
    const formatted = parseInt(raw, 10).toLocaleString('id-ID');
    setAmount(formatted);
  };

  useEffect(() => {
    if (editData) {
      setAmount(formatAmountDisplay(editData.amount));
      setDescription(editData.description);
      setDate(editData.date);
      setCategory(editData.category);
    } else {
      setAmount('');
      setDescription('');
      setDate(getToday());
      // Re-initialize category taking active ones into account
      const defaultCat = type === 'income' 
        ? activeIncomeCategories[0] 
        : activeExpenseCategories[0];
      setCategory(defaultCat);
    }
  }, [editData, type, isOpen, activeExpenseCategories, activeIncomeCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseAmountInput(amount);
    if (!numAmount || numAmount <= 0) return;

    onSave({
      type,
      amount: numAmount,
      category,
      description,
      date,
    });
    onClose();
  };

  const title = editData
    ? `Edit ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`
    : `Tambah ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Decorative background blur */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 ${type === 'income' ? 'bg-accent-green' : 'bg-accent-red'}`}></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${type === 'income' ? 'bg-emerald-50 text-emerald-500 shadow-emerald-500/20' : 'bg-rose-50 text-rose-500 shadow-rose-500/20'}`}>
              {type === 'income' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">{title}</h2>
              <p className="text-xs text-text-muted font-medium mt-0.5">{type === 'income' ? 'Catat pemasukan baru' : 'Catat pengeluaran baru'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon w-10 h-10 hover:bg-slate-100 hover:text-slate-900 border-transparent shadow-none"
            aria-label="Tutup modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          
          {/* Amount - Premium Large Input */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <label htmlFor="tx-amount" className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">
              Jumlah Uang
            </label>
            <div className="relative flex items-center">
              <span className={`absolute left-4 font-bold text-xl ${type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>Rp</span>
              <input
                id="tx-amount"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className={`w-full bg-white border-2 rounded-xl py-3 pl-12 pr-4 text-2xl font-bold outline-none transition-all shadow-sm ${type === 'income' ? 'text-emerald-600 border-emerald-100 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20' : 'text-rose-600 border-rose-100 focus:border-rose-400 focus:ring-4 focus:ring-rose-400/20'}`}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Category */}
            <div>
              <label htmlFor="tx-category" className="input-label">
                Kategori
              </label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="input-field hover:border-slate-300 focus:bg-white"
                required
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="tx-date" className="input-label">
                Tanggal
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field hover:border-slate-300 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="tx-description" className="input-label">
              Catatan / Deskripsi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <input
                id="tx-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Misal: Makan siang bersama klien..."
                className="input-field pl-11 hover:border-slate-300 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 mt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3.5 text-slate-600 hover:bg-slate-100 hover:border-slate-200">
              Batal
            </button>
            <button
              type="submit"
              className={`flex-1 font-bold py-3.5 rounded-xl text-white transition-all duration-300 hover:-translate-y-1 ${
                type === 'income'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50'
              }`}
            >
              {editData ? 'Simpan Perubahan' : 'Tambah Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
