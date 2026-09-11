'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import { mockCategories, mockProducts } from '@/lib/mockData';
import { Category, Product } from '@/types/database';
import { FaIcon } from '@/components/ui/FaIcon';

const PRESET_THUMBNAILS = [
  { label: 'Finansial & Spreadsheet', url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=60' },
  { label: 'SaaS & Dashboard Tech', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60' },
  { label: 'Code & Editor Dark', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60' },
  { label: 'Printable & Parenting Kit', url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=60' },
  { label: 'Gaming & Setup RGB', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60' },
  { label: 'Ebook & Modul Belajar', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60' },
  { label: 'Infografis & Presentasi', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60' },
];

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  
  // Thumbnails Manager: min 1, max 7
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [newThumbUrl, setNewThumbUrl] = useState('');

  // Delivery Content Type: 'file' or 'link'
  const [deliveryType, setDeliveryType] = useState<'file' | 'link'>('file');
  const [filePath, setFilePath] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  const [stockType, setStockType] = useState<'unlimited' | 'limited'>('unlimited');
  const [stockQty, setStockQty] = useState('10');

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        
        // 1. Load categories
        const { data: cats } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
        const resolvedCats = cats && cats.length > 0 ? cats : mockCategories;
        setCategories(resolvedCats);

        // 2. Load product
        let foundProduct: Product | null = null;
        const { data: prodData } = await supabase.from('products').select('*').eq('id', productId).single();
        if (prodData) {
          foundProduct = prodData;
        } else {
          foundProduct = mockProducts.find((p) => p.id === productId) || null;
        }

        if (foundProduct) {
          setTitle(foundProduct.title || '');
          setCategoryId(foundProduct.category_id || resolvedCats[0]?.id || '');
          setDescription(foundProduct.description || '');
          setPrice(String(foundProduct.price || ''));
          
          // Thumbnails
          const initialThumbs = [
            foundProduct.thumbnail_url,
            ...(Array.isArray(foundProduct.preview_images) ? foundProduct.preview_images : [])
          ].filter((u): u is string => typeof u === 'string' && u.trim().length > 0);

          const uniqueThumbs = Array.from(new Set(initialThumbs)).slice(0, 7);
          setThumbnails(
            uniqueThumbs.length > 0
              ? uniqueThumbs
              : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800']
          );

          // Delivery asset
          const asset = foundProduct.file_path || '';
          if (asset.startsWith('http://') || asset.startsWith('https://')) {
            setDeliveryType('link');
            setExternalUrl(asset);
          } else {
            setDeliveryType('file');
            setFilePath(asset);
          }

          setStockType(foundProduct.stock_type || 'unlimited');
          setStockQty(String(foundProduct.stock_qty || 10));
        } else {
          alert('Produk tidak ditemukan.');
          router.push('/admin/produk');
        }
      } catch {
        alert('Gagal memuat data produk.');
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, [productId, router]);

  // Thumbnail handlers
  const handleAddThumbnail = (urlToAdd?: string) => {
    const targetUrl = (urlToAdd || newThumbUrl).trim();
    if (!targetUrl) return;

    if (thumbnails.length >= 7) {
      alert('Maksimal 7 thumbnail diperbolehkan per produk.');
      return;
    }

    setThumbnails([...thumbnails, targetUrl]);
    if (!urlToAdd) setNewThumbUrl('');
  };

  const handleRemoveThumbnail = (indexToRemove: number) => {
    if (thumbnails.length <= 1) {
      alert('Produk harus memiliki minimal 1 thumbnail.');
      return;
    }
    setThumbnails(thumbnails.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetAsMain = (indexToMain: number) => {
    if (indexToMain === 0) return;
    const target = thumbnails[indexToMain];
    const rest = thumbnails.filter((_, idx) => idx !== indexToMain);
    setThumbnails([target, ...rest]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanThumbnails = thumbnails.map((t) => t.trim()).filter(Boolean);
    if (cleanThumbnails.length < 1) {
      alert('Mohon sediakan minimal 1 thumbnail untuk produk ini.');
      return;
    }
    if (cleanThumbnails.length > 7) {
      alert('Maksimal 7 thumbnail diperbolehkan.');
      return;
    }

    setSubmitting(true);

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
        thumbnail_url: cleanThumbnails[0],
        preview_images: cleanThumbnails,
        file_path: resolvedFileAsset,
        stock_type: stockType,
        stock_qty: stockType === 'limited' ? parseInt(stockQty, 10) : null,
      };

      const { error } = await supabase.from('products').update(payload).eq('id', productId);
      if (error) throw error;

      router.push('/admin/produk');
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui produk.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="p-16 text-center">
        <FaIcon name="arrows-rotate" spin className="text-3xl text-indigo-600 mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-400">Memuat data produk...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link href="/admin/produk" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
        <FaIcon name="arrow-left" className="text-xs" /> Kembali ke Daftar Produk
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Edit Produk Digital</h1>
        <p className="text-xs text-slate-500">Perbarui rincian produk, atur 1-7 thumbnail gambar, dan atur berkas pengiriman.</p>
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
            placeholder="Contoh: Financial Blueprint Ayah Muda"
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

        {/* 4. MULTI-THUMBNAIL MANAGER (MIN 1, MAX 7) */}
        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <FaIcon name="images" className="text-indigo-600 dark:text-indigo-400 text-sm" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Thumbnail Galeri Produk <span className="text-rose-500">*</span>
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Minimal 1 thumbnail, maksimal 7 thumbnail. Foto pertama otomatis menjadi <strong>Sampul Utama</strong>.
              </p>
            </div>

            <span className={`inline-flex items-center gap-1 self-start rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
              thumbnails.length >= 7
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
            }`}>
              <FaIcon name="camera" className="text-[9px]" />
              {thumbnails.length} / 7 Thumbnail
            </span>
          </div>

          {/* List of current thumbnails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {thumbnails.map((url, idx) => (
              <div
                key={idx}
                className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800 shadow-sm flex flex-col justify-between gap-2"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                  <Image
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                    <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      #{idx + 1}
                    </span>
                    {idx === 0 && (
                      <span className="rounded-md bg-indigo-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-white">
                        Sampul Utama
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  {idx !== 0 ? (
                    <button
                      type="button"
                      onClick={() => handleSetAsMain(idx)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 transition-colors"
                      title="Jadikan gambar sampul utama"
                    >
                      <FaIcon name="star" className="text-[9px]" /> Jadikan Utama
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Sampul Aktif</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveThumbnail(idx)}
                    disabled={thumbnails.length <= 1}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    title={thumbnails.length <= 1 ? 'Minimal 1 thumbnail wajib ada' : 'Hapus thumbnail ini'}
                  >
                    <FaIcon name="trash" className="text-[9px]" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add new thumbnail input */}
          {thumbnails.length < 7 ? (
            <div className="space-y-2 pt-1 border-t border-indigo-100 dark:border-indigo-900/50">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Tambah URL Thumbnail Baru:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... atau link gambar publik"
                  value={newThumbUrl}
                  onChange={(e) => setNewThumbUrl(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddThumbnail()}
                  disabled={!newThumbUrl.trim() || thumbnails.length >= 7}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all shrink-0"
                >
                  <FaIcon name="plus" className="text-xs" /> Tambah
                </button>
              </div>

              {/* Preset suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 mr-1">Preset Cepat:</span>
                {PRESET_THUMBNAILS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleAddThumbnail(preset.url)}
                    disabled={thumbnails.length >= 7}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 flex items-center gap-2">
              <FaIcon name="circle-exclamation" className="text-sm shrink-0" />
              <span>Batas maksimal 7 thumbnail telah tercapai. Hapus salah satu jika ingin mengganti gambar.</span>
            </div>
          )}
        </div>

        {/* 5. Deskripsi */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Deskripsi Produk <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            placeholder="Jelaskan apa yang didapatkan pembeli..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* 6. ASET PRODUK DIGITAL */}
        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/30 space-y-4">
          <div className="flex items-start gap-2.5">
            <FaIcon name="circle-info" className="text-sm text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Aset Digital yang Muncul Setelah Pembeli Membayar</h4>
              <p className="text-[11px] text-slate-500">
                Pilih apakah produk ini berupa file yang diunduh langsung atau tautan akses online.
              </p>
            </div>
          </div>

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
              <FaIcon name="file-zipper" className="text-xs" />
              File Unduhan
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
              <FaIcon name="link" className="text-xs" />
              Tautan Akses
            </button>
          </div>

          {deliveryType === 'file' ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi Path File di Storage
              </label>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                URL Tautan Akses Eksternal <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required={deliveryType === 'link'}
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* 7. Jenis Stok */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tipe Stok
            </label>
            <select
              value={stockType}
              onChange={(e) => setStockType(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="unlimited">Unlimited (Tak Terbatas)</option>
              <option value="limited">Limited (Jumlah Terbatas)</option>
            </select>
          </div>

          {stockType === 'limited' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Jumlah Kuota Stok
              </label>
              <input
                type="number"
                min="1"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/admin/produk"
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
          >
            {submitting ? (
              <>
                <FaIcon name="arrows-rotate" spin className="text-xs" />
                Menyimpan Perubahan...
              </>
            ) : (
              <>
                <FaIcon name="check" className="text-xs" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
