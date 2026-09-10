import { Advertisement, AdSlot } from '@/types/database';
import { mockAds } from '@/lib/mockData';
import { createClient } from '@/lib/supabase/client';

export interface SlotMeta {
  slot: AdSlot;
  label: string;
  location: string;
  recommendedSize: string;
  defaultVariant: 'full' | 'compact' | 'slim';
  badgeColor: string;
}

export const AD_SLOTS: SlotMeta[] = [
  {
    slot: 'home_main',
    label: 'Beranda Utama (Leaderboard)',
    location: 'Tengah halaman depan (Home) sebelum katalog produk',
    recommendedSize: '1200 x 450 px (Rasio 16:9 atau Banner Luas)',
    defaultVariant: 'full',
    badgeColor: 'bg-indigo-500 text-white dark:bg-indigo-600',
  },
  {
    slot: 'home_bottom',
    label: 'Beranda Bawah (Secondary Card)',
    location: 'Bawah halaman depan setelah grid produk',
    recommendedSize: '800 x 500 px (Rasio 4:3 atau Compact Card)',
    defaultVariant: 'compact',
    badgeColor: 'bg-amber-500 text-white dark:bg-amber-600',
  },
  {
    slot: 'product_detail',
    label: 'Halaman Detail Produk',
    location: 'Bawah informasi produk dan tombol checkout',
    recommendedSize: '800 x 500 px (Compact Card)',
    defaultVariant: 'compact',
    badgeColor: 'bg-emerald-500 text-white dark:bg-emerald-600',
  },
  {
    slot: 'category',
    label: 'Halaman Kategori',
    location: 'Bawah daftar produk kategori persona',
    recommendedSize: '800 x 500 px (Compact Card)',
    defaultVariant: 'compact',
    badgeColor: 'bg-purple-500 text-white dark:bg-purple-600',
  },
  {
    slot: 'search',
    label: 'Halaman Pencarian Produk',
    location: 'Bawah filter dan hasil pencarian aset',
    recommendedSize: '800 x 400 px (Compact / Slim)',
    defaultVariant: 'compact',
    badgeColor: 'bg-sky-500 text-white dark:bg-sky-600',
  },
  {
    slot: 'download',
    label: 'Portal Download (Eksklusif Pembeli)',
    location: 'Bawah tombol unduh aset pembeli setelah bayar',
    recommendedSize: '800 x 500 px (Penawaran Spesial)',
    defaultVariant: 'compact',
    badgeColor: 'bg-rose-500 text-white dark:bg-rose-600',
  },
];

const LOCAL_STORAGE_KEY = 'papayey_advertisements_v1';

// Helper to get local stored ads
function getLocalAds(): Advertisement[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return null;
}

// Helper to save local ads
function setLocalAds(ads: Advertisement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ads));
  } catch {}
}

/**
 * Fetch all advertisements from Supabase, localStorage, or mockData
 */
export async function getAdvertisements(): Promise<Advertisement[]> {
  // 1. Try Supabase first
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setLocalAds(data);
      return data as Advertisement[];
    }
  } catch {}

  // 2. Fallback to localStorage
  const local = getLocalAds();
  if (local && local.length > 0) {
    return local;
  }

  // 3. Fallback to mockData and seed localStorage
  setLocalAds(mockAds);
  return mockAds;
}

/**
 * Get single ad by ID
 */
export async function getAdvertisementById(id: string): Promise<Advertisement | null> {
  const ads = await getAdvertisements();
  return ads.find((a) => a.id === id) || null;
}

/**
 * Get active ad for a specific slot
 */
export async function getActiveAdBySlot(slot: AdSlot): Promise<Advertisement | null> {
  const ads = await getAdvertisements();
  const now = new Date().toISOString();

  // Find active ad that matches slot and within date range if set
  const match = ads.find((ad) => {
    if (!ad.is_active || ad.slot !== slot) return false;
    if (ad.start_date && ad.start_date > now) return false;
    if (ad.end_date && ad.end_date < now) return false;
    return true;
  });

  return match || null;
}

/**
 * Create or update advertisement
 */
export async function saveAdvertisement(
  adData: Omit<Advertisement, 'id' | 'created_at' | 'clicks_count'> & { id?: string }
): Promise<Advertisement> {
  const currentAds = await getAdvertisements();
  let savedAd: Advertisement;

  if (adData.id) {
    // Update existing
    const existing = currentAds.find((a) => a.id === adData.id);
    savedAd = {
      ...existing,
      ...adData,
      id: adData.id,
      clicks_count: existing?.clicks_count ?? 0,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Advertisement;

    // Try Supabase update
    try {
      const supabase = createClient();
      await supabase.from('advertisements').update(savedAd).eq('id', savedAd.id);
    } catch {}

    const updatedList = currentAds.map((a) => (a.id === savedAd.id ? savedAd : a));
    setLocalAds(updatedList);
  } else {
    // Create new
    const newId = 'ad-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    savedAd = {
      ...adData,
      id: newId,
      clicks_count: 0,
      impressions_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try Supabase insert
    try {
      const supabase = createClient();
      await supabase.from('advertisements').insert(savedAd);
    } catch {}

    const updatedList = [savedAd, ...currentAds];
    setLocalAds(updatedList);
  }

  return savedAd;
}

/**
 * Delete advertisement by ID
 */
export async function deleteAdvertisement(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    await supabase.from('advertisements').delete().eq('id', id);
  } catch {}

  const currentAds = await getAdvertisements();
  const updatedList = currentAds.filter((a) => a.id !== id);
  setLocalAds(updatedList);
  return true;
}

/**
 * Toggle advertisement active status
 */
export async function toggleAdStatus(id: string, currentStatus: boolean): Promise<boolean> {
  const newStatus = !currentStatus;
  try {
    const supabase = createClient();
    await supabase.from('advertisements').update({ is_active: newStatus }).eq('id', id);
  } catch {}

  const currentAds = await getAdvertisements();
  const updatedList = currentAds.map((a) => (a.id === id ? { ...a, is_active: newStatus } : a));
  setLocalAds(updatedList);
  return newStatus;
}

/**
 * Record a click on an ad
 */
export async function recordAdClick(id: string): Promise<void> {
  try {
    const currentAds = await getAdvertisements();
    const target = currentAds.find((a) => a.id === id);
    if (!target) return;

    const newClicks = (target.clicks_count || 0) + 1;
    const updatedList = currentAds.map((a) => (a.id === id ? { ...a, clicks_count: newClicks } : a));
    setLocalAds(updatedList);

    // Supabase update async
    try {
      const supabase = createClient();
      await supabase.from('advertisements').update({ clicks_count: newClicks }).eq('id', id);
    } catch {}
  } catch {}
}
