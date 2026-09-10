'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatRupiah } from '@/lib/utils';
import { mockProducts } from '@/lib/mockData';
import { Product } from '@/types/database';
import { FaIcon } from '@/components/ui/FaIcon';
import { PaymentLogo } from '@/components/public/PaymentLogo';

const checkoutFormSchema = z.object({
  buyerEmail: z.string().email('Masukkan alamat email yang valid untuk pengiriman file'),
  buyerName: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

interface PaymentOption {
  id: string;
  name: string;
  sublabel: string;
  logo: 'bni' | 'mandiri' | 'bca' | 'bri' | 'permata' | 'qris' | 'gopay' | 'shopeepay';
  isPopular?: boolean;
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'bni_va',
    name: 'Bank Negara Indonesia',
    sublabel: 'BNI Virtual Account (Verifikasi Otomatis)',
    logo: 'bni',
  },
  {
    id: 'mandiri_bill',
    name: 'Bank Mandiri',
    sublabel: 'Mandiri Bill Payment / Virtual Account',
    logo: 'mandiri',
  },
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    sublabel: 'Transfer via m-BCA / KlikBCA / ATM BCA',
    logo: 'bca',
  },
  {
    id: 'bri_va',
    name: 'BRI Virtual Account',
    sublabel: 'Transfer via BRImo / ATM BRI',
    logo: 'bri',
  },
  {
    id: 'permata_va',
    name: 'Permata Virtual Account',
    sublabel: 'Permata Mobile X / ATM Semua Bank',
    logo: 'permata',
  },
  {
    id: 'qris',
    name: 'QRIS',
    sublabel: 'GoPay, OVO, DANA, ShopeePay, BCA & Semua m-Banking',
    logo: 'qris',
    isPopular: true,
  },
  {
    id: 'gopay',
    name: 'GoPay',
    sublabel: 'Pembayaran Instan via Aplikasi GoPay',
    logo: 'gopay',
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    sublabel: 'Pembayaran Instan via Aplikasi Shopee',
    logo: 'shopeepay',
  },
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('productId');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected Payment Channel (Default: BNI VA as seen in user reference)
  const [selectedMethod, setSelectedMethod] = useState<string>('bni_va');

  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

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

      // 2. Fetch targeted fields from Supabase client
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId!);
        const query = supabase.from('products').select('id, title, slug, price, is_active, stock_type, stock_qty, thumbnail_url');
        const { data } = isUuid 
          ? await query.eq('id', productId).single()
          : await query.eq('slug', productId).single();

        if (data) {
          setProduct(data as any);
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

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    setDiscountError(null);
    if (!discountCode.trim()) return;

    if (discountCode.trim().toUpperCase() === 'PAPAYEYHEMAT' || discountCode.trim().toUpperCase() === 'DISKON10') {
      setDiscountApplied(true);
    } else {
      setDiscountError('Kode voucher tidak valid atau sudah kedaluwarsa.');
      setDiscountApplied(false);
    }
  };

  const calculateFinalPrice = () => {
    if (!product) return 0;
    if (discountApplied) {
      return Math.max(0, product.price - 10000); // Rp 10.000 diskon
    }
    return product.price;
  };

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
          paymentMethod: selectedMethod,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Gagal memproses pesanan.');
      }

      const { order_code } = result;

      // Direct redirection to the dedicated payment status page (No Midtrans popup/floating panel!)
      router.push(`/order/${order_code}/status`);
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
        <div className="mx-auto flex items-center justify-center">
          <FaIcon name="triangle-exclamation" className="text-5xl text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Produk Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">Pilih produk digital dari katalog terlebih dahulu.</p>
        <Link href="/" className="inline-block text-xs font-bold text-indigo-600 hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const finalPrice = calculateFinalPrice();

  return (
    <div className="mx-auto max-w-2xl px-3.5 sm:px-6 py-6 sm:py-12 pb-16">
      <Link href={`/produk/${product.slug}`} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-5 transition-colors">
        <FaIcon name="arrow-left" className="text-xs" />
        Kembali ke detail produk
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Checkout Pembelian</h1>
          <p className="text-xs text-slate-500 mt-1">Pilih metode pembayaran langsung di bawah ini tanpa popup eksternal.</p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Customer Data */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
              Data Pembeli
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email Aktif <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
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
                autoComplete="name"
                placeholder="Nama Anda"
                {...register('buyerName')}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Section 2: Discount Code */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Discount Code / Kode Kupon
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: PAPAYEYHEMAT"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs uppercase font-mono tracking-wider text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={handleApplyDiscount}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition-colors"
              >
                Gunakan
              </button>
            </div>
            {discountApplied && (
              <p className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <FaIcon name="check" className="text-xs" /> Diskon voucher Rp 10.000 berhasil diterapkan!
              </p>
            )}
            {discountError && (
              <p className="mt-2 text-xs text-rose-500">{discountError}</p>
            )}
          </div>

          {/* Section 3: Metode Pembayaran (Responsive Cards) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Metode Pembayaran:
              </h3>
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="space-y-2">
              {paymentOptions.map((opt) => {
                const isSelected = selectedMethod === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedMethod(opt.id)}
                    className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                      {/* Radio Indicator */}
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
                      }`}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>

                      {/* Brand Logo */}
                      <div className="flex h-7 w-16 sm:w-20 shrink-0 items-center justify-start">
                        <PaymentLogo channel={opt.logo} className="h-5 sm:h-6 w-auto max-w-full object-contain" />
                      </div>

                      {/* Channel Info */}
                      <div className="min-w-0 flex-1 pr-1">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block truncate sm:whitespace-normal leading-snug">
                          {opt.name}
                        </span>
                        <span className="text-[10px] text-slate-400 hidden sm:block truncate">
                          {opt.sublabel}
                        </span>
                      </div>
                    </div>

                    {opt.isPopular && (
                      <span className="shrink-0 rounded-full bg-indigo-100 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 ml-1.5">
                        Populer
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Rincian Pesanan Box */}
          <div className="rounded-xl border-2 border-indigo-500/60 bg-white p-4 sm:p-5 shadow-sm dark:border-indigo-500/40 dark:bg-slate-900 space-y-4">
            <h4 className="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white underline underline-offset-4">
              RINCIAN PESANAN:
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-start gap-4">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {product.title}
                </span>
                <span className="font-bold text-slate-900 dark:text-white shrink-0">
                  {formatRupiah(product.price)}
                </span>
              </div>

              {discountApplied && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Diskon Kupon</span>
                  <span>- Rp 10.000</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Biaya Transaksi & Layanan</span>
                <span className="text-emerald-600 font-bold">Rp 0 (Gratis)</span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center text-sm font-black text-slate-900 dark:text-white">
                <span>Total Bayar</span>
                <span className="text-base text-indigo-600 dark:text-indigo-400">
                  {formatRupiah(finalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 sm:py-4 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 transition-all min-h-[48px]"
          >
            {isProcessing ? (
              <>
                <FaIcon name="arrows-rotate" spin className="text-sm" />
                Menyiapkan Pembayaran...
              </>
            ) : (
              <>
                <FaIcon name="lock" className="text-sm" />
                Bayar Sekarang ({formatRupiah(finalPrice)})
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1 text-center">
            <FaIcon name="shield" className="text-sm text-emerald-600 shrink-0" />
            <span>Pembayaran terenkripsi & diproses otomatis via Midtrans Bank Partner</span>
          </div>
        </form>
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
