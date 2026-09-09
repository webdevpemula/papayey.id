'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Heart, 
  Code2, 
  Gamepad2, 
  Landmark, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface SlideItem {
  id: string;
  tag: string;
  badgeIcon: any;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  gradientClass: string;
  personaHighlight: string;
}

const slides: SlideItem[] = [
  {
    id: 'slide-all',
    tag: 'MARKETPLACE PRODUK DIGITAL PRIBADI',
    badgeIcon: Sparkles,
    title: 'Aset Digital Pilihan dari Dad, Engineer, Gamer & ASN Corner.',
    description: 'Kumpulan blueprint praktis, starter kit coding, preset gaming, hingga modul karir pemerintahan terkurasi. Bayar aman via QRIS/VA dan unduh langsung seketika.',
    primaryCta: { label: 'Jelajahi 4 Kategori', href: '#koleksi' },
    secondaryCta: { label: 'Cek Status Order', href: '/order/cek' },
    gradientClass: 'clay-hero',
    personaHighlight: 'Semua Persona',
  },
  {
    id: 'slide-ayah',
    tag: 'PROMO DAD CORNER • BLUEPRINT 2026',
    badgeIcon: Heart,
    title: 'Financial Blueprint Ayah Muda: Dana Pendidikan & Masa Depan Anak.',
    description: 'Spreadsheet otomatis Excel & Sheets untuk merencanakan dana darurat, simulasi tabungan berjenjang TK-Kuliah, dan proteksi asuransi keluarga tanpa overthinking.',
    primaryCta: { label: 'Dapatkan Sekarang (Rp 79.000)', href: '/produk/financial-blueprint-ayah-muda' },
    secondaryCta: { label: 'Dad Corner', href: '/kategori/dad-corner' },
    gradientClass: 'bg-gradient-to-br from-rose-600 via-rose-700 to-amber-700',
    personaHighlight: 'Dad Corner',
  },
  {
    id: 'slide-engineer',
    tag: 'STARTER KIT ENGINEER CORNER • PRODUCTION READY',
    badgeIcon: Code2,
    title: 'Production-Ready SaaS Boilerplate Next.js 15, Supabase & Midtrans.',
    description: 'Hemat ratusan jam coding. Sudah termasuk integrasi payment webhook terverifikasi, auth session, secure storage download, dan Tailwind v4.',
    primaryCta: { label: 'Akses Source Code (Rp 149.000)', href: '/produk/production-saas-boilerplate-nextjs-midtrans' },
    secondaryCta: { label: 'Engineer Corner', href: '/kategori/engineer-corner' },
    gradientClass: 'bg-gradient-to-br from-indigo-800 via-indigo-900 to-blue-950',
    personaHighlight: 'Engineer Corner',
  },
  {
    id: 'slide-gamer',
    tag: 'GAMER CORNER • OPTIMALISASI 2026',
    badgeIcon: Gamepad2,
    title: 'Ultimate Game Backlog Tracker & Preset Handheld Steam Deck / Ally.',
    description: 'Organisir daftar game yang ingin ditamatkan, lacak pencapaian trophy hunter, dan nikmati preset grafis stabil 40+ FPS hemat baterai di sela waktu luang.',
    primaryCta: { label: 'Cek Gamer Corner', href: '/kategori/gamer-corner' },
    secondaryCta: { label: 'Lihat Detail Preset', href: '/produk/preset-optimasi-handheld-pc' },
    gradientClass: 'bg-gradient-to-br from-purple-800 via-purple-900 to-indigo-950',
    personaHighlight: 'Gamer Corner',
  },
  {
    id: 'slide-asn',
    tag: 'KIT TAKTIS ASN CORNER • TERLARIS 300+ TRANSAKSI',
    badgeIcon: Landmark,
    title: 'Kit Taktis Sukses SKD CPNS/PPPK & Template Otomasi SKP Tahunan.',
    description: 'Modul penalaran cepat materi HOTS, bank soal trik analogi & hitung cepat, serta template Excel macro penyusunan laporan logbook kinerja ASN.',
    primaryCta: { label: 'Unduh Kit SKD (Rp 69.000)', href: '/produk/kit-taktis-sukses-skd-cpns-pppk' },
    secondaryCta: { label: 'ASN Corner', href: '/kategori/asn-corner' },
    gradientClass: 'bg-gradient-to-br from-amber-700 via-amber-800 to-slate-900',
    personaHighlight: 'ASN Corner',
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, []);

  // Auto-play timer (5.5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const slide = slides[current];
  const IconComponent = slide.badgeIcon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-[36px] transition-all shadow-xl shadow-indigo-950/20"
    >
      <AnimatePresence mode="wait">
        <motion.section
          key={slide.id}
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -25 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`relative overflow-hidden px-6 py-12 sm:px-12 sm:py-16 text-white min-h-[440px] flex flex-col justify-between ${slide.gradientClass}`}
        >
          {/* Main Slide Content */}
          <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-6">
            
            {/* Promo / Badge Tag */}
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/20 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold tracking-wide text-white border border-white/30 shadow-sm">
              <IconComponent className="h-3.5 w-3.5 text-amber-300" />
              {slide.tag}
            </div>
            
            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-none">
              {slide.title}
            </h1>

            {/* Subcopy */}
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium line-clamp-3 sm:line-clamp-none">
              {slide.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={slide.primaryCta.href}
                className="clay-btn-white inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                {slide.primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={slide.secondaryCta.href}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 border border-white/25 px-5 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-white/25 transition-all"
              >
                {slide.secondaryCta.label}
              </Link>
            </div>

            {/* Persona Quick Indicator Pills */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold text-white/80">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1 border border-white/15">
                <Heart className="h-3 w-3 text-rose-300" /> Dad Corner
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1 border border-white/15">
                <Code2 className="h-3 w-3 text-sky-300" /> Engineer Corner
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1 border border-white/15">
                <Gamepad2 className="h-3 w-3 text-purple-300" /> Gamer Corner
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1 border border-white/15">
                <Landmark className="h-3 w-3 text-amber-300" /> ASN Corner
              </span>
            </div>

          </div>

          {/* Decorative Floating Clay Blobs */}
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-black/20 blur-2xl pointer-events-none" />
        </motion.section>
      </AnimatePresence>

      {/* Slider Controls Bar (Bottom Overlay) */}
      <div className="absolute bottom-5 right-6 sm:right-10 z-20 flex items-center gap-3">
        
        {/* Clay Arrow Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevSlide}
            type="button"
            aria-label="Slide Sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/50 active:scale-90 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextSlide}
            type="button"
            aria-label="Slide Selanjutnya"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/50 active:scale-90 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Tactile Pill Indicators */}
        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              aria-label={`Buka Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === idx ? 'w-6 bg-white shadow-sm' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

      </div>

    </div>
  );
}
