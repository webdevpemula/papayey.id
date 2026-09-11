'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah } from '@/lib/utils';
import { mockProducts } from '@/lib/mockData';
import { Product } from '@/types/database';
import { FaIcon } from '@/components/ui/FaIcon';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) setProducts(data);
      else setProducts(mockProducts);
    } catch {
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id);
      setProducts(products.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p)));
    } catch {
      alert('Gagal memperbarui status produk');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Manajemen Produk Digital</h1>
          <p className="text-xs text-slate-500">Kelola katalog produk, multi-thumbnail (1-7 foto), status aktif, dan harga.</p>
        </div>

        <Link
          href="/admin/produk/baru"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all self-start"
        >
          <FaIcon name="plus" className="text-xs" /> Tambah Produk Baru
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="p-16 text-center">
            <FaIcon name="arrows-rotate" spin className="text-3xl text-indigo-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Memuat data produk...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 p-3 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">PRODUK & THUMBNAIL</th>
                  <th className="py-3 px-4 font-semibold">KATEGORI</th>
                  <th className="py-3 px-4 font-semibold">HARGA</th>
                  <th className="py-3 px-4 font-semibold">STOK</th>
                  <th className="py-3 px-4 font-semibold text-center">STATUS</th>
                  <th className="py-3 px-4 font-semibold text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p) => {
                  const thumbCount = Array.isArray(p.preview_images) && p.preview_images.length > 0 
                    ? p.preview_images.length 
                    : 1;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                            <Image src={p.thumbnail_url} alt={p.title} fill className="object-cover" />
                            <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 py-0.2 text-[8px] font-bold text-white">
                              {thumbCount} foto
                            </span>
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.title}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <FaIcon name="images" className="text-[9px]" /> {thumbCount} thumbnail terpasang
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{p.category?.name || '-'}</td>
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{formatRupiah(p.price)}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {p.stock_type === 'limited' ? (p.stock_qty ?? 0) + ' unit' : 'Unlimited'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(p.id, p.is_active)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                            p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {p.is_active ? <FaIcon name="check" className="text-[10px]" /> : <span className="text-[10px]">✕</span>}
                          {p.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/admin/produk/edit/${p.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors shadow-sm"
                          >
                            <FaIcon name="pen" className="text-[10px]" /> Edit
                          </Link>
                          <Link
                            href={`/produk/${p.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold hover:underline"
                          >
                            <FaIcon name="arrow-up-right-from-square" className="text-[10px]" /> Toko
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
