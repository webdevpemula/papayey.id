'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaIcon } from '@/components/ui/FaIcon';
import { Advertisement, AdSlot } from '@/types/database';
import {
  AD_SLOTS,
  getAdvertisements,
  toggleAdStatus,
  deleteAdvertisement,
} from '@/lib/ads';

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAdsData = async () => {
    setLoading(true);
    try {
      const data = await getAdvertisements();
      setAds(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdsData();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = await toggleAdStatus(id, currentStatus);
      setAds((prev) =>
        prev.map((ad) => (ad.id === id ? { ...ad, is_active: newStatus } : ad))
      );
    } catch {
      alert('Gagal mengubah status iklan');
    }
  };

  const handleDelete = async (id: string, sponsorName: string) => {
    if (!confirm(`Hapus iklan sponsor "${sponsorName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteAdvertisement(id);
      setAds((prev) => prev.filter((ad) => ad.id !== id));
    } catch {
      alert('Gagal menghapus iklan');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered ads
  const filteredAds = ads.filter((ad) => {
    const slotMatch = selectedSlot === 'all' || ad.slot === selectedSlot;
    const statusMatch =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? ad.is_active
        : !ad.is_active;
    return slotMatch && statusMatch;
  });

  // Calculate stats
  const totalAds = ads.length;
  const activeAds = ads.filter((a) => a.is_active).length;
  const filledSlots = new Set(ads.filter((a) => a.is_active).map((a) => a.slot)).size;
  const totalClicks = ads.reduce((acc, curr) => acc + (curr.clicks_count || 0), 0);

  const getSlotMeta = (slotName: AdSlot) => {
    return AD_SLOTS.find((s) => s.slot === slotName) || AD_SLOTS[0];
  };

  const getSlotPreviewUrl = (slotName: AdSlot) => {
    switch (slotName) {
      case 'home_main':
      case 'home_bottom':
        return '/';
      case 'product_detail':
        return '/produk/financial-blueprint-ayah-muda';
      case 'category':
        return '/kategori/semua';
      case 'search':
        return '/cari';
      case 'download':
        return '/download/demo';
      default:
        return '/';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <FaIcon name="rectangle-ad" className="text-sm" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Kelola Iklan & Sponsor
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Atur banner sponsor, alokasi posisi slot tayang, link CTA, dan pantau performa interaksi pengunjung.
          </p>
        </div>

        <Link
          href="/admin/iklan/baru"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all self-start sm:self-auto"
        >
          <FaIcon name="plus" className="text-xs" />
          Pasang Iklan Baru
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Iklan</span>
            <FaIcon name="rectangle-ad" className="text-xs text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalAds}</p>
          <span className="text-[10px] text-slate-400">Terdaftar di sistem</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Iklan Aktif</span>
            <FaIcon name="circle-check" className="text-xs text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeAds}</p>
          <span className="text-[10px] text-slate-400">Sedang tayang langsung</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Slot Terisi</span>
            <FaIcon name="layer-group" className="text-xs text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {filledSlots} <span className="text-xs font-bold text-slate-400">/ 6 Slot</span>
          </p>
          <span className="text-[10px] text-slate-400">Posisi penempatan toko</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Klik</span>
            <FaIcon name="arrow-pointer" className="text-xs text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{totalClicks.toLocaleString('id-ID')}</p>
          <span className="text-[10px] text-slate-400">Interaksi pengunjung</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* Slot Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedSlot('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              selectedSlot === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Semua Slot ({ads.length})
          </button>

          {AD_SLOTS.map((slot) => {
            const count = ads.filter((a) => a.slot === slot.slot).length;
            const isSelected = selectedSlot === slot.slot;
            return (
              <button
                key={slot.slot}
                onClick={() => setSelectedSlot(slot.slot)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {slot.label.split(' ')[0]} {slot.label.includes('(') ? slot.label.match(/\(([^)]+)\)/)?.[0] : ''} ({count})
              </button>
            );
          })}
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Saja</option>
            <option value="inactive">Nonaktif Saja</option>
          </select>
        </div>

      </div>

      {/* Ads List Table / Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="p-16 text-center">
            <FaIcon name="arrows-rotate" spin className="text-3xl text-indigo-600 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400">Memuat data iklan & sponsor...</p>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-950/60">
              <FaIcon name="rectangle-ad" className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Tidak ada iklan ditemukan</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Belum ada banner iklan untuk filter yang dipilih. Tambahkan iklan baru sekarang.
              </p>
            </div>
            <Link
              href="/admin/iklan/baru"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all"
            >
              <FaIcon name="plus" className="text-xs" />
              Pasang Iklan Sekarang
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 p-3 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="py-3 px-4 font-bold">BANNER & SPONSOR</th>
                  <th className="py-3 px-4 font-bold">POSISI SLOT</th>
                  <th className="py-3 px-4 font-bold">TARGET CTA</th>
                  <th className="py-3 px-4 font-bold text-center">KLIK</th>
                  <th className="py-3 px-4 font-bold text-center">STATUS</th>
                  <th className="py-3 px-4 font-bold text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAds.map((ad) => {
                  const meta = getSlotMeta(ad.slot);
                  const previewUrl = getSlotPreviewUrl(ad.slot);

                  return (
                    <tr key={ad.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Banner thumbnail & details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3.5 max-w-md">
                          <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                            <Image
                              src={ad.image_url}
                              alt={ad.headline}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-600 dark:text-amber-400">
                                {ad.badge_text || 'SPONSOR'}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500 truncate">
                                {ad.sponsor_name}
                              </span>
                            </div>
                            <p className="font-black text-slate-900 dark:text-white line-clamp-1 leading-snug">
                              {ad.headline}
                            </p>
                            {ad.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 font-normal">
                                {ad.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slot badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${meta.badgeColor}`}>
                          <FaIcon name="location-dot" className="text-[9px]" />
                          {meta.label}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{meta.recommendedSize.split(' ')[0]}</p>
                      </td>

                      {/* CTA & Link */}
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="space-y-1">
                          <span className="inline-block font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-full">
                            {ad.cta_text}
                          </span>
                          <a
                            href={ad.cta_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 truncate"
                            title={ad.cta_url}
                          >
                            <FaIcon name="arrow-up-right-from-square" className="text-[8px] shrink-0" />
                            <span className="truncate">{ad.cta_url}</span>
                          </a>
                        </div>
                      </td>

                      {/* Click stats */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 font-black text-amber-600 dark:text-amber-400">
                          <FaIcon name="arrow-pointer" className="text-[9px]" />
                          {ad.clicks_count || 0}
                        </span>
                      </td>

                      {/* Active Status Switch */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(ad.id, ad.is_active)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase transition-all ${
                            ad.is_active
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                          title="Klik untuk mengubah status aktif"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${ad.is_active ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                          {ad.is_active ? 'Tayang' : 'Nonaktif'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={previewUrl}
                            target="_blank"
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 transition-colors"
                            title="Lihat di Toko"
                          >
                            <FaIcon name="eye" className="text-xs" />
                          </Link>

                          <Link
                            href={`/admin/iklan/edit/${ad.id}`}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Iklan"
                          >
                            <FaIcon name="pen" className="text-xs" />
                          </Link>

                          <button
                            onClick={() => handleDelete(ad.id, ad.sponsor_name)}
                            disabled={deletingId === ad.id}
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 transition-colors"
                            title="Hapus Iklan"
                          >
                            {deletingId === ad.id ? (
                              <FaIcon name="arrows-rotate" spin className="text-xs text-rose-500" />
                            ) : (
                              <FaIcon name="trash" className="text-xs" />
                            )}
                          </button>
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

      {/* Guide to Ad Slots */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 p-5 sm:p-6 shadow-sm dark:border-indigo-950 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <FaIcon name="circle-info" className="text-sm" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Panduan 6 Slot Penempatan Iklan papayey.id
            </h3>
            <p className="text-xs text-slate-500">
              Setiap slot telah dioptimasi untuk rasio konversi tinggi dan kenyamanan pengalaman belanja pembeli.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {AD_SLOTS.map((slot) => {
            const currentAd = ads.find((a) => a.slot === slot.slot && a.is_active);
            return (
              <div
                key={slot.slot}
                className="rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-800/80 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex rounded-lg px-2 py-0.5 text-[9px] font-black uppercase ${slot.badgeColor}`}>
                      {slot.slot}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {slot.defaultVariant}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {slot.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {slot.location}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    📐 Rekomendasi: <span className="font-semibold text-slate-600 dark:text-slate-300">{slot.recommendedSize}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Status Slot:</span>
                  {currentAd ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {currentAd.sponsor_name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Kosong / Tersedia</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
