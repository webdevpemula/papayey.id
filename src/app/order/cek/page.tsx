'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaIcon } from '@/components/ui/FaIcon';

export default function CheckOrderPage() {
  const router = useRouter();
  const [orderCode, setOrderCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderCode.trim()) {
      router.push(`/order/${encodeURIComponent(orderCode.trim().toUpperCase())}/status`);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center space-y-6">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        <FaIcon name="newspaper" className="text-3xl" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Cek Status Pesanan</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Masukkan Kode Order (contoh: <span className="font-mono font-semibold">INV-20260906-XXXX</span>) untuk memantau status atau mengakses kembali link download Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="INV-YYYYMMDD-XXXX"
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value)}
          required
          className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm font-mono tracking-wider text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Cek Status Sekarang
          <FaIcon name="arrow-right" className="text-sm" />
        </button>
      </form>
    </div>
  );
}
