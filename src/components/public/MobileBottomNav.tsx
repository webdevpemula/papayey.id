'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaIcon } from '@/components/ui/FaIcon';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: 'house' },
    { label: 'Kategori', href: '/kategori/semua', icon: 'grid' },
    { label: 'Cari', href: '/cari', icon: 'magnifying-glass' },
    { label: 'Status', href: '/order/cek', icon: 'newspaper' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-slate-200 bg-white/95 backdrop-blur-lg md:hidden dark:border-slate-800 dark:bg-slate-900/95 shadow-lg shadow-black/5">
      <div className="grid h-16 grid-cols-4 items-center px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <FaIcon name={item.icon} className="text-lg" />
              <span className="text-[11px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
