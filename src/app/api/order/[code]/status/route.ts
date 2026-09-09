import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select('order_code, status, price, buyer_email, buyer_name, paid_at, download_token, download_token_expires_at, product:products(title, thumbnail_url)')
      .eq('order_code', code)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const prod: any = Array.isArray(order.product) ? order.product[0] : order.product;

    return NextResponse.json({
      order_code: order.order_code,
      status: order.status,
      price: order.price,
      buyer_email: order.buyer_email,
      buyer_name: order.buyer_name,
      paid_at: order.paid_at,
      download_token: order.status === 'paid' ? order.download_token : null,
      download_token_expires_at: order.download_token_expires_at,
      product: {
        title: prod?.title || 'Produk Digital',
        thumbnail_url: prod?.thumbnail_url,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
