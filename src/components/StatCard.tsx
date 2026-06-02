'use client';

import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'green' | 'red' | 'violet' | 'blue' | 'default';
  delay?: number;
}

export default function StatCard({
  label,
  value,
  trend,
  trendValue,
  variant = 'default',
  delay = 0,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 1000;
    const steps = 40;
    const stepValue = value / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(stepValue * step, value);
      setDisplayValue(Math.round(current));
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, isVisible]);

  const iconBgMap = {
    green: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    red: 'bg-gradient-to-br from-rose-50 to-rose-100',
    violet: 'bg-gradient-to-br from-violet-50 to-violet-100',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100',
    default: 'bg-gradient-to-br from-slate-50 to-slate-100',
  };

  const iconColorMap = {
    green: 'text-accent-green',
    red: 'text-accent-red',
    violet: 'text-accent-violet',
    blue: 'text-accent-blue',
    default: 'text-text-secondary',
  };

  const borderAccent = {
    green: 'border-l-accent-green',
    red: 'border-l-accent-red',
    violet: 'border-l-accent-violet',
    blue: 'border-l-accent-blue',
    default: 'border-l-slate-300',
  };

  const glowColor = {
    green: 'shadow-accent-green/20',
    red: 'shadow-accent-red/20',
    violet: 'shadow-accent-violet/20',
    blue: 'shadow-accent-blue/20',
    default: 'shadow-slate-300/20',
  };

  return (
    <div
      ref={ref}
      className={`
        glass-card p-6 border-l-[4px] ${borderAccent[variant]} relative overflow-hidden group
        ${isVisible ? 'animate-slide-up' : 'opacity-0'}
        hover:shadow-2xl ${glowColor[variant]} transition-all duration-500
      `}
      style={{ animationDelay: `${delay * 100}ms`, animationFillMode: 'both' }}
    >
      {/* Enhanced background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-surface-2/50 to-transparent rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-surface-3/30 to-transparent rounded-full blur-2xl -ml-16 -mb-16 group-hover:scale-125 transition-transform duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${iconBgMap[variant]} ${iconColorMap[variant]} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {variant === 'green' && (
                <>
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </>
              )}
              {variant === 'red' && (
                <>
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </>
              )}
              {variant === 'violet' && (
                <>
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </>
              )}
              {variant === 'blue' && (
                <>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </>
              )}
              {variant === 'default' && (
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              )}
            </svg>
          </div>
          {trend && trendValue && (
            <span
              className={`badge ${
                trend === 'up' ? 'badge-green' : trend === 'down' ? 'badge-red' : 'bg-slate-100 text-text-secondary'
              }`}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary mb-3 font-semibold tracking-wide uppercase opacity-80">{label}</p>
        <p className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
          {formatCurrency(displayValue)}
        </p>
      </div>
    </div>
  );
}
