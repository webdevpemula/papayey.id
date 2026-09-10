import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/public/Navbar';
import { MobileBottomNav } from '@/components/public/MobileBottomNav';
import { Footer } from '@/components/public/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'papayey.id — Marketplace Produk Digital Pribadi',
  description: 'Tempat beli ebook, template, preset, source code, dan kelas online digital terbaik dengan akses unduhan instan.',
  icons: {
    icon: '/logo-icon.png',
    shortcut: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="stylesheet" href="/fontawesome/css/fontawesome.css" />
        <link rel="stylesheet" href="/fontawesome/css/slab-regular.css" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50/50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
