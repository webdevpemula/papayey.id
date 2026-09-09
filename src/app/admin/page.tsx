import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatRupiah, formatDate } from '@/lib/utils';
import { DollarSign, ShoppingBag, Clock, CheckCircle2, PackagePlus, ArrowUpRight } from 'lucide-react';

export const revalidate = 0; // Dynamic dashboard

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  let totalRevenue = 0;
  let totalPaidOrders = 0;
  let totalPendingOrders = 0;
  let recentOrders: any[] = [];
  let topProducts: any[] = [];

  try {
    const { data: orders } = await supabase.from('orders').select('*, product:products(*)').order('created_at', { ascending: false });

    if (orders) {
      recentOrders = orders.slice(0, 5);
      orders.forEach((o) => {
        if (o.status === 'paid') {
          totalRevenue += o.price || 0;
          totalPaidOrders += 1;
        } else if (o.status === 'pending') {
          totalPendingOrders += 1;
        }
      });
    }

    const { data: prods } = await supabase.from('products').select('*').order('sold_count', { ascending: false }).limit(4);
    if (prods) topProducts = prods;
  } catch (err) {
    console.error('Admin dashboard query error:', err);
  }

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Dashboard Ringkasan</h1>
          <p className="text-xs text-slate-500">Statistik performa penjualan marketplace produk digital papayey.id</p>
        </div>
        <Link
          href="/admin/produk/baru"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all self-start"
        >
          <PackagePlus className="h-4 w-4" />
          Tambah Produk Baru
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Omzet</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{formatRupiah(totalRevenue)}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Order Berhasil (Paid)</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{totalPaidOrders} Transaksi</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Order Pending</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{totalPendingOrders} Menunggu</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Koleksi Produk</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{topProducts.length} Produk</h3>
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Transaksi Terbaru</h2>
          <Link href="/admin/order" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            Lihat Semua <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Belum ada transaksi masuk.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 font-semibold">KODE</th>
                  <th className="py-2.5 font-semibold">PEMBELI</th>
                  <th className="py-2.5 font-semibold">PRODUK</th>
                  <th className="py-2.5 font-semibold">HARGA</th>
                  <th className="py-2.5 font-semibold">STATUS</th>
                  <th className="py-2.5 font-semibold">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{order.order_code}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{order.buyer_email}</td>
                    <td className="py-3 font-medium text-slate-900 dark:text-white line-clamp-1">{order.product?.title || 'Produk'}</td>
                    <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">{formatRupiah(order.price)}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link href={`/admin/order/${order.id}`} className="text-indigo-600 font-bold hover:underline">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
