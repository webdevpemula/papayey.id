import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createSnapTransaction } from '@/lib/midtrans';
import { mockProducts } from '@/lib/mockData';

const checkoutSchema = z.object({
  productId: z.string().min(1, 'Product ID wajib diisi'),
  buyerEmail: z.string().email('Format email tidak valid'),
  buyerName: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = checkoutSchema.parse(body);

    const supabase = createAdminClient();

    // 1. Fetch Product by UUID or slug
    let product: any = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validated.productId);

    if (isUuid) {
      const { data: dbProduct } = await supabase
        .from('products')
        .select('*')
        .eq('id', validated.productId)
        .single();
      if (dbProduct) {
        product = dbProduct;
      }
    } else {
      // If productId was passed as slug
      const { data: dbProductBySlug } = await supabase
        .from('products')
        .select('*')
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
          .select('*')
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

    // 4. Create Order in DB (status: pending)
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        product_id: product.id,
        buyer_email: validated.buyerEmail.toLowerCase().trim(),
        buyer_name: validated.buyerName?.trim() || null,
        price: product.price,
        status: 'pending',
        download_access_count: 0,
        email_sent: false,
      })
      .select()
      .single();

    if (orderErr) {
      console.error('DB Order Insert Error:', orderErr);
      return NextResponse.json(
        { error: 'Gagal membuat data pesanan di sistem: ' + orderErr.message },
        { status: 500 }
      );
    }

    // 5. Create Midtrans Snap Transaction
    const snapResult = await createSnapTransaction({
      orderCode,
      grossAmount: product.price,
      buyerEmail: validated.buyerEmail,
      buyerName: validated.buyerName,
      itemDetails: [
        {
          id: product.id,
          name: product.title.substring(0, 50),
          price: product.price,
          quantity: 1,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      order_code: orderCode,
      snap_token: snapResult.token,
      redirect_url: snapResult.redirect_url,
    });
  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses checkout pesanan.' },
      { status: 500 }
    );
  }
}
