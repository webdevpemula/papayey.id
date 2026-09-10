'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatRupiah, formatDate } from '@/lib/utils';
import { FaIcon } from '@/components/ui/FaIcon';
import { PaymentLogo } from '@/components/public/PaymentLogo';

interface OrderStatusData {
  order_code: string;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
  price: number;
  buyer_email: string;
  buyer_name: string | null;
  paid_at: string | null;
  download_token: string | null;
  download_token_expires_at: string | null;
  payment_details?: {
    payment_method: string;
    channel_name: string;
    channel_type: 'va' | 'qris' | 'bill' | 'ewallet';
    va_number?: string;
    bank?: string;
    biller_code?: string;
    bill_key?: string;
    qr_url?: string;
    qr_string?: string;
    deeplink_url?: string;
    expiry_time?: string;
    gross_amount: number;
    order_code: string;
  } | null;
  product: {
    title: string;
    thumbnail_url: string;
  };
}

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [data, setData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<'mbanking' | 'atm' | 'ibanking'>('mbanking');
  const [checkingManual, setCheckingManual] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/order/${code}/status`);
      if (res.ok) {
        const json = await res.json();
        setData(json);

        // Stop polling if status reached final state
        if (['paid', 'failed', 'expired', 'refunded'].includes(json.status)) {
          setIsPolling(false);
        }
      }
    } catch (err) {
      console.error('Failed to poll order status', err);
    } finally {
      setLoading(false);
      setCheckingManual(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    if (!isPolling) return;

    // Smart Adaptive Polling: pauses when tab is hidden, immediate check on tab focus
    let interval: any = null;
    let pollCount = 0;
    const maxPolls = 170; // ~10 minutes max polling duration

    const startPolling = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        if (document.hidden) return; // Save server resources if tab not active
        pollCount++;
        if (pollCount > maxPolls) {
          setIsPolling(false);
          clearInterval(interval);
          return;
        }
        fetchStatus();
      }, 3500);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && isPolling) {
        fetchStatus(); // Instant check when user refocuses tab
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [code, isPolling]);

  const copyToClipboard = (text: string, keyName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleManualCheck = () => {
    setCheckingManual(true);
    fetchStatus();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex items-center justify-center">
          <FaIcon name="arrows-rotate" spin className="text-3xl text-indigo-600" />
        </div>
        <p className="text-xs text-slate-500">Memeriksa status pembayaran #{code}...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex items-center justify-center">
          <FaIcon name="triangle-exclamation" className="text-5xl text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pesanan Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">Nomor pesanan #{code} tidak tercatat di sistem.</p>
        <Link href="/" className="inline-block text-xs font-bold text-indigo-600 hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const isPaid = data.status === 'paid';
  const isPending = data.status === 'pending';
  const isFailed = ['failed', 'expired', 'refunded'].includes(data.status);
  const details = data.payment_details;

  const bankName = details?.bank?.toLowerCase() || 'bni';
  const logoType = (['bni', 'mandiri', 'bca', 'bri', 'permata', 'qris', 'gopay', 'shopeepay'].includes(bankName) 
    ? bankName 
    : (details?.channel_type === 'qris' ? 'qris' : 'bni')) as any;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:py-12 space-y-6">
      {/* Back Link */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
        <FaIcon name="arrow-left" className="text-xs" /> Kembali ke Toko
      </Link>

      {/* Main Status Container */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 text-center shadow-lg shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none space-y-6">
        
        {/* State 1: Paid */}
        {isPaid && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <FaIcon name="circle-check" className="text-4xl" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Pembayaran Berhasil!</h1>
              <p className="text-xs text-slate-500">Terima kasih, produk digital Anda siap untuk diakses.</p>
            </div>

            {/* Action Button */}
            {data.download_token && (
              <Link
                href={`/download/${data.download_token}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-[0.98] transition-all"
              >
                <FaIcon name="arrow-down-to-line" className="text-base" />
                Akses & Unduh Produk Sekarang
              </Link>
            )}
          </div>
        )}

        {/* State 2: Pending (Embedded Payment Guide) */}
        {isPending && (
          <div className="space-y-6 text-left">
            {/* Header Status */}
            <div className="text-center space-y-2">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 animate-pulse">
                <FaIcon name="clock" className="text-3xl" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Selesaikan Pembayaran
              </h1>
              <p className="text-xs text-slate-500">
                Lakukan pembayaran sesuai instruksi di bawah ini. Status akan terverifikasi secara otomatis.
              </p>

              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 mt-2">
                <FaIcon name="arrows-rotate" spin className="text-xs text-indigo-600" />
                <span>Menunggu transfer masuk...</span>
              </div>
            </div>

            {/* Total Payment Highlight Card */}
            <div className="rounded-2xl bg-indigo-50/60 p-4 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Tagihan
                </span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatRupiah(data.price)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(data.price.toString(), 'amount')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm hover:bg-slate-50 border border-indigo-100 dark:border-indigo-900/50 transition-all active:scale-95"
              >
                {copiedKey === 'amount' ? (
                  <>
                    <FaIcon name="check" className="text-xs text-emerald-600" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <FaIcon name="newspaper" className="text-xs" />
                    <span>Salin Jumlah</span>
                  </>
                )}
              </button>
            </div>

            {/* CHANNEL 1: QRIS */}
            {details?.channel_type === 'qris' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 pb-1">
                  <PaymentLogo channel="qris" className="h-7 w-auto" />
                </div>

                {details.qr_url ? (
                  <div className="relative mx-auto w-64 h-64 rounded-2xl border-2 border-slate-100 bg-white p-2 shadow-sm dark:border-slate-800 flex items-center justify-center">
                    <Image
                      src={details.qr_url}
                      alt="QRIS Code Midtrans"
                      width={240}
                      height={240}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="p-8 text-xs text-slate-400">Kode QRIS sedang disiapkan...</div>
                )}

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
                  Buka aplikasi <strong>GoPay, OVO, DANA, ShopeePay, BCA Mobile</strong>, atau m-Banking apa pun, lalu scan kode QR di atas.
                </p>

                {details.qr_url && (
                  <a
                    href={details.qr_url}
                    download={`QRIS-${data.order_code}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <FaIcon name="arrow-down-to-line" className="text-xs" /> Unduh / Simpan Gambar QR
                  </a>
                )}
              </div>
            )}

            {/* CHANNEL 2: VIRTUAL ACCOUNT (BNI, BCA, BRI, Permata) */}
            {details?.channel_type === 'va' && details.va_number && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <PaymentLogo channel={logoType} className="h-6 w-auto" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {details.channel_name}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    Nomor Virtual Account
                  </span>
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="font-mono text-base sm:text-lg font-black tracking-wider text-slate-900 dark:text-white select-all">
                      {details.va_number}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(details.va_number!, 'va')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      {copiedKey === 'va' ? (
                        <>
                          <FaIcon name="check" className="text-xs" />
                          <span>Disalin!</span>
                        </>
                      ) : (
                        <>
                          <FaIcon name="newspaper" className="text-xs" />
                          <span>Salin VA</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Instructions Accordion / Tabs */}
                <div className="pt-2 space-y-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Petunjuk Pembayaran:
                  </span>
                  <div className="flex gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setActiveGuideTab('mbanking')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        activeGuideTab === 'mbanking' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      m-Banking
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveGuideTab('atm')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        activeGuideTab === 'atm' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      ATM
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveGuideTab('ibanking')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        activeGuideTab === 'ibanking' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      Internet Banking
                    </button>
                  </div>

                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeGuideTab === 'mbanking' && (
                      <>
                        <li>Buka aplikasi Mobile Banking bank Anda dan login.</li>
                        <li>Pilih menu <strong>Transfer &gt; Virtual Account Billing</strong>.</li>
                        <li>Masukkan Nomor VA: <strong className="font-mono">{details.va_number}</strong>.</li>
                        <li>Pastikan nama tagihan dan nominal sesuai ({formatRupiah(data.price)}).</li>
                        <li>Masukkan PIN transaksi Anda untuk menyelesaikan pembayaran.</li>
                      </>
                    )}
                    {activeGuideTab === 'atm' && (
                      <>
                        <li>Masukkan kartu ATM dan PIN Anda di mesin ATM.</li>
                        <li>Pilih menu <strong>Transaksi Lainnya &gt; Transfer &gt; Virtual Account</strong>.</li>
                        <li>Masukkan Nomor VA: <strong className="font-mono">{details.va_number}</strong>.</li>
                        <li>Periksa rincian pembayaran di layar ATM lalu tekan <strong>Ya/Benar</strong>.</li>
                      </>
                    )}
                    {activeGuideTab === 'ibanking' && (
                      <>
                        <li>Buka portal Internet Banking bank Anda.</li>
                        <li>Pilih menu <strong>Pembayaran &gt; Tagihan Virtual Account</strong>.</li>
                        <li>Ketik nomor VA <strong className="font-mono">{details.va_number}</strong>.</li>
                        <li>Otorisasi transaksi menggunakan token bank Anda.</li>
                      </>
                    )}
                  </ol>
                </div>
              </div>
            )}

            {/* CHANNEL 3: MANDIRI BILL */}
            {details?.channel_type === 'bill' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <PaymentLogo channel="mandiri" className="h-6 w-auto" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Mandiri Bill Payment
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Kode Perusahaan (Biller)
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        {details.biller_code || '70012'}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(details.biller_code || '70012', 'biller')}
                        className="text-[11px] font-bold text-indigo-600 hover:underline"
                      >
                        {copiedKey === 'biller' ? 'Disalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Nomor Pelanggan (Bill Key)
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        {details.bill_key}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(details.bill_key || '', 'billkey')}
                        className="text-[11px] font-bold text-indigo-600 hover:underline"
                      >
                        {copiedKey === 'billkey' ? 'Disalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Cara Bayar di Livin' by Mandiri:</span>
                  <p>1. Buka Livin' by Mandiri &gt; Menu <strong>Bayar</strong>.</p>
                  <p>2. Cari penyedia jasa / masukkan Kode Perusahaan <strong>{details.biller_code || '70012'}</strong>.</p>
                  <p>3. Masukkan Bill Key <strong>{details.bill_key}</strong> dan konfirmasi pembayaran.</p>
                </div>
              </div>
            )}

            {/* CHANNEL 4: E-WALLET (GoPay / ShopeePay) */}
            {details?.channel_type === 'ewallet' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 text-center space-y-4">
                <div className="flex justify-center">
                  <PaymentLogo channel={logoType} className="h-7 w-auto" />
                </div>

                {details.deeplink_url && (
                  <a
                    href={details.deeplink_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    <FaIcon name="arrow-up-right-from-square" className="text-xs" />
                    Buka Aplikasi Pembayaran
                  </a>
                )}

                {details.qr_url && (
                  <div className="pt-2 space-y-2">
                    <p className="text-xs text-slate-500">Atau scan QR code di bawah menggunakan ponsel:</p>
                    <div className="relative mx-auto w-48 h-48 rounded-xl border p-2 bg-white">
                      <Image src={details.qr_url} alt="E-wallet QR" fill className="object-contain p-2" unoptimized />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Check Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleManualCheck}
                disabled={checkingManual}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 px-4 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                <FaIcon name="arrows-rotate" spin={checkingManual} className="text-xs text-indigo-600" />
                {checkingManual ? 'Memeriksa ke Bank...' : 'Saya Sudah Bayar (Cek Status Sekarang)'}
              </button>
            </div>
          </div>
        )}

        {/* State 3: Failed / Expired */}
        {isFailed && (
          <>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <FaIcon name="circle-xmark" className="text-4xl" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {data.status === 'expired' ? 'Pesanan Kedaluwarsa' : 'Pembayaran Gagal'}
              </h1>
              <p className="text-xs text-slate-500">
                Transaksi ini telah dibatalkan atau melewati batas waktu pembayaran.
              </p>
            </div>
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 px-6 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all"
            >
              Pesan Ulang Produk
              <FaIcon name="arrow-right" className="text-sm" />
            </Link>
          </>
        )}

        {/* Details Box */}
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 text-left space-y-2.5 text-xs border border-slate-100 dark:border-slate-700/50">
          <div className="flex justify-between">
            <span className="text-slate-400">Kode Order</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">#{data.order_code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Produk</span>
            <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">{data.product.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Email Pembeli</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{data.buyer_email}</span>
          </div>
          {data.paid_at && (
            <div className="flex justify-between">
              <span className="text-slate-400">Waktu Bayar</span>
              <span className="text-slate-700 dark:text-slate-300">{formatDate(data.paid_at)}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
