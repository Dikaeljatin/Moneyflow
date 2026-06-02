'use client';

import { useEffect, useState } from 'react';
import type { Category } from '@/lib/types';

interface CategoryIconProps {
  category: Category;
  size?: number;
  className?: string;
}

const defaultIcons: Record<string, string> = {
  'Uang Bulanan': '💰',
  'Gaji': '💳',
  'Bisnis': '🏢',
  'Nongkrong': '☕',
  'Transportasi': '🚗',
  'Belanja': '🛍️',
  'Hiburan': '🎮',
};

export default function CategoryIcon({ category, size = 20, className = '' }: CategoryIconProps) {
  const [icon, setIcon] = useState<string>(defaultIcons[category as string] || '📁');

  useEffect(() => {
    if (defaultIcons[category as string]) {
      setIcon(defaultIcons[category as string]);
      return;
    }

    const saved = localStorage.getItem('moneyflow_custom_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const customCat = parsed.find((c: any) => c.name === category);
        if (customCat && customCat.icon) {
          setIcon(customCat.icon);
        }
      } catch (e) {}
    }
  }, [category]);

  return (
    <span style={{ fontSize: `${size * 0.8}px`, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} className={className}>
      {icon}
    </span>
  );
}
