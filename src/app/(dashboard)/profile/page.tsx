'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// --- SVG Icons ---
const UserIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SparklesIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);

const EditIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const LockIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

interface CustomCategory {
  name: string;
  icon: string;
  color: string;
  isCustom: boolean;
  type: 'income' | 'expense';
  isEnabled?: boolean;
}

const DEFAULT_EXPENSE_CATEGORIES: CustomCategory[] = [
  { name: 'Nongkrong', icon: '☕', color: '#8b5cf6', isCustom: false, type: 'expense' },
  { name: 'Transportasi', icon: '🚗', color: '#3b82f6', isCustom: false, type: 'expense' },
  { name: 'Belanja', icon: '🛍️', color: '#f59e0b', isCustom: false, type: 'expense' },
  { name: 'Hiburan', icon: '🎮', color: '#ec4899', isCustom: false, type: 'expense' },
];

const DEFAULT_INCOME_CATEGORIES: CustomCategory[] = [
  { name: 'Uang Bulanan', icon: '💰', color: '#10b981', isCustom: false, type: 'income' },
  { name: 'Gaji', icon: '💳', color: '#059669', isCustom: false, type: 'income' },
  { name: 'Bisnis', icon: '🏢', color: '#34d399', isCustom: false, type: 'income' },
];

export default function ProfilePage() {
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState<'akun' | 'personalisasi'>('akun');

  // Edit profile state
  const [editMode, setEditMode] = useState<'password' | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Personalisasi State
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [newCatColor, setNewCatColor] = useState('#136f2b');
  const [categoryToDelete, setCategoryToDelete] = useState<CustomCategory | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<CustomCategory | null>(null);
  const [editCatColor, setEditCatColor] = useState('');
  const [editCatEnabled, setEditCatEnabled] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem('moneyflow_username') || '';
    setUsername(storedUsername);
    const key = storedUsername ? `moneyflow_custom_categories_${storedUsername}` : 'moneyflow_custom_categories';
    const savedCats = localStorage.getItem(key);
    if (savedCats) {
      try { setCustomCategories(JSON.parse(savedCats)); } catch (e) {}
    }
  }, []);

  const openEdit = (mode: 'password') => {
    setEditMode(mode);
    setEditError('');
    setEditSuccess('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const closeEdit = () => {
    setEditMode(null);
    setEditError('');
    setEditSuccess('');
  };

  const handleSavePassword = async () => {
    setEditError('');
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setEditError('Semua field harus diisi.'); return;
    }
    if (newPassword.length < 4) { setEditError('Sandi baru minimal 4 karakter.'); return; }
    if (newPassword !== confirmNewPassword) { setEditError('Konfirmasi sandi tidak cocok.'); return; }

    setSaving(true);
    try {
      // Verify current password
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .eq('password', currentPassword)
        .single();

      if (!user) { setEditError('Sandi saat ini salah.'); setSaving(false); return; }

      const { error } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('username', username);

      if (error) throw error;

      setEditSuccess('Sandi berhasil diperbarui!');
      setTimeout(closeEdit, 1500);
    } catch {
      setEditError('Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(newCatColor);
    const finalColor = isValidHex ? newCatColor : '#136f2b';
    const newCat: CustomCategory = {
      name: newCatName.trim(), icon: newCatIcon.trim(),
      color: finalColor, isCustom: true, type: categoryType
    };
    const updated = [...customCategories, newCat];
    setCustomCategories(updated);
    const key = username ? `moneyflow_custom_categories_${username}` : 'moneyflow_custom_categories';
    localStorage.setItem(key, JSON.stringify(updated));
    setNewCatName(''); setNewCatIcon('');
    setNewCatColor(categoryType === 'income' ? '#10b981' : '#136f2b');
  };

  const openEditCategory = (cat: CustomCategory) => {
    setCategoryToEdit(cat);
    setEditCatColor(cat.color);
    setEditCatEnabled(cat.isEnabled !== false);
  };

  const saveEditCategory = () => {
    if (!categoryToEdit) return;
    
    const existingIndex = customCategories.findIndex(c => c.name === categoryToEdit.name);
    let updated = [...customCategories];
    
    if (existingIndex >= 0) {
      updated[existingIndex] = { 
        ...updated[existingIndex], 
        color: editCatColor, 
        isEnabled: editCatEnabled 
      };
    } else {
      updated.push({
        ...categoryToEdit,
        color: editCatColor,
        isEnabled: editCatEnabled
      });
    }
    
    setCustomCategories(updated);
    const key = username ? `moneyflow_custom_categories_${username}` : 'moneyflow_custom_categories';
    localStorage.setItem(key, JSON.stringify(updated));
    setCategoryToEdit(null);
  };

  const initial = username ? username.charAt(0).toUpperCase() : 'U';
  
  // Merge default categories with their overrides
  const displayedDefaultCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES].map(defCat => {
    const override = customCategories.find(c => c.name === defCat.name);
    return override ? { ...defCat, ...override } : defCat;
  });
  
  const pureCustomCategories = customCategories.filter(c => c.isCustom);
  const allCategories = [...displayedDefaultCategories, ...pureCustomCategories];
  const expenseCategoriesList = allCategories.filter(c => c.type === 'expense');
  const incomeCategoriesList = allCategories.filter(c => c.type === 'income');
  
  const renderCategory = (cat: CustomCategory, idx: number) => (
    <div key={idx} className={`flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group ${cat.isEnabled === false ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
          {cat.icon || <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />}
        </div>
        <div>
          <p className={`text-base font-semibold leading-tight ${cat.isEnabled === false ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{cat.name}</p>
          <div className="mt-1 flex items-center gap-2">
            {cat.type === 'income' ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 tracking-wider">PEMASUKAN</span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 tracking-wider">PENGELUARAN</span>
            )}
            {cat.isCustom ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 tracking-wider">KUSTOM</span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 tracking-wider">BAWAAN</span>
            )}
            {cat.isEnabled === false && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-500 tracking-wider">NONAKTIF</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button onClick={() => openEditCategory(cat)} className="text-slate-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-50">
          <EditIcon size={18} />
        </button>
        {cat.isCustom && (
          <button onClick={() => setCategoryToDelete(cat)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Tabs */}
      <div className="flex items-center gap-6 border-b border-transparent pb-2">
        <button
          onClick={() => setActiveTab('akun')}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold transition-all ${
            activeTab === 'akun'
              ? 'border-2 border-slate-900 bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <UserIcon size={18} className={activeTab === 'akun' ? 'text-slate-900' : 'text-slate-400'} />
          Akun
        </button>
        <button
          onClick={() => setActiveTab('personalisasi')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
            activeTab === 'personalisasi'
              ? 'border-2 border-slate-900 bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <SparklesIcon size={18} className={activeTab === 'personalisasi' ? 'text-slate-900' : 'text-slate-400'} />
          Personalisasi
        </button>
      </div>

      {/* ── TAB AKUN ── */}
      {activeTab === 'akun' && (
        <div className="space-y-6 animate-slide-up">
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0d5924] to-[#127932] flex items-center justify-center shadow-lg shadow-[#0d5924]/20 flex-shrink-0">
              <span className="text-3xl font-bold text-white">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-slate-900 truncate tracking-tight mb-1">{username}</h2>
              <p className="text-slate-400 text-sm font-medium">Pengguna MoneyFlow</p>
            </div>
          </div>

          {/* Details + Edit Buttons */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Username row — read only */}
            <div className="flex items-center gap-5 p-6 border-b border-slate-100/80">
              <div className="text-slate-400"><UserIcon size={22} /></div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-0.5">Username</p>
                <p className="text-base font-semibold text-slate-800">{username}</p>
              </div>
            </div>

            {/* Password row */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-5">
                <div className="text-slate-400"><LockIcon size={22} /></div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-0.5">Kata Sandi</p>
                  <p className="text-base font-semibold text-slate-800 tracking-widest">••••••••</p>
                </div>
              </div>
              <button
                onClick={() => openEdit('password')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <EditIcon size={14} /> Ubah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB PERSONALISASI ── */}
      {activeTab === 'personalisasi' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Kategori Baru</h2>
                <p className="text-sm text-slate-500">Tambah kategori sesuai kebiasaanmu.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipe kategori</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="catType" checked={categoryType === 'expense'} onChange={() => setCategoryType('expense')} className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer" />
                    <span className="text-sm font-medium text-slate-700">Pengeluaran</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="catType" checked={categoryType === 'income'} onChange={() => setCategoryType('income')} className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer" />
                    <span className="text-sm font-medium text-slate-700">Pemasukan</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama kategori</label>
                <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Contoh: Langganan app" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ikon (opsional)</label>
                <input type="text" value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} placeholder="Ketik emoji atau kosongkan" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warna di grafik</label>
                <div className="flex gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm cursor-pointer">
                    <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} className="absolute -inset-4 w-24 h-24 cursor-pointer" />
                  </div>
                  <input type="text" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} placeholder="#136f2b" className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-mono" />
                </div>
              </div>
              <button onClick={handleAddCategory} className="mt-2 btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah kategori
              </button>
            </div>
          </div>

          {/* Daftar Kategori Pengeluaran */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Kategori Pengeluaran</h3>
              <p className="text-sm text-slate-500">{expenseCategoriesList.length} kategori</p>
            </div>
            <div className="divide-y divide-slate-100/80">
              {expenseCategoriesList.map((cat, idx) => renderCategory(cat, idx))}
            </div>
          </div>

          {/* Daftar Kategori Pemasukan */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Kategori Pemasukan</h3>
              <p className="text-sm text-slate-500">{incomeCategoriesList.length} kategori</p>
            </div>
            <div className="divide-y divide-slate-100/80">
              {incomeCategoriesList.map((cat, idx) => renderCategory(cat, idx))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDIT PASSWORD ── */}
      {editMode === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-up border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Ubah Kata Sandi</h3>
            <p className="text-sm text-slate-500 mb-5">Masukkan sandi saat ini lalu buat sandi baru.</p>

            {editError && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center">{editError}</div>}
            {editSuccess && <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 text-center">{editSuccess}</div>}

            <div className="space-y-3">
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Sandi saat ini" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all text-slate-900 font-medium" autoFocus />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Sandi baru (min. 4 karakter)" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all text-slate-900 font-medium" />
              <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Konfirmasi sandi baru" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all text-slate-900 font-medium" />
              <div className="flex gap-3 pt-1">
                <button onClick={closeEdit} className="flex-1 py-2.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
                <button onClick={handleSavePassword} disabled={saving} className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-700 transition-colors disabled:opacity-60">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL HAPUS KATEGORI ── */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-slide-up">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Kategori?</h3>
            <p className="text-slate-500 mb-6 text-sm">Apakah Anda yakin ingin menghapus kategori <strong>{categoryToDelete.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setCategoryToDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
              <button
                onClick={() => {
                  const updated = customCategories.filter(c => c.name !== categoryToDelete.name);
                  setCustomCategories(updated);
                  const key = username ? `moneyflow_custom_categories_${username}` : 'moneyflow_custom_categories';
                  localStorage.setItem(key, JSON.stringify(updated));
                  setCategoryToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30"
              >Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDIT KATEGORI ── */}
      {categoryToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-up border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Edit Kategori</h3>
            <p className="text-sm text-slate-500 mb-5">Edit preferensi untuk <strong>{categoryToEdit.name}</strong>.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warna di grafik</label>
                <div className="flex gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm cursor-pointer">
                    <input type="color" value={editCatColor} onChange={(e) => setEditCatColor(e.target.value)} className="absolute -inset-4 w-24 h-24 cursor-pointer" />
                  </div>
                  <input type="text" value={editCatColor} onChange={(e) => setEditCatColor(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-mono" />
                </div>
              </div>
              
              <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div>
                  <span className="block text-sm font-semibold text-slate-800">Aktifkan Kategori</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Tampil saat tambah transaksi baru</span>
                </div>
                <div className="relative">
                  <input type="checkbox" checked={editCatEnabled} onChange={(e) => setEditCatEnabled(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCategoryToEdit(null)} className="flex-1 py-2.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
              <button onClick={saveEditCategory} className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm shadow-green-500/30">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
