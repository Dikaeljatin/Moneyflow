'use client';

import { FinancialGoal } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface GoalCardProps {
  goal: FinancialGoal;
  onAddFunds: (id: string) => void;
  onEdit: (goal: FinancialGoal) => void;
  onDelete: (id: string) => void;
  delay?: number;
}

export default function GoalCard({
  goal,
  onAddFunds,
  onEdit,
  onDelete,
  delay = 0,
}: GoalCardProps) {
  const progress = Math.min(
    (goal.currentAmount / goal.targetAmount) * 100,
    100
  );
  const remaining = goal.targetAmount - goal.currentAmount;
  const isComplete = progress >= 100;

  // SVG ring progress
  const ringSize = 90;
  const strokeWidth = 7;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Deadline
  const deadline = new Date(goal.deadline);
  const now = new Date();
  const daysLeft = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysLeft < 0;

  return (
    <div
      className="glass-card p-6 animate-slide-up relative overflow-hidden"
      style={{ animationDelay: `${delay * 100}ms`, animationFillMode: 'both' }}
    >
      {/* Background decoration */}
      <div 
        className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 -mr-20 -mt-20"
        style={{ backgroundColor: goal.color }}
      ></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-text-primary mb-1 truncate">
            {goal.name}
          </h3>
          <div className="flex items-center gap-2">
            {isComplete ? (
              <span className="badge badge-green text-[11px]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Tercapai!
              </span>
            ) : isOverdue ? (
              <span className="badge badge-red text-[11px]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Melewati {Math.abs(daysLeft)} hari
              </span>
            ) : (
              <span className="badge badge-blue text-[11px]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {daysLeft} hari tersisa
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0 ml-3">
          <button
            onClick={() => onEdit(goal)}
            className="btn-icon w-9 h-9 text-sm"
            title="Edit"
            aria-label={`Edit target ${goal.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="btn-icon w-9 h-9 text-sm hover:!bg-rose-50 hover:!text-accent-red hover:!border-rose-200"
            title="Hapus"
            aria-label={`Hapus target ${goal.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Ring + Info */}
      <div className="flex items-center gap-6 mb-5 relative z-10">
        <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} className="transform -rotate-90 drop-shadow-md">
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="#e8ecf2"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={goal.color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 4px ${goal.color}40)` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-lg font-bold"
              style={{ color: goal.color }}
            >
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs text-text-muted mb-2 font-semibold">
            <span>Terkumpul</span>
            <span>Target</span>
          </div>
          <div className="flex justify-between text-base font-bold text-text-primary mb-3">
            <span>{formatCurrency(goal.currentAmount)}</span>
            <span>{formatCurrency(goal.targetAmount)}</span>
          </div>

          {/* Linear progress bar */}
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{
                width: `${progress}%`,
                backgroundColor: goal.color,
              }}
            />
          </div>

          {!isComplete && (
            <p className="text-xs text-text-muted mt-2 font-semibold">
              Kurang {formatCurrency(remaining)} lagi
            </p>
          )}
        </div>
      </div>

      {/* Add Funds Button */}
      {!isComplete && (
        <button
          onClick={() => onAddFunds(goal.id)}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative z-10"
          style={{
            background: `linear-gradient(135deg, ${goal.color}15, ${goal.color}08)`,
            color: goal.color,
            border: `2px solid ${goal.color}30`,
          }}
        >
          <span className="text-base mr-1">+</span> Tambah Dana
        </button>
      )}
    </div>
  );
}
