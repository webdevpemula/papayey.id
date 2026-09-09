'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatRupiah } from '@/lib/utils';
import { mockProducts } from '@/lib/mockData';
import { Product } from '@/types/database';
import { FaIcon } from '@/components/ui/FaIcon';

const checkoutFormSchema = z.object({
  buyerEmail: z.string().email('Masukkan alamat email yang valid untuk pengiriman file'),
  buyerName: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

declare global {
  interface Window {
    snap?: any;
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('productId');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
  });

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    async function loadProduct() {
      // 1. Try finding in mockProducts by ID or slug
      const found = mockProducts.find((p) => p.id === productId || p.slug === productId);
      if (found) {
        setProduct(found);
        setLoading(false);
        return;
      }

      // 2. Fetch from Supabase client
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId!);
        const query = supabase.from('products').select('*, category:categories(*)');
        const { data } = isUuid 
          ? await query.eq('id', productId).single()
          : await query.eq('slug', productId).single();

        if (data) {
          setProduct(data);
        } else {
          setProduct(mockProducts[0]);
        }
      } catch {
        setProduct(mockProducts[0]);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!product) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          buyerEmail: data.buyerEmail,
          buyerName: data.buyerName,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Gagal memproses pesanan.');
      }

      const { snap_token, order_code } = result;

      // Trigger Midtrans Snap Popup
      if (typeof window !== 'undefined' && window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: function () {
            router.push(`/order/${order_code}/status`);
          },
          onPending: function () {
            router.push(`/order/${order_code}/status`);
          },
          onError: function () {
            router.push(`/order/${order_code}/status`);
          },
          onClose: function () {
            router.push(`/order/${order_code}/status`);
          },
        });
      } else {
        // Direct redirect if script not ready
        router.push(`/order/${order_code}/status`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <FaIcon name="arrows-rotate" spin className="text-3xl text-indigo-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex items-center justify-center"><FaIcon name="triangle-exclamation" className="text-5xl text-rose-500" /></div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Produk Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">Pilih produk digital dari katalog terlebih dahulu.</p>
        <Link href="/" className="inline-block text-xs font-bold text-indigo-600 hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Link href={`/produk/${product.slug}`} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <FaIcon name="arrow-left" className="text-xs" />
        Kembali ke detail produk
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Left: Input Form (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Checkout Pembelian</h1>
            <p className="text-xs text-slate-500">Akses unduhan instan akan dikirimkan ke email Anda.</p>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email Aktif <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="nama@email.com"
                {...register('buyerEmail')}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {errors.buyerEmail && (
                <p className="mt-1 text-xs text-rose-500">{errors.buyerEmail.message}</p>
              )}
              <p className="mt-1 text-[11px] text-slate-400">
                Penting: Link download dan invoice resmi akan dikirimkan ke alamat ini.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap (Opsional)
              </label>
              <input
                type="text"
                placeholder="Nama Anda"
                {...register('buyerName')}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 transition-all mt-4"
            >
              {isProcessing ? (
                <>
                  <FaIcon name="arrows-rotate" spin className="text-sm" />
                  Membuka Pembayaran...
                </>
              ) : (
                <>
                  <FaIcon name="lock" className="text-sm" />
                  Lanjut ke Pembayaran ({formatRupiah(product.price)})
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FaIcon name="shield" className="text-sm text-emerald-600" />
            <span>Pembayaran terenkripsi & diamankan 256-bit SSL via Midtrans</span>
          </div>
        </div>

        {/* Right: Order Summary Card (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              Ringkasan Pesanan
            </h3>

            <div className="flex gap-3">
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                <Image src={product.thumbnail_url} alt={product.title} fill className="object-cover" />
              </div>
              <div className="flex flex-col justify-between py-0.5">
                <h4 className="line-clamp-2 text-xs font-bold text-slate-900 dark:text-white">
                  {product.title}
                </h4>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {formatRupiah(product.price)}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatRupiah(product.price)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Biaya Layanan</span>
                <span className="text-emerald-600 font-semibold">Gratis</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
                <span>Total Bayar</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatRupiah(product.price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <FaIcon name="arrows-rotate" spin className="text-3xl text-indigo-600" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
