import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { mockProducts } from '@/lib/mockData';
import { StickyBuyBar } from '@/components/public/StickyBuyBar';
import { formatRupiah } from '@/lib/utils';
import { FaIcon } from '@/components/ui/FaIcon';
import { Product } from '@/types/database';

export const revalidate = 60;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product: Product | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .single();

    if (data) product = data;
  } catch (err) {
    console.log('Database error, falling back to mock product');
  }

  if (!product) {
    product = mockProducts.find((p) => p.slug === slug) || null;
  }

  if (!product || !product.is_active) {
    notFound();
  }

  const isOutOfStock = product.stock_type === 'limited' && (product.stock_qty ?? 0) <= 0;
  const isAvailable = !isOutOfStock;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <FaIcon name="arrow-right" className="text-xs" />
        {product.category && (
          <>
            <Link href={`/kategori/${product.category.slug}`} className="hover:text-indigo-600 transition-colors">
              {product.category.name}
            </Link>
            <FaIcon name="arrow-right" className="text-xs" />
          </>
        )}
        <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">{product.title}</span>
      </nav>

      {/* Main Grid Detail */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left: Thumbnail & Preview Gallery (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Image
              src={product.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>

          {/* Additional Preview Images if any */}
          {product.preview_images && product.preview_images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {product.preview_images.map((img, idx) => (
                <div key={idx} className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  <Image src={img} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Description Section */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deskripsi Lengkap</h3>
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {product.description}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Buy Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-lg shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none space-y-6">
            
            {/* Header / Badges */}
            <div className="space-y-2">
              {product.category && (
                <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 uppercase tracking-wider">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                {product.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{product.sold_count} terjual</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <FaIcon name="check" className="text-xs" /> Siap Unduh Instan
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-500">Harga Investasi</span>
                <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatRupiah(product.price)}
                </span>
              </div>

              {product.stock_type === 'limited' && (
                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isOutOfStock ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isOutOfStock ? 'Stok Habis' : `Sisa ${product.stock_qty} kuota`}
                  </span>
                </div>
              )}
            </div>

            {/* Buy CTA Button (Desktop) */}
            <div className="space-y-3">
              {isAvailable ? (
                <Link
                  href={`/checkout?productId=${product.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-[0.98] transition-all"
                >
                  <FaIcon name="cart-shopping" className="text-base" />
                  Beli Sekarang (Akses Instan)
                </Link>
              ) : (
                <button
                  disabled
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-200 py-4 px-6 text-sm font-bold text-slate-400 cursor-not-allowed dark:bg-slate-800"
                >
                  <FaIcon name="triangle-exclamation" className="text-base" />
                  Produk Tidak Tersedia / Stok Habis
                </button>
              )}
            </div>

            {/* Guarantees */}
            <div className="border-t border-slate-100 pt-5 dark:border-slate-800 space-y-3 text-xs text-slate-500">
              <div className="flex items-center gap-2.5">
                <FaIcon name="arrow-down-to-line" className="text-sm text-indigo-600" />
                <span>Link unduhan langsung tampil setelah pembayaran sukses</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FaIcon name="shield" className="text-sm text-emerald-600" />
                <span>Pembayaran otomatis terverifikasi via Midtrans (QRIS/VA)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FaIcon name="bolt" className="text-sm text-amber-500" />
                <span>Cadangan link unduh dikirimkan ke email Anda</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Sticky Buy Bar for Mobile Viewport */}
      <StickyBuyBar productId={product.id} price={product.price} isAvailable={isAvailable} />

    </div>
  );
}
