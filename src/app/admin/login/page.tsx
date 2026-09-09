'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FaIcon } from '@/components/ui/FaIcon';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login. Periksa email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-sm space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 p-2 shadow-lg shadow-indigo-500/10 border border-indigo-100 dark:border-indigo-900/50 mb-2">
            <Image
              src="/logo-icon.png"
              alt="papayey.id"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin papayey.id</h1>
          <p className="text-xs text-slate-500">Masuk untuk mengelola produk, pesanan, dan analitik.</p>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Owner
            </label>
            <div className="relative">
              <FaIcon name="envelope" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
              <input
                type="email"
                required
                placeholder="owner@papayey.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <FaIcon name="lock" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {loading ? <FaIcon name="arrows-rotate" spin className="text-sm" /> : 'Masuk Dashboard'}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
            <FaIcon name="arrow-left" className="text-xs" /> Kembali ke Halaman Toko
          </Link>
        </div>

      </div>
    </div>
  );
}
