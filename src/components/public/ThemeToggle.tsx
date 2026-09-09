'use client';

import React, { useEffect, useState } from 'react';
import { FaIcon } from '@/components/ui/FaIcon';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored) {
      setTheme(stored);
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const nextTheme = isDark ? 'light' : 'dark';

    // 1. Immediate DOM class toggle (0ms latency, zero jank)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Update state & storage
    setTheme(nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch {}
  };

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Ganti mode terang / gelap"
      className="clay-toggle relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl transition-all duration-200 hover:scale-105 active:scale-90 select-none"
    >
      <div className="relative h-5 w-5 pointer-events-none flex items-center justify-center">
        <span
          className={`absolute inset-0 flex items-center justify-center text-amber-500 transition-all duration-200 ease-out ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        >
          <FaIcon name="sun" className="text-base" />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center text-indigo-300 transition-all duration-200 ease-out ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        >
          <FaIcon name="moon" className="text-base" />
        </span>
      </div>
    </button>
  );
}
