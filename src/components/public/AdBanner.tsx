'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaIcon } from '@/components/ui/FaIcon';

export interface AdBannerProps {
  variant?: 'full' | 'compact' | 'slim';
  sponsorName?: string;
  headline?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
  badgeText?: string;
  className?: string;
}

export function AdBanner({
  variant = 'full',
  sponsorName = 'Partner Resmi papayey.id',
  headline = 'Deploy Aplikasi & Database Anda dengan Cloud VPS Performa Tinggi',
  description = 'Server super cepat dengan latensi lokal Indonesia, proteksi DDoS 24/7, dan setup otomatis 1-klik untuk project Next.js & PostgreSQL Anda.',
  ctaText = 'Klaim Diskon 60%',
  ctaUrl = 'https://example.com/sponsor',
  imageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60',
  badgeText = 'SPONSOR',
  className = '',
}: AdBannerProps) {
  // Variant 1: Slim / Bar Style (Great for tops of pages, search, or headers)
  if (variant === 'slim') {
    return (
      <aside aria-label="Iklan Sponsor" className={`relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 p-3 sm:p-4 dark:border-indigo-900/40 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 shadow-sm ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
              <FaIcon name="bell" className="text-[8px]" />
              {badgeText}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {headline}
            </span>
            <span className="hidden md:inline text-xs text-slate-400">· {sponsorName}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
            >
              {ctaText}
              <FaIcon name="arrow-up-right-from-square" className="text-[10px]" />
            </a>
          </div>
        </div>
      </aside>
    );
  }

  // Variant 2: Compact Card (Great for sidebars, category pages, or below forms)
  if (variant === 'compact') {
    return (
      <aside aria-label="Iklan Sponsor" className={`relative overflow-hidden rounded-[24px] clay-card p-4 sm:p-5 border border-white/80 dark:border-slate-800/80 transition-all ${className}`}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <FaIcon name="bell" className="text-[8px]" />
              {badgeText}
            </span>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              {sponsorName}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Iklan</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {imageUrl && (
            <div className="relative aspect-video sm:aspect-square w-full sm:w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              <Image
                src={imageUrl}
                alt={headline}
                fill
                sizes="(max-width: 640px) 100vw, 112px"
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-2 flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
              {headline}
            </h4>
            {description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
            <div className="pt-1 flex items-center gap-3">
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="clay-btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
              >
                {ctaText}
                <FaIcon name="arrow-up-right-from-square" className="text-[10px]" />
              </a>
              <Link
                href="/admin"
                className="text-[11px] text-slate-400 hover:text-indigo-600 transition-colors"
              >
                Pasang Iklan?
              </Link>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Variant 3: Full Rich Leaderboard (Default)
  return (
    <section aria-label="Iklan Sponsor" className={`relative overflow-hidden rounded-[32px] clay-card p-4 sm:p-7 border border-white/80 dark:border-slate-800/80 transition-all ${className}`}>
      
      {/* Tiny Ad / Sponsor Tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <FaIcon name="bell" className="text-[10px]" />
            {badgeText}
          </span>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            {sponsorName}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 hover:text-slate-500 font-semibold tracking-wide cursor-default">
          Ruang Iklan Terverifikasi
        </span>
      </div>

      {/* Main Banner Content */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:items-center">
        
        {/* Visual Media (5 cols) */}
        <div className="relative aspect-[16/9] md:aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-inner md:col-span-5">
          <Image
            src={imageUrl}
            alt={headline}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Copy & CTA (7 cols) */}
        <div className="space-y-3.5 md:col-span-7">
          <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            {headline}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="clay-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              {ctaText}
              <FaIcon name="arrow-up-right-from-square" className="text-xs" />
            </a>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Pasang Iklan di Sini?
            </Link>
          </div>
        </div>

      </div>

    </section>
  );
}

export default AdBanner;
