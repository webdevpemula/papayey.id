'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Category } from '@/types/database';
import { Heart, Code2, Gamepad2, Landmark, Sparkles, BookOpen, Layout, Video } from 'lucide-react';

interface CategoryPillsProps {
  categories: Category[];
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  const pathname = usePathname();

  const getIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'heart':
      case 'ayah':
      case 'dad':
      case 'dad-corner':
        return Heart;
      case 'code':
      case 'engineer':
      case 'engineer-corner':
        return Code2;
      case 'gamepad':
      case 'gamer':
      case 'gamer-corner':
        return Gamepad2;
      case 'landmark':
      case 'asn':
      case 'asn-corner':
      case 'briefcase':
        return Landmark;
      case 'book':
        return BookOpen;
      case 'template':
        return Layout;
      case 'video':
        return Video;
      default:
        return Sparkles;
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
          <Sparkles className="h-4 w-4" />
          Semua Produk
        </Link>

        {categories.map((cat) => {
          const IconComponent = getIcon(cat.icon);
          const isActive = pathname === `/kategori/${cat.slug}`;

          return (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                isActive ? 'clay-pill-active' : 'clay-pill-inactive hover:scale-[1.02]'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
