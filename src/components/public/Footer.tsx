import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ShieldCheck, Zap, Download } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pb-24 md:pb-8 pt-12 dark:border-slate-800 dark:bg-slate-950 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Trust Value Props */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 border-b border-slate-100 pb-10 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Unduhan Instan</h4>
              <p className="text-xs text-slate-500">File langsung dapat diunduh otomatis setelah pembayaran berhasil.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pembayaran Aman</h4>
              <p className="text-xs text-slate-500">Mendukung QRIS, Virtual Account, GoPay via Midtrans terverifikasi.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Garansi Akses Link</h4>
              <p className="text-xs text-slate-500">Link download juga otomatis dikirimkan ke email aktif Anda.</p>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 p-0.5 border border-indigo-100 dark:border-indigo-900/50">
              <Image
                src="/logo-icon.png"
                alt="papayey.id logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">papayey.id</span>
            <span>&copy; {new Date().getFullYear()} — Semua hak cipta dilindungi.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/order/cek" className="hover:text-indigo-600 transition-colors">Cek Status Order</Link>
            <Link href="/admin/login" className="hover:text-indigo-600 transition-colors">Area Pemilik</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
