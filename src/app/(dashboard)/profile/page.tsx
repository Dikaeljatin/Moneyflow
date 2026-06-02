'use client';

import { useState, useEffect } from 'react';

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
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const MailIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const CalendarIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const ChevronRightIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

interface CustomCategory {
  name: string;
  icon: string;
  color: string;
  isCustom: boolean;
  type: 'income' | 'expense';
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
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [joinDate, setJoinDate] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'akun' | 'personalisasi'>('akun');

  // Personalisasi State
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [newCatColor, setNewCatColor] = useState('#136f2b');
  const [categoryToDelete, setCategoryToDelete] = useState<CustomCategory | null>(null);

  useEffect(() => {
    // Load profile info
    const storedUsername = localStorage.getItem('moneyflow_username');
    const displayName = storedUsername || 'M. Agradika Ridhal Eljatin';
    const formattedEmail = displayName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@gmail.com';
    setUsername(displayName);
    setEmail(storedUsername ? formattedEmail : 'agradikaeljatin@gmail.com');
    setJoinDate('2 Juni 2026');

    // Load custom categories
    const savedCats = localStorage.getItem('moneyflow_custom_categories');
    if (savedCats) {
      try { setCustomCategories(JSON.parse(savedCats)); } catch (e) {}
    }
  }, []);

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(newCatColor);
    const finalColor = isValidHex ? newCatColor : '#136f2b';

    const newCat: CustomCategory = {
      name: newCatName.trim(),
      icon: newCatIcon.trim(),
      color: finalColor,
      isCustom: true,
      type: categoryType
    };

    const updated = [...customCategories, newCat];
    setCustomCategories(updated);
    localStorage.setItem('moneyflow_custom_categories', JSON.stringify(updated));

    setNewCatName('');
    setNewCatIcon('');
    setNewCatColor(categoryType === 'income' ? '#10b981' : '#136f2b');
  };

  const initial = username ? username.charAt(0).toUpperCase() : 'M';
  const displayedDefaultCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
  const displayedCustomCategories = customCategories;
  const totalCategories = displayedDefaultCategories.length + displayedCustomCategories.length;

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

      {activeTab === 'akun' && (
        <div className="space-y-6 animate-slide-up">
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0d5924] to-[#127932] flex items-center justify-center shadow-lg shadow-[#0d5924]/20 flex-shrink-0">
              <span className="text-3xl font-bold text-white">{initial}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-slate-900 truncate tracking-tight mb-1">
                {username}
              </h2>
              <p className="text-slate-500 truncate font-medium">
                {email}
              </p>
            </div>
          </div>

          {/* Details List Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Nama */}
            <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer group border-b border-slate-100/80">
              <div className="flex items-center gap-5">
                <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                  <UserIcon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-0.5">Nama</p>
                  <p className="text-base font-semibold text-slate-800">{username}</p>
                </div>
              </div>
              <ChevronRightIcon size={20} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer group border-b border-slate-100/80">
              <div className="flex items-center gap-5">
                <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                  <MailIcon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-0.5">Email</p>
                  <p className="text-base font-semibold text-slate-800">{email}</p>
                </div>
              </div>
              <ChevronRightIcon size={20} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
            </div>

            {/* Bergabung */}
            <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-5">
                <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-0.5">Bergabung</p>
                  <p className="text-base font-semibold text-slate-800">{joinDate}</p>
                </div>
              </div>
              <ChevronRightIcon size={20} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'personalisasi' && (
        <div className="space-y-6 animate-slide-up">
          {/* Header Card / Form */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Kategori Baru</h2>
                  <p className="text-sm text-slate-500">
                    Tambah kategori sesuai kebiasaanmu.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipe kategori</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="catType" 
                      checked={categoryType === 'expense'} 
                      onChange={() => setCategoryType('expense')}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-slate-700">Pengeluaran</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="catType" 
                      checked={categoryType === 'income'} 
                      onChange={() => setCategoryType('income')}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-slate-700">Pemasukan</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama kategori</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Contoh: Langganan app"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ikon (opsional)</label>
                <input
                  type="text"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  placeholder="Ketik emoji atau simbol pendek — kosongkan untuk default"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-1.5">Bisa pakai keyboard emoji di ponsel atau tempel simbol apa pun yang pendek.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warna di grafik</label>
                <div className="flex gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm cursor-pointer">
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="absolute -inset-4 w-24 h-24 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    placeholder="#136f2b"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-mono"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Pakai kotak warna atau ketik kode hex (#RGB atau #RRGGBB). Tidak valid akan diganti hijau default saat menyimpan.</p>
              </div>

              <button
                onClick={handleAddCategory}
                className="mt-2 btn-primary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Tambah kategori
              </button>
            </div>
          </div>

          {/* List Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Daftar kategori (Semua)</h3>
              <p className="text-sm text-slate-500">{totalCategories} kategori</p>
            </div>
            
            <div className="divide-y divide-slate-100/80">
              {[...displayedDefaultCategories, ...displayedCustomCategories].map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      {cat.icon || <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-800 leading-tight">{cat.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {cat.type === 'income' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 tracking-wider">
                            PEMASUKAN
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 tracking-wider">
                            PENGELUARAN
                          </span>
                        )}
                        {cat.isCustom ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 tracking-wider">
                            KUSTOM
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 tracking-wider">
                            BAWAAN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {cat.isCustom && (
                    <button 
                      onClick={() => setCategoryToDelete(cat)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 opacity-100 group-hover:bg-slate-100"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-slide-up">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Kategori?</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Apakah Anda yakin ingin menghapus kategori <strong>{categoryToDelete.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const updated = customCategories.filter(c => c.name !== categoryToDelete.name);
                  setCustomCategories(updated);
                  localStorage.setItem('moneyflow_custom_categories', JSON.stringify(updated));
                  setCategoryToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
