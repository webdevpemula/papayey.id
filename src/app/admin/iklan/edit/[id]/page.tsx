'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaIcon } from '@/components/ui/FaIcon';
import { AdSlot, Advertisement } from '@/types/database';
import { AD_SLOTS, getAdvertisementById, saveAdvertisement } from '@/lib/ads';
import { AdBanner } from '@/components/public/AdBanner';

const PRESET_IMAGES = [
  { label: 'Cloud Server / Tech', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60' },
  { label: 'Komunitas / Team', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60' },
  { label: 'Coding / Belajar', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60' },
  { label: 'Design / Aset', url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop&q=60' },
  { label: 'Bisnis / Analitik', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60' },
  { label: 'Hosting / Server', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=60' },
];

export default function AdminEditAdPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clicksCount, setClicksCount] = useState(0);

  // Form states
  const [sponsorName, setSponsorName] = useState('');
  const [badgeText, setBadgeText] = useState('SPONSOR');
  const [slot, setSlot] = useState<AdSlot>('home_main');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [ctaText, setCtaText] = useState('Pelajari Selengkapnya');
  const [ctaUrl, setCtaUrl] = useState('https://');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function loadAd() {
      if (!adId) return;
      try {
        const found = await getAdvertisementById(adId);
        if (found) {
          setSponsorName(found.sponsor_name || '');
          setBadgeText(found.badge_text || 'SPONSOR');
          setSlot(found.slot || 'home_main');
          setHeadline(found.headline || '');
          setDescription(found.description || '');
          setImageUrl(found.image_url || PRESET_IMAGES[0].url);
          setCtaText(found.cta_text || 'Pelajari Selengkapnya');
          setCtaUrl(found.cta_url || 'https://');
          setStartDate(found.start_date ? found.start_date.split('T')[0] : '');
          setEndDate(found.end_date ? found.end_date.split('T')[0] : '');
          setIsActive(found.is_active ?? true);
          setClicksCount(found.clicks_count || 0);
        } else {
          alert('Iklan tidak ditemukan');
          router.push('/admin/iklan');
        }
      } catch {
        alert('Gagal memuat data iklan');
      } finally {
        setLoading(false);
      }
    }
    loadAd();
  }, [adId, router]);

  const selectedSlotMeta = AD_SLOTS.find((s) => s.slot === slot) || AD_SLOTS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName.trim() || !headline.trim() || !ctaUrl.trim()) {
      alert('Mohon lengkapi Nama Sponsor, Headline, dan Link CTA.');
      return;
    }

    setSubmitting(true);
    try {
      await saveAdvertisement({
        id: adId,
        sponsor_name: sponsorName,
        badge_text: badgeText.toUpperCase(),
        slot,
        headline,
        description: description.trim() || null,
        image_url: imageUrl,
        cta_text: ctaText,
        cta_url: ctaUrl,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        is_active: isActive,
      });

      router.push('/admin/iklan');
    } catch (err: any) {
      alert(err?.message || 'Gagal memperbarui iklan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <FaIcon name="arrows-rotate" spin className="text-3xl text-indigo-600 mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-400">Memuat detail iklan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/iklan"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900 transition-colors"
          >
            <FaIcon name="arrow-left" className="text-xs" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Edit Iklan Sponsor
            </h1>
            <p className="text-xs text-slate-500">
              Perbarui materi promosi, ganti posisi slot, atau ubah periode penayangan iklan.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
          <FaIcon name="arrow-pointer" className="text-xs" />
          <span className="text-xs font-bold">{clicksCount} Total Klik</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5"
          >
            {/* Slot & Sponsor Section */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                1. Posisi & Identitas Sponsor
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Posisi Slot Iklan *
                  </label>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value as AdSlot)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {AD_SLOTS.map((s) => (
                      <option key={s.slot} value={s.slot}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {selectedSlotMeta.location}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Iklan
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="Contoh: SPONSOR, PARTNER, PROMO"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Sponsor / Brand *
                </label>
                <input
                  type="text"
                  required
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  placeholder="Contoh: PT Cloud Host Indonesia"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Content & Creative Section */}
            <div className="space-y-4 pt-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                2. Konten Promosi & Banner
              </h2>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Headline / Judul Iklan *
                </label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Contoh: Deploy Database & Web App Anda dengan VPS Super Cepat"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Penjelasan Singkat
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan keunggulan produk atau penawaran sponsor..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL Gambar Banner *
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                
                {/* Preset image suggestions */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 mr-1">Preset Cepat:</span>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`rounded-lg px-2 py-0.5 text-[9px] font-bold border transition-colors ${
                        imageUrl === preset.url
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA & Link Section */}
            <div className="space-y-4 pt-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                3. Call to Action (CTA) & Link Tujuan
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Teks Tombol CTA *
                  </label>
                  <input
                    type="text"
                    required
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Contoh: Klaim Diskon 50%"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    URL Link Tujuan *
                  </label>
                  <input
                    type="url"
                    required
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://sponsor.com/landing"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Schedule & Status Section */}
            <div className="space-y-4 pt-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                4. Durasi Penayangan & Status
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Mulai Tayang (Opsional)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Selesai (Opsional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Status Penayangan (Aktif)
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Jika aktif, iklan akan langsung muncul di slot terpilih di toko online.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/admin/iklan"
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
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

        {/* Live Real-time Preview Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <FaIcon name="eye" className="text-[10px]" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Pratinjau Live Banner
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Slot: {slot}
              </span>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/75 p-4 dark:border-slate-800 dark:bg-slate-900/60 shadow-inner">
              <AdBanner
                variant={selectedSlotMeta.defaultVariant}
                sponsorName={sponsorName || 'Nama Sponsor'}
                headline={headline || 'Tulis headline iklan di formulir...'}
                description={description || 'Deskripsi singkat promo sponsor akan tampil di sini secara menarik.'}
                ctaText={ctaText || 'Kunjungi'}
                ctaUrl={ctaUrl || 'https://'}
                imageUrl={imageUrl}
                badgeText={badgeText || 'SPONSOR'}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FaIcon name="chart-simple" className="text-indigo-500" /> Statistik Iklan Ini
              </h4>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-500">Total Klik Akumulasi:</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{clicksCount} Klik</span>
              </div>
              <p className="text-slate-400 text-[10px] pt-1">
                Lokasi: {selectedSlotMeta.label} ({selectedSlotMeta.location}).
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
