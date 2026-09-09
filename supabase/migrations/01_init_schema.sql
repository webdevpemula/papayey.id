-- ==============================================================================
-- SKEMA DATABASE PAPAYEY.ID (SUPABASE POSTGRESQL)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABEL CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price INT NOT NULL, -- Dalam satuan Rupiah penuh (integer)
    thumbnail_url TEXT NOT NULL,
    preview_images TEXT[] DEFAULT '{}',
    file_path TEXT NOT NULL, -- Path file di Supabase Storage (private bucket 'product-files')
    is_active BOOLEAN DEFAULT true NOT NULL,
    stock_type TEXT DEFAULT 'unlimited' NOT NULL CHECK (stock_type IN ('unlimited', 'limited')),
    stock_qty INT NULL,
    sold_count INT DEFAULT 0 NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE NOT NULL, -- Format: INV-YYYYMMDD-XXXX (ID Transaksi Midtrans)
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_name TEXT NULL,
    price INT NOT NULL, -- Snapshot harga saat order dibuat
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'refunded')),
    midtrans_transaction_id TEXT NULL,
    midtrans_payment_type TEXT NULL,
    download_token TEXT UNIQUE NULL,
    download_token_expires_at TIMESTAMPTZ NULL,
    download_access_count INT DEFAULT 0 NOT NULL,
    email_sent BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    paid_at TIMESTAMPTZ NULL,
    notes TEXT NULL
);

-- 4. TABEL ADMIN USERS
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEKS PERFORMA
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON public.orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_download_token ON public.orders(download_token);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);

-- TRIGGER UPDATE updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_update_products_updated_at ON public.products;
CREATE TRIGGER trg_update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin full access to categories" ON public.categories FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to products" ON public.products FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Public can view their own order by code" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Admin full access to orders" ON public.orders FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admin can view admin users" ON public.admin_users FOR ALL TO authenticated
    USING (id = auth.uid());

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('thumbnails', 'thumbnails', true),
    ('product-files', 'product-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');
CREATE POLICY "Admin insert thumbnails" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'thumbnails');
CREATE POLICY "Admin manage thumbnails" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'thumbnails');
CREATE POLICY "Admin manage product files" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'product-files');
