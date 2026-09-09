'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah, formatDate } from '@/lib/utils';
import { Order } from '@/types/database';
import { Loader2 } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const supabase = createClient();
      let query = supabase.from('orders').select('*, product:products(*)').order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      if (data) setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Order & Transaksi</h1>
          <p className="text-xs text-slate-500">Pantau seluruh order masuk, status pembayaran, dan email unduhan.</p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'pending', 'paid', 'expired', 'failed', 'refunded'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-400">Tidak ada order pada filter ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 p-3 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">KODE</th>
                  <th className="py-3 px-4 font-semibold">PEMBELI</th>
                  <th className="py-3 px-4 font-semibold">PRODUK</th>
                  <th className="py-3 px-4 font-semibold">HARGA</th>
                  <th className="py-3 px-4 font-semibold">STATUS</th>
                  <th className="py-3 px-4 font-semibold">TANGGAL</th>
                  <th className="py-3 px-4 font-semibold text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">#{o.order_code}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{o.buyer_email}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white line-clamp-1">{o.product?.title || 'Produk'}</td>
                    <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">{formatRupiah(o.price)}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        o.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        o.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(o.created_at)}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/order/${o.id}`} className="text-indigo-600 font-bold hover:underline">
                        Kelola
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
