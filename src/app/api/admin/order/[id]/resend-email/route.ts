import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendDownloadEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: order } = await supabase.from('orders').select('*, product:products(*)').eq('id', id).single();
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (!order.download_token) {
      return NextResponse.json({ error: 'Pesanan ini belum memiliki token download aktif.' }, { status: 400 });
    }

    const res = await sendDownloadEmail({
      buyerEmail: order.buyer_email,
      buyerName: order.buyer_name,
      productTitle: order.product?.title || 'Produk Digital',
      orderCode: order.order_code,
      downloadToken: order.download_token,
      expiresAt: order.download_token_expires_at || '',
    });

    if (res.success) {
      await supabase.from('orders').update({ email_sent: true }).eq('id', id);
      return NextResponse.json({ message: 'Email tautan unduhan berhasil dikirimkan.' });
    } else {
      return NextResponse.json({ error: res.error || 'Gagal mengirim email.' }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
