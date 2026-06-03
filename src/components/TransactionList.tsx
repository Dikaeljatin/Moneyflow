'use client';

import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate, getCategoryColor } from '@/lib/utils';
import CategoryIcon from '@/components/CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
  showActions?: boolean;
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
}

export default function TransactionList({
  transactions,
  limit,
  showActions = false,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const items = limit ? transactions.slice(0, limit) : transactions;

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-surface-2 to-surface-3 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <p className="text-text-secondary text-sm font-medium">Belum ada transaksi</p>
        <p className="text-text-muted text-xs mt-1">Mulai tambahkan transaksi pertamamu</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((t, i) => {
        const catColor = getCategoryColor(t.category);
        return (
        <div
          key={t.id}
          className="flex items-start gap-3 p-4 rounded-2xl hover:bg-surface-2/60 transition-all duration-300 group animate-fade-in border border-transparent hover:border-border hover:shadow-sm"
          style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
        >
          {/* Category Icon */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 mt-0.5"
            style={{ backgroundColor: catColor + '15', color: catColor, borderWidth: 2, borderColor: catColor + '30' }}
          >
            <CategoryIcon category={t.category} size={20} />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary break-words mb-0.5">
              {t.description}
            </p>
            <p className="text-xs text-text-muted font-medium">
              {formatDate(t.date)}
            </p>
            {/* Amount on mobile */}
            <p
              className={`text-sm font-bold mt-1 sm:hidden ${
                t.type === 'income' ? 'text-accent-green' : 'text-accent-red'
              }`}
            >
              {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
            </p>
          </div>

          {/* Amount — desktop only */}
          <div className="hidden sm:block text-right shrink-0">
            <p
              className={`text-base font-bold ${
                t.type === 'income' ? 'text-accent-green' : 'text-accent-red'
              }`}
            >
              {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
            </p>
          </div>

          {/* Actions — always visible on mobile, hover-only on desktop */}
          {showActions && (
            <div className="flex gap-1.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
              {onEdit && (
                <button
                  onClick={() => onEdit(t)}
                  className="btn-icon text-sm w-9 h-9"
                  title="Edit"
                  aria-label={`Edit ${t.description}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(t.id)}
                  className="btn-icon text-sm w-9 h-9 hover:!bg-rose-50 hover:!text-accent-red hover:!border-rose-200"
                  title="Hapus"
                  aria-label={`Hapus ${t.description}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}
