'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/database';
import { formatRupiah } from '@/lib/utils';
import { FaIcon } from '@/components/ui/FaIcon';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock_type === 'limited' && (product.stock_qty ?? 0) <= 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="clay-card clay-card-hover group relative flex flex-col overflow-hidden rounded-[26px] p-3 sm:p-4 transition-all"
    >
      {/* Thumbnail with rounded inner borders */}
      <Link href={`/produk/${product.slug}`} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-inner">
        <Image
          src={product.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Category Pill Badge */}
        {product.category && (
          <div className="absolute top-2.5 left-2.5 rounded-xl bg-slate-950/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-sm">
            {product.category.name}
          </div>
        )}

        {/* Stock / Download Badge */}
        <div className="absolute bottom-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="rounded-xl bg-rose-500/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Habis
            </span>
          ) : product.stock_type === 'limited' ? (
            <span className="rounded-xl bg-amber-500/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Sisa {product.stock_qty}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-600/95 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <FaIcon name="arrow-down-to-line" className="text-[10px]" /> Instan
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col pt-3 sm:pt-4">
        <Link href={`/produk/${product.slug}`} className="flex-1">
          <h3 className="line-clamp-2 text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Investasi</span>
            <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
              {formatRupiah(product.price)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400">
              {product.sold_count > 0 ? `${product.sold_count} terjual` : 'Baru'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
