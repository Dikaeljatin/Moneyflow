'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useCallback } from 'react';

// --- SVG Icons ---
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const IncomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
);

const ExpenseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </svg>
);

const GoalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/income', label: 'Pemasukan', icon: IncomeIcon },
  { href: '/expenses', label: 'Pengeluaran', icon: ExpenseIcon },
  { href: '/goals', label: 'Target', icon: GoalIcon },
  { href: '/profile', label: 'Akun', icon: ProfileIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Swipe-to-close state
  const touchStartY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const isDragging = useRef(false);

  const confirmLogout = () => {
    localStorage.removeItem('moneyflow_authenticated');
    router.replace('/login');
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) {
      setDragY(delta);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = '';
    }
    if (dragY > 120) {
      setIsMobileOpen(false);
    }
    setDragY(0);
    isDragging.current = false;
    touchStartY.current = null;
  }, [dragY]);

  return (
    <>
      {/* ── Mobile Header ─────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 bg-white/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-red flex items-center justify-center font-bold text-white shadow-lg shadow-accent-red/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold text-text-primary tracking-tight">MoneyFlow</span>
            <p className="text-[10px] text-text-muted -mt-0.5">Kelola Keuangan</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="btn-icon"
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* ── Mobile Bottom Sheet Overlay ───────────────────── */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          style={{ animation: 'fadeIn 0.2s ease' }}
        />
      )}

      {/* ── Mobile Bottom Sheet ───────────────────────────── */}
      <div
        ref={sheetRef}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out"
        style={{
          transform: isMobileOpen
            ? `translateY(${dragY}px)`
            : 'translateY(100%)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl gradient-red flex items-center justify-center shadow-md shadow-accent-red/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary leading-none">MoneyFlow</p>
              <p className="text-[10px] text-text-muted">Menu Utama</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-text-muted hover:bg-slate-200 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Nav Items Grid */}
        <div className="px-4 py-4 grid grid-cols-5 gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                id={`nav-mobile-${item.href.slice(1)}`}
                className={`
                  flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl text-center
                  transition-all duration-200 relative
                  ${isActive
                    ? 'bg-gradient-to-b from-accent-red/10 to-accent-red/5 text-accent-red'
                    : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
                )}
                <div className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  <item.icon />
                </div>
                <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Keluar Button */}
        <div className="px-4 pb-4 pt-1 border-t border-border/50">
          <button
            onClick={() => { setIsMobileOpen(false); setShowLogoutModal(true); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-semibold border border-red-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Keluar
          </button>
        </div>
      </div>

      {/* ── Desktop Sidebar ───────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[280px] h-full bg-white border-r border-border">
        {/* Logo */}
        <div className="flex items-center gap-4 px-6 pt-8 pb-6 mb-6 animate-fade-in border-b border-border/50">
          <div className="w-12 h-12 rounded-2xl gradient-red flex items-center justify-center font-bold text-white shadow-lg shadow-accent-red/30 relative">
            <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse"></div>
            <svg className="relative" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">MoneyFlow</h1>
            <p className="text-xs text-text-muted font-medium">Kelola Keuanganmu</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-3 mb-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Menu Utama
          </p>
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.href.slice(1)}`}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold
                  transition-all duration-300 group relative overflow-hidden
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-accent-red/10 to-accent-red/5 text-accent-red shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/70'
                  }
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {isActive && (
                  <>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-accent-red to-accent-red-dark shadow-lg shadow-accent-red/50" />
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-red/5 to-transparent opacity-50"></div>
                  </>
                )}
                <div className={`relative z-10 flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                  <item.icon />
                </div>
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-accent-red animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-5 border-t border-border bg-gradient-to-br from-surface-2/30 to-white flex flex-col gap-3">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-semibold border border-red-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* ── Logout Confirmation Modal ─────────────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-up border border-border text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Yakin ingin keluar?</h3>
            <p className="text-sm text-text-secondary mb-6">
              Sesi Anda akan berakhir dan Anda harus login kembali untuk masuk.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl bg-surface-2 text-text-secondary font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
