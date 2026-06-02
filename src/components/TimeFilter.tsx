'use client';

import { useState, useEffect } from 'react';
import { getMonthStartEnd, getWeekStartEnd, formatWeekRangeString, formatMonthString } from '@/lib/utils';

export type TimeFilterMode = 'week' | 'month' | 'range';

interface TimeFilterProps {
  mode: TimeFilterMode;
  onModeChange: (mode: TimeFilterMode) => void;
  onDateRangeChange: (start: Date, end: Date) => void;
}

export default function TimeFilter({ mode, onModeChange, onDateRangeChange }: TimeFilterProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  useEffect(() => {
    if (mode === 'week') {
      const { start, end } = getWeekStartEnd(currentDate);
      onDateRangeChange(start, end);
    } else if (mode === 'month') {
      const { start, end } = getMonthStartEnd(currentDate);
      onDateRangeChange(start, end);
    }
  }, [mode, currentDate]);

  useEffect(() => {
    if (mode === 'range' && customStart && customEnd) {
      const start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      if (start <= end) {
        onDateRangeChange(start, end);
      }
    }
  }, [mode, customStart, customEnd]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (mode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (mode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (mode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (mode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDisplayText = () => {
    if (mode === 'week') {
      const { start, end } = getWeekStartEnd(currentDate);
      return formatWeekRangeString(start, end);
    } else if (mode === 'month') {
      return formatMonthString(currentDate);
    }
    return 'Pilih Rentang Tanggal';
  };

  return (
    <div className="flex flex-col gap-3 min-w-[300px]">
      {/* Tabs */}
      <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 backdrop-blur-sm shadow-sm">
        <button
          onClick={() => onModeChange('week')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mode === 'week'
              ? 'bg-white text-accent-red shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Minggu
        </button>
        <button
          onClick={() => onModeChange('month')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mode === 'month'
              ? 'bg-white text-accent-red shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Bulan
        </button>
        <button
          onClick={() => onModeChange('range')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mode === 'range'
              ? 'bg-white text-accent-red shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Rentang
        </button>
      </div>

      {/* Date Navigation or Custom Inputs */}
      {mode !== 'range' ? (
        <div className="flex items-center justify-between px-2 py-1">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-accent-red transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <span className="text-sm font-bold text-slate-800">
            {getDisplayText()}
          </span>
          
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-accent-red transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 justify-center px-1">
          <input 
            type="date" 
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="flex-1 min-w-0 text-xs px-2 py-2 border border-slate-200 rounded-lg outline-none focus:border-accent-red"
          />
          <span className="text-slate-400 font-bold">-</span>
          <input 
            type="date" 
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="flex-1 min-w-0 text-xs px-2 py-2 border border-slate-200 rounded-lg outline-none focus:border-accent-red"
          />
        </div>
      )}
    </div>
  );
}
