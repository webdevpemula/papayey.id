'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { formatRupiah, formatDate } from '@/lib/utils';
import { FaIcon } from '@/components/ui/FaIcon';

interface OrderStatusData {
  order_code: string;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
  price: number;
  buyer_email: string;
  paid_at: string | null;
  download_token: string | null;
  product: {
    title: string;
    thumbnail_url: string;
  };
}

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [data, setData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/order/${code}/status`);
      if (res.ok) {
        const json = await res.json();
        setData(json);

        // Stop polling if status reached final state
        if (['paid', 'failed', 'expired', 'refunded'].includes(json.status)) {
          setIsPolling(false);
        }
      }
    } catch (err) {
      console.error('Failed to poll order status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    if (!isPolling) return;

    // Smart Adaptive Polling: pauses when tab is hidden, immediate check on tab focus
    let interval: any = null;
    let pollCount = 0;
    const maxPolls = 170; // ~10 minutes max polling duration

    const startPolling = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        if (document.hidden) return; // Save server resources if tab not active
        pollCount++;
        if (pollCount > maxPolls) {
          setIsPolling(false);
          clearInterval(interval);
          return;
        }
        fetchStatus();
      }, 3500);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && isPolling) {
        fetchStatus(); // Instant check when user refocuses tab
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [code, isPolling]);

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex items-center justify-center"><FaIcon name="arrows-rotate" spin className="text-3xl text-indigo-600" /></div>
        <p className="text-xs text-slate-500">Memeriksa status pembayaran #{code}...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex items-center justify-center"><FaIcon name="triangle-exclamation" className="text-5xl text-rose-500" /></div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pesanan Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">Nomor pesanan #{code} tidak tercatat di sistem.</p>
        <Link href="/" className="inline-block text-xs font-bold text-indigo-600 hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const isPaid = data.status === 'paid';
  const isPending = data.status === 'pending';
  const isFailed = ['failed', 'expired', 'refunded'].includes(data.status);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 space-y-6">
      
      {/* Header Status Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 text-center shadow-lg shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none space-y-5">
        
        {isPaid && (
          <>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <FaIcon name="circle-check" className="text-4xl" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Pembayaran Berhasil!</h1>
              <p className="text-xs text-slate-500">Terima kasih, produk digital Anda siap untuk diakses.</p>
            </div>
          </>
        )}

        {isPending && (
          <>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 animate-pulse">
              <FaIcon name="clock" className="text-4xl" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Menunggu Pembayaran</h1>
              <p className="text-xs text-slate-500">
                Selesaikan pembayaran Anda via QRIS / Virtual Account yang telah dibuka.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <FaIcon name="arrows-rotate" spin className="text-xs text-indigo-600" />
              Sistem sedang memeriksa status otomatis...
            </div>
          </>
        )}

        {isFailed && (
          <>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <FaIcon name="circle-xmark" className="text-4xl" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {data.status === 'expired' ? 'Pesanan Kedaluwarsa' : 'Pembayaran Gagal'}
              </h1>
              <p className="text-xs text-slate-500">
                Transaksi ini telah dibatalkan atau melewati batas waktu pembayaran.
              </p>
            </div>
          </>
        )}

        {/* Details Box */}
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 text-left space-y-2.5 text-xs border border-slate-100 dark:border-slate-700/50">
          <div className="flex justify-between">
            <span className="text-slate-400">Kode Order</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">#{data.order_code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Produk</span>
            <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">{data.product.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Tagihan</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatRupiah(data.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Email Pembeli</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{data.buyer_email}</span>
          </div>
          {data.paid_at && (
            <div className="flex justify-between">
              <span className="text-slate-400">Waktu Bayar</span>
              <span className="text-slate-700 dark:text-slate-300">{formatDate(data.paid_at)}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {isPaid && data.download_token && (
          <Link
            href={`/download/${data.download_token}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-[0.98] transition-all"
          >
            <FaIcon name="arrow-down-to-line" className="text-base" />
            Akses & Unduh Produk Sekarang
          </Link>
        )}

        {isFailed && (
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 px-6 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all"
          >
            Pesan Ulang Produk
            <FaIcon name="arrow-right" className="text-sm" />
          </Link>
        )}

      </div>
    </div>
  );
}
