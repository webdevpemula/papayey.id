'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah, formatDate } from '@/lib/utils';
import { Order } from '@/types/database';
import { ArrowLeft, RefreshCw, Send, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('orders').select('*, product:products(*)').eq('id', id).single();
      if (data) setOrder(data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleSyncMidtrans = async () => {
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/order/${id}/sync-midtrans`, { method: 'POST' });
      const data = await res.json();
      setMsg(data.message || 'Sinkronisasi status Midtrans berhasil.');
      fetchOrder();
    } catch (err: any) {
      setMsg(err.message || 'Gagal sinkronisasi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/order/${id}/resend-email`, { method: 'POST' });
      const data = await res.json();
      setMsg(data.message || 'Email tautan unduhan berhasil dikirim ulang.');
      fetchOrder();
    } catch (err: any) {
      setMsg(err.message || 'Gagal kirim ulang email');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    const reason = prompt('Masukkan alasan refund untuk transaksi ini:');
    if (!reason) return;

    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/order/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      setMsg(data.message || 'Status order diubah menjadi refunded.');
      fetchOrder();
    } catch (err: any) {
      setMsg(err.message || 'Gagal refund');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" /></div>;
  }

  if (!order) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-xs text-slate-500">Order tidak ditemukan.</p>
        <Link href="/admin/order" className="text-xs font-bold text-indigo-600 hover:underline">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/order" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Order
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Detail Order #{order.order_code}</h1>
          <p className="text-xs text-slate-500">Dibuat pada {formatDate(order.created_at)}</p>
        </div>

        <span className={`self-start rounded-full px-3 py-1 text-xs font-bold uppercase ${
          order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
          order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
        }`}>
          {order.status}
        </span>
      </div>

      {msg && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-xs font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
          {msg}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 pb-3 dark:border-slate-800">
          Informasi Pembeli & Produk
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-slate-400 block mb-1">Email Pembeli</span>
            <span className="font-bold text-slate-900 dark:text-white">{order.buyer_email}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Nama Pembeli</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{order.buyer_name || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Produk</span>
            <span className="font-bold text-slate-900 dark:text-white">{order.product?.title || 'Produk'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Total Tagihan</span>
            <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{formatRupiah(order.price)}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Status Notifikasi Email</span>
            <span className={order.email_sent ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
              {order.email_sent ? 'Terkirim' : 'Belum Terkirim'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Akses Download Terpakai</span>
            <span className="font-bold text-slate-900 dark:text-white">{order.download_access_count} / 5 kali</span>
          </div>
        </div>

        {order.notes && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block mb-1">Catatan Admin</span>
            <p className="text-rose-600 font-medium">{order.notes}</p>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          Aksi Manual Pemilik
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSyncMidtrans}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-indigo-600" />
            Cek Status Midtrans Manual
          </button>

          <button
            onClick={handleResendEmail}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          >
            <Send className="h-4 w-4 text-emerald-600" />
            Kirim Ulang Link Download Email
          </button>

          {order.status !== 'refunded' && (
            <button
              onClick={handleRefund}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300 transition-colors"
            >
              <AlertTriangle className="h-4 w-4" />
              Set Refund Manual
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
