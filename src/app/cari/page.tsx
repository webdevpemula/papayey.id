import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { mockCategories, mockProducts } from '@/lib/mockData';
import { ProductCard } from '@/components/public/ProductCard';
import { FaIcon } from '@/components/ui/FaIcon';
import { Product, Category } from '@/types/database';

export const revalidate = 60;

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    corner?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', corner = 'semua', sort = 'popular' } = await searchParams;

  let categories: Category[] = mockCategories;
  let products: Product[] = [];
  let selectedCategory: Category | null = null;

  try {
    const supabase = await createClient();

    // 1. Fetch Categories for corner pills
    const { data: catList } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (catList && catList.length > 0) {
      categories = catList;
    }

    if (corner && corner !== 'semua') {
      selectedCategory = categories.find((c) => c.slug === corner) || null;
      if (!selectedCategory) {
        const { data: dbCat } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', corner)
          .single();
        if (dbCat) selectedCategory = dbCat;
      }
    }

    // 2. Query Products
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true);

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory.id);
    }

    if (q) {
      query = query.ilike('title', `%${q}%`);
    }

    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else {
      // Default: Most Popular
      query = query.order('sold_count', { ascending: false });
    }

    const { data: prodData } = await query;
    if (prodData && prodData.length > 0) {
      products = prodData;
    } else {
      // Fallback filter on starter mock
      let filtered = [...mockProducts];
      if (selectedCategory) {
        filtered = filtered.filter((p) => p.category_id === selectedCategory!.id);
      }
      if (q) {
        const lowerQ = q.toLowerCase();
        filtered = filtered.filter((p) =>
          p.title.toLowerCase().includes(lowerQ) ||
          (p.description && p.description.toLowerCase().includes(lowerQ))
        );
      }

      if (sort === 'newest') {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else {
        filtered.sort((a, b) => b.sold_count - a.sold_count);
      }
      products = filtered;
    }
  } catch (err) {
    products = mockProducts;
  }

  const getFaIconName = (iconName: string | null) => {
    switch (iconName) {
      case 'heart':
      case 'ayah':
      case 'dad':
      case 'dad-corner':
        return 'heart';
      case 'code':
      case 'engineer':
      case 'engineer-corner':
        return 'code';
      case 'gamepad':
      case 'gamer':
      case 'gamer-corner':
        return 'gamepad';
      case 'landmark':
      case 'asn':
      case 'asn-corner':
      case 'briefcase':
        return 'landmark';
      default:
        return 'wand-magic-sparkles';
    }
  };

  const isAllCorners = !corner || corner === 'semua';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <FaIcon name="arrow-right" className="text-xs" />
        <span className="font-semibold text-slate-900 dark:text-white">Koleksi Lengkap & Pencarian</span>
      </nav>

      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Eksplor Semua Produk Digital
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Temukan blueprint, starter kit, template, dan modul taktis terkurasi di setiap Corner.
        </p>

        {/* Search Input Form */}
        <form method="GET" action="/cari" className="relative">
          {corner && corner !== 'semua' && (
            <input type="hidden" name="corner" value={corner} />
          )}
          {sort && sort !== 'popular' && (
            <input type="hidden" name="sort" value={sort} />
          )}
          <FaIcon name="magnifying-glass" className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari judul, materi, atau topik..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-28 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Interactive Corner Filter Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Filter Berdasarkan Corner:
          </span>
          {(!isAllCorners || q) && (
            <Link
              href="/cari"
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline"
            >
              ✕ Reset Filter
            </Link>
          )}
        </div>

        <div className="w-full overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-2.5 min-w-max px-1">
            {/* Pill: Semua Corner */}
            <Link
              href={`/cari?${new URLSearchParams({
                corner: 'semua',
                ...(q ? { q } : {}),
                ...(sort !== 'popular' ? { sort } : {}),
              }).toString()}`}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                isAllCorners ? 'clay-pill-active' : 'clay-pill-inactive hover:scale-[1.02]'
              }`}
            >
              <FaIcon name="wand-magic-sparkles" className="text-sm" />
              Semua Corner
            </Link>

            {/* Pills for each Corner */}
            {categories.map((cat) => {
              const iconName = getFaIconName(cat.icon);
              const isActive = corner === cat.slug;
              const params = new URLSearchParams({
                corner: cat.slug,
                ...(q ? { q } : {}),
                ...(sort !== 'popular' ? { sort } : {}),
              });

              return (
                <Link
                  key={cat.id}
                  href={`/cari?${params.toString()}`}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                    isActive ? 'clay-pill-active' : 'clay-pill-inactive hover:scale-[1.02]'
                  }`}
                >
                  <FaIcon name={iconName} className="text-sm" />
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Info Bar & Sort Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-200/60 pt-4 dark:border-slate-800/60">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Menampilkan <strong className="text-slate-900 dark:text-white">{products.length}</strong> produk</span>
          {selectedCategory && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                Corner: {selectedCategory.name}
              </span>
            </>
          )}
          {q && (
            <>
              <span>•</span>
              <span>Kata kunci: <em>"{q}"</em></span>
            </>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <FaIcon name="arrow-down-wide-short" className="text-sm text-slate-400" />
          <form method="GET" action="/cari" className="flex items-center gap-2">
            {corner && corner !== 'semua' && (
              <input type="hidden" name="corner" value={corner} />
            )}
            {q && (
              <input type="hidden" name="q" value={q} />
            )}
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
              className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
            >
              Urutkan
            </button>
          </form>
        </div>
      </div>

      {/* Grid Results */}
      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800 space-y-3">
          <p className="text-sm font-semibold text-slate-500">
            Tidak ada produk yang cocok dengan filter atau kata kunci pencarian Anda.
          </p>
          <Link
            href="/cari"
            className="inline-block text-xs font-bold text-indigo-600 hover:underline"
          >
            Lihat Semua Produk (Reset Filter)
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}
