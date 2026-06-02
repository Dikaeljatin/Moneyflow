'use client';

import { useState } from 'react';
import { CategoryData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import type { Category } from '@/lib/types';

import CategoryIcon from '@/components/CategoryIcon';

interface DonutChartProps {
  data: CategoryData[];
  size?: number;
}

export default function DonutChart({
  data,
  size = 220,
}: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <svg width={size} height={size} viewBox="0 0 200 200">
          <defs>
            <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e6f2ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#d6ebff" stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="url(#emptyGradient)"
            strokeWidth="32"
            strokeLinecap="round"
          />
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="14"
            fontWeight="600"
          >
            Belum ada
          </text>
          <text
            x="100"
            y="110"
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="500"
          >
            data pengeluaran
          </text>
        </svg>
      </div>
    );
  }

  const radius = 70;
  const cx = 100;
  const cy = 100;
  const strokeWidth = 32;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;
  const segments = data.map((d, i) => {
    const percentage = d.amount / total;
    const dashLength = percentage * circumference;
    const dashOffset = -accumulatedOffset;
    accumulatedOffset += dashLength;

    return {
      ...d,
      dashLength,
      dashOffset,
      index: i,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          className="transform -rotate-90 drop-shadow-lg"
        >
          <defs>
            {/* Shadow filter */}
            <filter id="donutShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Segments */}
          {segments.map((seg) => (
            <circle
              key={seg.category}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={hoveredIndex === seg.index ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer"
              style={{
                opacity: hoveredIndex === null || hoveredIndex === seg.index ? 1 : 0.4,
                filter: hoveredIndex === seg.index ? `drop-shadow(0 0 12px ${seg.color}80)` : 'none',
              }}
              onMouseEnter={() => setHoveredIndex(seg.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {hoveredIndex !== null ? (
            <div className="text-center animate-fade-in">
              <p className="text-xs text-text-muted font-bold mb-1 uppercase tracking-wide">
                {segments[hoveredIndex].category}
              </p>
              <p className="text-2xl font-bold mb-1" style={{ color: segments[hoveredIndex].color }}>
                {segments[hoveredIndex].percentage.toFixed(1)}%
              </p>
              <p className="text-xs text-text-secondary font-bold">
                {formatCurrency(segments[hoveredIndex].amount)}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs text-text-muted font-bold mb-1 uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-text-primary">
                {formatCurrency(total)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 w-full max-w-[320px]">
        {data.map((d, i) => (
          <div
            key={d.category}
            className="flex items-center gap-2.5 cursor-pointer transition-all duration-200 p-2 rounded-lg hover:bg-surface-2/50"
            style={{
              opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.4,
              transform: hoveredIndex === i ? 'scale(1.05)' : 'scale(1)',
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center shadow-sm"
              style={{ backgroundColor: d.color + '20', color: d.color }}
            >
              <CategoryIcon category={d.category} size={16} />
            </div>
            <span className="text-xs text-text-secondary truncate font-bold">
              {d.category}
            </span>
            <span className="text-xs font-bold ml-auto" style={{ color: d.color }}>
              {d.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

