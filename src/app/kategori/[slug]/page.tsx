import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { mockCategories, mockProducts } from '@/lib/mockData';
import { ProductCard } from '@/components/public/ProductCard';
import { CategoryPills } from '@/components/public/CategoryPills';
import { AdBanner } from '@/components/public/AdBanner';
import { FaIcon } from '@/components/ui/FaIcon';
import { Product, Category } from '@/types/database';

export const revalidate = 60;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const { slug } = await params;
  const { sort = 'popular', q = '' } = await searchParams;

  let categories: Category[] = mockCategories;
  let currentCategory: Category | null = null;
  let products: Product[] = mockProducts;

  try {
    const supabase = await createClient();
    const { data: catList } = await supabase.from('categories').select('*').order('sort_order');
    if (catList && catList.length > 0) categories = catList;

    if (slug !== 'semua') {
      currentCategory = categories.find((c) => c.slug === slug) || null;
      if (!currentCategory) {
        const { data: dbCat } = await supabase.from('categories').select('*').eq('slug', slug).single();
        if (dbCat) currentCategory = dbCat;
      }
    }

    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true);

    if (currentCategory) {
      query = query.eq('category_id', currentCategory.id);
    }

    if (q) {
      query = query.ilike('title', `%${q}%`);
    }

    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else query = query.order('sold_count', { ascending: false });

    const { data: prodData } = await query;
    if (prodData && prodData.length > 0) {
      products = prodData;
    } else if (slug !== 'semua') {
      products = mockProducts.filter((p) => p.category?.slug === slug);
    }
  } catch {
    if (slug !== 'semua') {
      currentCategory = mockCategories.find((c) => c.slug === slug) || null;
      products = mockProducts.filter((p) => p.category?.slug === slug);
    }
  }

  const title = currentCategory ? currentCategory.name : 'Semua Produk';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <FaIcon name="arrow-right" className="text-xs" />
        <Link href="/kategori/semua" className="hover:text-indigo-600 transition-colors">Kategori</Link>
        <FaIcon name="arrow-right" className="text-xs" />
        <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
      </nav>

      {/* Header & Category Pills */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Menampilkan {products.length} produk digital berkualitas tinggi
            </p>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <FaIcon name="arrow-down-wide-short" className="text-sm text-slate-400" />
            <form method="GET" className="flex items-center gap-2">
              <select
                name="sort"
                defaultValue={sort}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="popular">Terpopuler</option>
                <option value="newest">Terbaru</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
              </select>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
              >
                Terapkan
              </button>
            </form>
          </div>
        </div>

        <CategoryPills categories={categories} />
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-500">Belum ada produk di kategori ini.</p>
          <Link href="/" className="mt-4 inline-block text-xs font-bold text-indigo-600 hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Ad Banner Placement: Category Sponsor Banner */}
      <section className="pt-4">
        <AdBanner
          sponsorName="Hosting Partner papayey.id"
          headline="Bangun & Host Proyek Web Anda dengan Latensi Lokal Super Cepat"
          description="Infrastruktur Cloud VPS terpercaya di Indonesia dengan NVMe SSD, garansi uptime 99.99%, dan perlindungan data enterprise."
          ctaText="Lihat Paket Hosting"
          ctaUrl="https://example.com/hosting-sponsor"
          imageUrl="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60"
        />
      </section>

    </div>
  );
}
