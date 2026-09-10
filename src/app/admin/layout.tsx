'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { FaIcon } from '@/components/ui/FaIcon';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, render without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {}
    router.push('/admin/login');
  };

  const navs = [
    { label: 'Ringkasan', href: '/admin', icon: 'chart-simple' },
    { label: 'Produk Digital', href: '/admin/produk', icon: 'box-archive' },
    { label: 'Kategori', href: '/admin/kategori', icon: 'folder-tree' },
    { label: 'Order Transaksi', href: '/admin/order', icon: 'cart-shopping' },
    { label: 'Kelola Iklan', href: '/admin/iklan', icon: 'rectangle-ad' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shrink-0">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 p-1 border border-indigo-100 dark:border-indigo-900/50">
              <Image
                src="/logo-icon.png"
                alt="papayey.id"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 dark:text-white">papayey<span className="text-indigo-600">.id</span></span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Owner Dashboard</p>
            </div>
          </div>
          <Link href="/" className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1">
            <FaIcon name="arrow-left" className="text-[10px]" /> Toko
          </Link>
        </div>

        <nav className="mt-6 space-y-1">
          {navs.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <FaIcon name={item.icon} className="text-sm" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
          >
            <FaIcon name="arrow-left-from-bracket" className="text-sm" />
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
