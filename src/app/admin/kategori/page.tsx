'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { mockCategories } from '@/lib/mockData';
import { Category } from '@/types/database';
import { slugify } from '@/lib/utils';
import { Plus, Edit2, Trash2, X, Check, Loader2, Heart, Code2, Gamepad2, Landmark, Sparkles, BookOpen, Layout, Video } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states (Add)
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('heart');

  // Edit states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editIcon, setEditIcon] = useState('heart');
  const [editSortOrder, setEditSortOrder] = useState<number>(1);

  const fetchCats = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (data && data.length > 0) setCategories(data);
      else setCategories(mockCategories);
    } catch {
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setActionLoading(true);

    try {
      const supabase = createClient();
      const slug = slugify(name);
      const { data, error } = await supabase.from('categories').insert({
        name,
        slug,
        icon,
        sort_order: categories.length + 1,
      }).select().single();

      if (error) throw error;

      setName('');
      fetchCats();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat kategori');
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditIcon(cat.icon || 'sparkles');
    setEditSortOrder(cat.sort_order || 1);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setActionLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('categories')
        .update({
          name: editName,
          slug: editSlug || slugify(editName),
          icon: editIcon,
          sort_order: editSortOrder,
        })
        .eq('id', editingCategory.id);

      if (error) throw error;

      setEditingCategory(null);
      fetchCats();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui kategori');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${catName}"?`)) return;

    setActionLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      fetchCats();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus kategori');
    } finally {
      setActionLoading(false);
    }
  };

  const getIconPreview = (iconName: string | null) => {
    switch (iconName) {
      case 'heart':
      case 'ayah':
      case 'dad':
      case 'dad-corner':
        return <Heart className="h-4 w-4 text-rose-500" />;
      case 'code':
      case 'engineer':
      case 'engineer-corner':
        return <Code2 className="h-4 w-4 text-sky-500" />;
      case 'gamepad':
      case 'gamer':
      case 'gamer-corner':
        return <Gamepad2 className="h-4 w-4 text-purple-500" />;
      case 'landmark':
      case 'asn':
      case 'asn-corner':
      case 'briefcase':
        return <Landmark className="h-4 w-4 text-amber-500" />;
      case 'book':
        return <BookOpen className="h-4 w-4 text-emerald-500" />;
      case 'template':
        return <Layout className="h-4 w-4 text-indigo-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-pink-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Manajemen Kategori</h1>
        <p className="text-xs text-slate-500">Kelola kelompok kategori persona produk digital di papayey.id.</p>
      </div>

      {/* Edit Category Modal / Floating Panel */}
      {editingCategory && (
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50/70 p-6 shadow-md dark:border-indigo-900/50 dark:bg-indigo-950/40 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/50 pb-3">
            <div className="flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Kategori: <span className="text-indigo-600 dark:text-indigo-400">{editingCategory.name}</span>
              </h3>
            </div>
            <button
              onClick={cancelEdit}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-white dark:hover:bg-slate-800 text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Nama Kategori</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  setEditSlug(slugify(e.target.value));
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Slug URL</label>
              <input
                type="text"
                required
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Pilihan Ikon</label>
              <select
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="heart">❤️ Dad Corner (Heart)</option>
                <option value="code">💻 Engineer Corner (Code)</option>
                <option value="gamepad">🎮 Gamer Corner (Gamepad)</option>
                <option value="landmark">🏛️ ASN Corner (Landmark)</option>
                <option value="sparkles">✨ Sparkles</option>
                <option value="book">📖 E-Book</option>
                <option value="template">🎨 Template UI</option>
                <option value="video">🎥 Video</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Urutan</label>
              <input
                type="number"
                value={editSortOrder}
                onChange={(e) => setEditSortOrder(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="sm:col-span-12 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Category Form */}
      <form onSubmit={handleCreate} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <span className="text-xs font-bold text-slate-900 dark:text-white block">Tambah Kategori Baru</span>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Nama kategori (contoh: Dad Corner / Podcaster Corner)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="heart">❤️ Dad Corner (Heart)</option>
            <option value="code">💻 Engineer Corner (Code)</option>
            <option value="gamepad">🎮 Gamer Corner (Gamepad)</option>
            <option value="landmark">🏛️ ASN Corner (Landmark)</option>
            <option value="sparkles">✨ Sparkles</option>
            <option value="book">📖 E-Book</option>
            <option value="template">🎨 Template UI</option>
            <option value="video">🎥 Video Course</option>
          </select>

          <button
            type="submit"
            disabled={actionLoading}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            <Plus className="h-4 w-4" /> Tambah Kategori
          </button>
        </div>
      </form>

      {/* Category List Table */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 p-3 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">URUTAN</th>
                  <th className="py-3 px-4 font-semibold">IKON</th>
                  <th className="py-3 px-4 font-semibold">NAMA KATEGORI</th>
                  <th className="py-3 px-4 font-semibold">SLUG URL</th>
                  <th className="py-3 px-4 font-semibold text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">#{c.sort_order}</td>
                    <td className="py-3 px-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                        {getIconPreview(c.icon)}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">/kategori/{c.slug}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(c)}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="inline-flex items-center gap-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
