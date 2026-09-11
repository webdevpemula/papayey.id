'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaIcon } from '@/components/ui/FaIcon';

interface ProductImageGalleryProps {
  title: string;
  images: string[];
}

export function ProductImageGallery({ title, images }: ProductImageGalleryProps) {
  // Ensure we have at least 1 image and at most 7
  const validImages =
    images && images.length > 0
      ? images.slice(0, 7)
      : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'];

  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4 select-none">
      
      {/* Main Active Image Viewport */}
      <div className="group relative aspect-video w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Image
          src={validImages[activeIndex]}
          alt={`${title} - Thumbnail ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover transition-transform duration-500 ease-out"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
            <FaIcon name="camera" className="text-[10px]" />
            {activeIndex + 1} / {validImages.length} Foto
          </span>

          {activeIndex === 0 && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-indigo-600/95 backdrop-blur-md px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
              Sampul Utama
            </span>
          )}
        </div>

        {/* Navigation Arrows (Arrow Left & Arrow Right with comfortable safe padding) */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Thumbnail Sebelumnya"
              className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 text-slate-800 shadow-lg shadow-black/15 backdrop-blur-md hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 opacity-90 hover:opacity-100 dark:bg-slate-900/95 dark:text-white dark:shadow-black/40 z-20"
            >
              <FaIcon name="arrow-left" className="text-sm" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Thumbnail Berikutnya"
              className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 text-slate-800 shadow-lg shadow-black/15 backdrop-blur-md hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 opacity-90 hover:opacity-100 dark:bg-slate-900/95 dark:text-white dark:shadow-black/40 z-20"
            >
              <FaIcon name="arrow-right" className="text-sm" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row Strip (with generous padding to prevent animation / ring / shadow clipping) */}
      {validImages.length > 1 && (
        <div className="pt-1 pb-1">
          <div className="flex items-center gap-3 overflow-x-auto p-2 scrollbar-none sm:scrollbar-thin scroll-smooth">
            {validImages.map((img, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative aspect-video h-14 sm:h-16 shrink-0 overflow-hidden rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950 shadow-md scale-100 -translate-y-0.5'
                      : 'opacity-70 hover:opacity-100 border border-slate-200 dark:border-slate-800 hover:-translate-y-0.5 hover:shadow-sm'
                  }`}
                  aria-label={`Pilih foto ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail mini ${idx + 1}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 right-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
