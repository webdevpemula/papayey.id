import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createChargeTransaction } from '@/lib/midtrans';
import { mockProducts } from '@/lib/mockData';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { logSecurityEvent } from '@/lib/securityAudit';

const checkoutSchema = z.object({
  productId: z.string().min(1, 'Product ID wajib diisi'),
  buyerEmail: z.string().email('Format email tidak valid'),
  buyerName: z.string().optional().nullable(),
  paymentMethod: z.string().default('bni_va'),
});

const ESSENTIAL_PRODUCT_FIELDS = 'id, title, price, is_active, stock_type, stock_qty';

export async function POST(req: NextRequest) {
  try {
    // 0. Rate Limiting Protection (Max 5 checkout requests per minute per IP)
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`checkout:${ip}`, 5, 60 * 1000);
    if (!rateCheck.success) {
      logSecurityEvent({
        eventType: 'RATE_LIMIT_EXCEEDED',
        path: '/api/checkout',
        method: 'POST',
        ip,
        details: { limit: rateCheck.limit, resetSeconds: rateCheck.resetSeconds },
      });

      return NextResponse.json(
        {
          error: `Terlalu banyak permintaan checkout. Silakan coba lagi dalam ${rateCheck.resetSeconds} detik.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetSeconds),
          },
        }
      );
    }

    const body = await req.json();
    const validated = checkoutSchema.parse(body);

    const supabase = createAdminClient();

    // 1. Fetch Product by UUID or slug using targeted fields
    let product: any = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validated.productId);

    if (isUuid) {
      const { data: dbProduct } = await supabase
        .from('products')
        .select(ESSENTIAL_PRODUCT_FIELDS)
        .eq('id', validated.productId)
        .single();
      if (dbProduct) {
        product = dbProduct;
      }
    } else {
      // If productId was passed as slug
      const { data: dbProductBySlug } = await supabase
        .from('products')
        .select(ESSENTIAL_PRODUCT_FIELDS)
        .eq('slug', validated.productId)
        .single();
      if (dbProductBySlug) {
        product = dbProductBySlug;
      }
    }

    if (!product) {
      // Check mockProducts by ID or slug
      const foundMock = mockProducts.find((p) => p.id === validated.productId || p.slug === validated.productId);
      if (foundMock) {
        // Try finding matching product in db by slug to ensure valid UUID
        const { data: dbProductMatch } = await supabase
          .from('products')
          .select(ESSENTIAL_PRODUCT_FIELDS)
          .eq('slug', foundMock.slug)
          .single();
        product = dbProductMatch || foundMock;
      }
    }

    if (!product || !product.is_active) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan atau sedang tidak aktif.' },
        { status: 400 }
      );
    }

    // 2. Check stock
    if (product.stock_type === 'limited' && (product.stock_qty ?? 0) <= 0) {
      return NextResponse.json(
        { error: 'Maaf, kuota stok produk ini telah habis.' },
        { status: 400 }
      );
    }

    // 3. Generate Custom Order Code: INV-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderCode = `INV-${dateStr}-${randomHex}`;

    // 4. Call Midtrans Core API (Direct Charge) for Selected Payment Method
    const chargeResult = await createChargeTransaction({
      orderCode,
      grossAmount: product.price,
      buyerEmail: validated.buyerEmail,
      buyerName: validated.buyerName,
      paymentMethod: validated.paymentMethod,
      itemDetails: [
        {
          id: product.id,
          name: product.title.substring(0, 50),
          price: product.price,
          quantity: 1,
        },
      ],
    });

    // 5. Create Order in DB (status: pending, with normalized payment details in notes)
    const { error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        product_id: product.id,
        buyer_email: validated.buyerEmail.toLowerCase().trim(),
        buyer_name: validated.buyerName?.trim() || null,
        price: product.price,
        status: 'pending',
        midtrans_payment_type: chargeResult.payment_method,
        notes: JSON.stringify(chargeResult),
        download_access_count: 0,
        email_sent: false,
      });

    if (orderErr) {
      console.error('DB Order Insert Error:', orderErr);
      return NextResponse.json(
        { error: 'Gagal membuat data pesanan di sistem: ' + orderErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order_code: orderCode,
      payment_details: chargeResult,
    });
  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses checkout pesanan.' },
      { status: 500 }
    );
  }
}
