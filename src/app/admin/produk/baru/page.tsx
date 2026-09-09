'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import { mockCategories } from '@/lib/mockData';
import { Category } from '@/types/database';
import { FaIcon } from '@/components/ui/FaIcon';

export default function AdminNewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  // Delivery Content Type: 'file' or 'link'
  const [deliveryType, setDeliveryType] = useState<'file' | 'link'>('file');
  const [filePath, setFilePath] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  const [stockType, setStockType] = useState<'unlimited' | 'limited'>('unlimited');
  const [stockQty, setStockQty] = useState('10');

  useEffect(() => {
    async function loadCats() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
        if (data && data.length > 0) {
          setCategories(data);
          setCategoryId(data[0].id);
        } else {
          setCategories(mockCategories);
          setCategoryId(mockCategories[0].id);
        }
      } catch {
        setCategories(mockCategories);
        setCategoryId(mockCategories[0].id);
      }
    }
    loadCats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const slug = slugify(title);

      const resolvedFileAsset = deliveryType === 'link' 
        ? externalUrl.trim() 
        : (filePath.trim() || `products/${slug}.zip`);

      const payload = {
        title: title.trim(),
        slug,
        category_id: categoryId || null,
        description: description.trim(),
        price: parseInt(price, 10),
        thumbnail_url: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        file_path: resolvedFileAsset,
        stock_type: stockType,
        stock_qty: stockType === 'limited' ? parseInt(stockQty, 10) : null,
        is_active: true,
      };

      const { error } = await supabase.from('products').insert(payload);
      if (error) throw error;

      router.push('/admin/produk');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan produk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Link href="/admin/produk" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
        <FaIcon name="arrow-left" className="text-xs" /> Kembali ke Daftar Produk
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Tambah Produk Digital</h1>
        <p className="text-xs text-slate-500">Tentukan informasi produk dan berkas/tautan yang akan diterima pembeli setelah membayar.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* 1. Judul Produk */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Judul Produk <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Financial Blueprint Ayah Muda / SaaS Boilerplate"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* 2. Kategori Persona */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Kategori Persona <span className="text-rose-500">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Harga */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Harga Produk (IDR) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            required
            placeholder="Contoh: 79000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* 4. Gambar Thumbnail */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            URL Gambar Sampul (Thumbnail) <span className="text-rose-500">*</span>
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/... atau link gambar publik"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* 5. Deskripsi */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Deskripsi Produk <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            placeholder="Jelaskan apa yang didapatkan pembeli, manfaat, serta isi materinya..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* 6. ASET PRODUK DIGITAL YANG DITERIMA PEMBELI (KUNCI PENGIRIMAN) */}
        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/30 space-y-4">
          <div className="flex items-start gap-2.5">
            <FaIcon name="circle-info" className="text-sm text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Aset Digital yang Muncul Setelah Pembeli Membayar</h4>
              <p className="text-[11px] text-slate-500">
                Pilih apakah produk ini berupa file yang diunduh langsung (PDF, ZIP, Excel) atau tautan akses online (Notion, Google Drive, dsb).
              </p>
            </div>
          </div>

          {/* Delivery Type Tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeliveryType('file')}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all ${
                deliveryType === 'file'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <FaIcon name="box-archive" className="text-xs" /> Berkas / File Unduhan
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType('link')}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all ${
                deliveryType === 'link'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <FaIcon name="arrow-up-right-from-square" className="text-xs" /> Tautan Akses Langsung
            </button>
          </div>

          {/* Input Based on Delivery Type */}
          {deliveryType === 'file' ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Path Berkas Storage (Supabase Private Bucket)
              </label>
              <input
                type="text"
                placeholder="products/nama-file-anda.pdf atau .zip"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                * Sistem akan meng-generate Signed URL sementara yang aman saat pembeli membuka halaman unduhan.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                URL Tautan Akses Pembeli (Notion / GDrive / Video / Repo) <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://notion.so/... atau https://drive.google.com/..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                * Setelah lunas, tombol "Buka Tautan Akses Produk" akan langsung muncul dan mengarahkan pembeli ke tautan ini.
              </p>
            </div>
          )}
        </div>

        {/* 7. Pengaturan Stok */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tipe Stok
            </label>
            <select
              value={stockType}
              onChange={(e: any) => setStockType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="unlimited">Unlimited (Tak Terbatas)</option>
              <option value="limited">Limited (Kuota Terbatas)</option>
            </select>
          </div>

          {stockType === 'limited' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Jumlah Kuota
              </label>
              <input
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="clay-btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-md disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? <FaIcon name="arrows-rotate" spin className="text-sm" /> : <FaIcon name="check" className="text-sm" />}
          Simpan Produk & Terbitkan
        </button>
      </form>
    </div>
  );
}
