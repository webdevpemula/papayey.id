'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Category } from '@/types/database';
import { FaIcon } from '@/components/ui/FaIcon';

interface CategoryPillsProps {
  categories: Category[];
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  const pathname = usePathname();

  const getFaIconName = (iconName: string | null) => {
    switch (iconName) {
      case 'heart':
      case 'ayah':
      case 'dad':
      case 'dad-corner':
        return 'heart';
      case 'code':
      case 'engineer':
      case 'engineer-corner':
        return 'code';
      case 'gamepad':
      case 'gamer':
      case 'gamer-corner':
        return 'gamepad';
      case 'landmark':
      case 'asn':
      case 'asn-corner':
      case 'briefcase':
        return 'landmark';
      case 'book':
        return 'file';
      case 'template':
        return 'layer-group';
      case 'video':
        return 'box';
      default:
        return 'wand-magic-sparkles';
    }
  };

  const isAll = pathname === '/' || pathname === '/kategori/semua';

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-3 min-w-max px-1">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all active:scale-95 ${
            isAll ? 'clay-pill-active' : 'clay-pill-inactive hover:scale-[1.02]'
          }`}
        >
          <FaIcon name="wand-magic-sparkles" className="text-sm" />
          Semua Produk
        </Link>

        {categories.map((cat) => {
          const iconName = getFaIconName(cat.icon);
          const isActive = pathname === `/kategori/${cat.slug}`;

          return (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                isActive ? 'clay-pill-active' : 'clay-pill-inactive hover:scale-[1.02]'
              }`}
            >
              <FaIcon name={iconName} className="text-sm" />
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
