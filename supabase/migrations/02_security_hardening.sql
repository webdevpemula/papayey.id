-- ==============================================================================
-- SECURITY HARDENING MIGRATION FOR PAPAYEY.ID
-- ==============================================================================

-- 1. Tighten ORDERS Table RLS
-- Drop the overly permissive public policy that allowed anyone with anon key to dump all orders
DROP POLICY IF EXISTS "Public can view their own order by code" ON public.orders;

-- Only authenticated admins can query orders directly via Supabase client.
-- Public clients retrieve their order details via secure server route /api/order/[code]/status
DROP POLICY IF EXISTS "Admin full access to orders" ON public.orders;
CREATE POLICY "Admin full access to orders" ON public.orders
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- 2. ADVERTISEMENTS Table RLS
ALTER TABLE IF EXISTS public.advertisements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active advertisements" ON public.advertisements;
CREATE POLICY "Public can view active advertisements" ON public.advertisements
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access to advertisements" ON public.advertisements;
CREATE POLICY "Admin full access to advertisements" ON public.advertisements
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
