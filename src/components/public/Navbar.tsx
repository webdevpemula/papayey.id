'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, ShieldCheck, ReceiptText } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cari?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo with Clay Style */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="clay-btn-primary relative flex h-11 w-11 items-center justify-center rounded-2xl shadow-md overflow-hidden p-1 group-hover:scale-105 transition-transform">
            <Image
              src="/logo-icon.png"
              alt="papayey.id logo"
              width={36}
              height={36}
              priority
              className="object-contain drop-shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              papayey<span className="text-indigo-600 dark:text-indigo-400">.id</span>
            </span>
            <span className="hidden text-[10px] font-bold text-slate-400 sm:inline -mt-1 tracking-wider uppercase">
              Digital Marketplace
            </span>
          </div>
        </Link>

        {/* Clay Search Bar */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari blueprint, template, panduan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="clay-input w-full rounded-2xl py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
            />
          </div>
        </form>

        {/* Action Buttons & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/cari"
            className="sm:hidden clay-toggle flex h-10 w-10 items-center justify-center rounded-2xl text-slate-600 dark:text-slate-300"
            aria-label="Cari produk"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* Day & Night Theme Toggle Switch */}
          <ThemeToggle />

          <Link
            href="/order/cek"
            className="clay-btn-secondary inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all active:scale-95"
          >
            <ReceiptText className="h-4 w-4 text-indigo-500" />
            <span className="hidden sm:inline">Cek</span> Order
          </Link>

          <Link
            href="/admin"
            className="hidden md:inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-2 py-1"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin
          </Link>
        </div>

      </div>
    </header>
  );
}
