'use client';

import { useState, useEffect } from 'react';
import { MonthlyData } from '@/lib/types';
import { formatCompactCurrency, formatCurrency } from '@/lib/utils';

interface BarChartProps {
  data: MonthlyData[];
  height?: number;
}

export default function BarChart({ data, height = 320 }: BarChartProps) {
  const [animProgress, setAnimProgress] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<{
    index: number;
    type: 'income' | 'expense';
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const anim = requestAnimationFrame(function animate() {
        setAnimProgress((prev) => {
          if (prev >= 1) return 1;
          requestAnimationFrame(animate);
          return prev + 0.03;
        });
      });
      return () => cancelAnimationFrame(anim);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-text-muted text-sm">Belum ada data</p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1
  );
  const chartPadding = { top: 30, bottom: 60, left: 120, right: 20 };
  const chartHeight = height - chartPadding.top - chartPadding.bottom;
  const chartWidth = 1000 - chartPadding.left - chartPadding.right;
  const barGroupWidth = chartWidth / Math.max(data.length, 1);
  const barWidth = Math.min(barGroupWidth * 0.35, 40);
  const barGap = barWidth * 0.25;

  return (
    <div className="w-full flex flex-col">
      <div className="w-full relative" style={{ height }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 1000 ${height}`}
          className="overflow-visible"
        >
        <defs>
          {/* Gradients for bars */}
          <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#059669" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="1" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="1" />
          </linearGradient>
          
          {/* Shadow filters */}
          <filter id="barShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = chartPadding.top + chartHeight * (1 - frac);
          return (
            <g key={frac}>
              <line
                x1={chartPadding.left}
                y1={y}
                x2={1000 - chartPadding.right}
                y2={y}
                stroke={frac === 0 ? '#cbd5e1' : '#e2e8f0'}
                strokeWidth={frac === 0 ? '2' : '1'}
                strokeDasharray={frac === 0 ? '0' : '4,4'}
              />
              <text
                x={chartPadding.left - 15}
                y={y + 4}
                fill="#64748b"
                fontSize="12"
                fontWeight="600"
                textAnchor="end"
              >
                {formatCompactCurrency(maxValue * frac)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const groupX = chartPadding.left + i * barGroupWidth + barGroupWidth * 0.25;
          const incomeHeight = (d.income / maxValue) * chartHeight * animProgress;
          const expenseHeight = (d.expense / maxValue) * chartHeight * animProgress;

          const incomeY = chartPadding.top + chartHeight - incomeHeight;
          const expenseY = chartPadding.top + chartHeight - expenseHeight;

          const isHoveredIncome = hoveredBar?.index === i && hoveredBar.type === 'income';
          const isHoveredExpense = hoveredBar?.index === i && hoveredBar.type === 'expense';

          return (
            <g key={d.label}>
              {/* Income bar */}
              <rect
                x={groupX}
                y={incomeY}
                width={barWidth}
                height={incomeHeight}
                rx="6"
                fill="url(#incomeGradient)"
                opacity={hoveredBar === null || isHoveredIncome ? 1 : 0.5}
                className="transition-all duration-300 cursor-pointer"
                filter={isHoveredIncome ? 'url(#barShadow)' : 'none'}
                style={{
                  transform: isHoveredIncome ? 'scaleY(1.03)' : 'scaleY(1)',
                  transformOrigin: `${groupX + barWidth / 2}px ${chartPadding.top + chartHeight}px`,
                }}
                onMouseEnter={() => setHoveredBar({ index: i, type: 'income' })}
                onMouseLeave={() => setHoveredBar(null)}
              />

              {/* Expense bar */}
              <rect
                x={groupX + barWidth + barGap}
                y={expenseY}
                width={barWidth}
                height={expenseHeight}
                rx="6"
                fill="url(#expenseGradient)"
                opacity={hoveredBar === null || isHoveredExpense ? 1 : 0.5}
                className="transition-all duration-300 cursor-pointer"
                filter={isHoveredExpense ? 'url(#barShadow)' : 'none'}
                style={{
                  transform: isHoveredExpense ? 'scaleY(1.03)' : 'scaleY(1)',
                  transformOrigin: `${groupX + barWidth + barGap + barWidth / 2}px ${chartPadding.top + chartHeight}px`,
                }}
                onMouseEnter={() => setHoveredBar({ index: i, type: 'expense' })}
                onMouseLeave={() => setHoveredBar(null)}
              />

              {/* Month label */}
              <text
                x={groupX + barWidth + barGap / 2}
                y={chartPadding.top + chartHeight + 20}
                textAnchor="middle"
                fill="#475569"
                fontSize="13"
                fontWeight="700"
              >
                {d.month}
              </text>
              <text
                x={groupX + barWidth + barGap / 2}
                y={chartPadding.top + chartHeight + 38}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="11"
                fontWeight="600"
              >
                {d.year}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredBar !== null && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-surface-2/80 to-surface-3/60 border border-border/60 backdrop-blur-sm animate-fade-in">
          <div className="flex items-center justify-between gap-8">
            <div>
              <p className="text-xs text-text-muted font-semibold mb-1">
                {data[hoveredBar.index].month} {data[hoveredBar.index].label}
              </p>
              <p className="text-lg font-bold" style={{ 
                color: hoveredBar.type === 'income' ? '#10b981' : '#f43f5e' 
              }}>
                {formatCurrency(
                  hoveredBar.type === 'income' 
                    ? data[hoveredBar.index].income 
                    : data[hoveredBar.index].expense
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-secondary font-semibold mb-1">
                {hoveredBar.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </p>
              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                hoveredBar.type === 'income' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {((hoveredBar.type === 'income' 
                  ? data[hoveredBar.index].income 
                  : data[hoveredBar.index].expense
                ) / maxValue * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mt-5">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md" />
          <span className="text-sm text-text-secondary font-bold">Pemasukan</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 shadow-md" />
          <span className="text-sm text-text-secondary font-bold">Pengeluaran</span>
        </div>
      </div>
    </div>
  );
}
