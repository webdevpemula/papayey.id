'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Download, CheckCircle2, AlertCircle, FileArchive, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';

export default function DownloadPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
  const [externalUrl, setExternalUrl] = useState<string | null>(null);
  const [productTitle, setProductTitle] = useState<string | null>(null);

  const handleAccess = async () => {
    setDownloading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/download/${token}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyiapkan akses produk.');
      }

      setRemainingQuota(data.remaining_quota);
      setProductTitle(data.product_title);

      if (data.is_external_link) {
        setExternalUrl(data.download_url);
        setSuccessMsg('Tautan akses berhasil dibuka!');
        window.open(data.download_url, '_blank');
      } else {
        setSuccessMsg('File sedang diunduh ke perangkat Anda...');
        window.location.href = data.download_url;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengakses produk.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Beranda
      </Link>

      <div className="clay-card rounded-[32px] p-6 sm:p-8 text-center shadow-lg space-y-6">
        
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <FileArchive className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Portal Akses Produk</h1>
          <p className="text-xs text-slate-500">
            Terima kasih atas pembelian Anda di <strong className="text-slate-800 dark:text-slate-200">papayey.id</strong>. Produk digital Anda telah terverifikasi dan siap diakses.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300 flex items-start gap-2 text-left">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center gap-2 text-left">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Security & Access Info */}
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 text-left space-y-2.5 text-xs border border-slate-100 dark:border-slate-700/50 text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Masa Berlaku Akses:</span>
            <span className="text-emerald-600 font-bold">7 Hari Sejak Pembelian</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Batas Unduh / Buka:</span>
            <span className="font-bold">Maksimal 5 Kali</span>
          </div>
          {remainingQuota !== null && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Sisa Kuota Akses:</span>
              <span className="font-black text-indigo-600 dark:text-indigo-400">{remainingQuota} kali</span>
            </div>
          )}
        </div>

        {/* Main Action Trigger */}
        <div className="space-y-3">
          <button
            onClick={handleAccess}
            disabled={downloading}
            className="clay-btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 px-6 text-sm font-bold text-white shadow-lg disabled:opacity-50 transition-all active:scale-95"
          >
            {downloading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Menyiapkan Akses Produk...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Unduh File / Buka Tautan Produk
              </>
            )}
          </button>

          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
            >
              Buka link secara manual jika tab tidak terbuka otomatis <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          * Salinan link unduhan ini juga telah dikirimkan ke alamat email Anda sebagai cadangan.
        </p>

      </div>
    </div>
  );
}
