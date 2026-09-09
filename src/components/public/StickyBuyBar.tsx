'use client';

import React from 'react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';

interface StickyBuyBarProps {
  productId: string;
  price: number;
  isAvailable: boolean;
}

export function StickyBuyBar({ productId, price, isAvailable }: StickyBuyBarProps) {
  return (
    <div className="fixed bottom-16 left-0 z-30 w-full border-t border-slate-200 bg-white/95 p-3 backdrop-blur-lg md:hidden dark:border-slate-800 dark:bg-slate-900/95 shadow-xl shadow-slate-900/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-slate-400">Total Harga</span>
          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
            {formatRupiah(price)}
          </span>
        </div>

        {isAvailable ? (
          <Link
            href={`/checkout?productId=${productId}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            Beli Sekarang
          </Link>
        ) : (
          <button
            disabled
            className="min-h-[44px] rounded-xl bg-slate-200 px-6 py-2.5 text-sm font-bold text-slate-400 cursor-not-allowed dark:bg-slate-800"
          >
            Stok Habis
          </button>
        )}
      </div>
    </div>
  );
}
