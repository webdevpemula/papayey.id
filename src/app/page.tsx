import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { mockCategories, mockProducts } from '@/lib/mockData';
import { CategoryPills } from '@/components/public/CategoryPills';
import { ProductCard } from '@/components/public/ProductCard';
import { AdBanner } from '@/components/public/AdBanner';
import { HeroSlider } from '@/components/public/HeroSlider';
import { Flame } from 'lucide-react';
import { Product, Category } from '@/types/database';

export const revalidate = 60;

export default async function HomePage() {
  let categories: Category[] = mockCategories;
  let products: Product[] = mockProducts;

  try {
    const supabase = await createClient();
    const [catRes, prodRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('products').select('*, category:categories(*)').eq('is_active', true).order('sold_count', { ascending: false }),
    ]);
    
    if (catRes.data && catRes.data.length > 0) categories = catRes.data;
    if (prodRes.data && prodRes.data.length > 0) products = prodRes.data;
  } catch (err) {
    // Uses starter mock data
  }

  const bestSellers = products.slice(0, 4);
  const recentProducts = [...products].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-14">
      
      {/* Interactive 3D Clay Hero Promo Slider */}
      <HeroSlider />

      {/* Category Pills Slider */}
      <section className="space-y-4" id="koleksi">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Pilih Persona & Kategori</h2>
          <Link href="/cari" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Lihat Semua
          </Link>
        </div>
        <CategoryPills categories={categories} />
      </section>

      {/* Best Sellers Section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 dark:bg-rose-500/20">
            <Flame className="h-5 w-5 fill-rose-500" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Paling Banyak Diunduh</h2>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Sponsored Ads Banner Slot */}
      <AdBanner />

      {/* All / Recent Products Grid */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Koleksi Lengkap</h2>
          <span className="text-xs font-semibold text-slate-400">{recentProducts.length} Aset Digital Siap Unduh</span>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

    </div>
  );
}
