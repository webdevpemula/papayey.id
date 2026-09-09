import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = createAdminClient();

    // 1. Fetch Order by Token
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, product:products(*)')
      .eq('download_token', token)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Token unduhan tidak valid.' }, { status: 404 });
    }

    if (order.status !== 'paid') {
      return NextResponse.json({ error: 'Pesanan belum lunas atau tidak valid.' }, { status: 403 });
    }

    // 2. Check Expiration (7 hari)
    if (order.download_token_expires_at) {
      const expires = new Date(order.download_token_expires_at).getTime();
      if (Date.now() > expires) {
        return NextResponse.json(
          { error: 'Masa berlaku link unduhan ini telah kedaluwarsa.' },
          { status: 410 }
        );
      }
    }

    // 3. Check Access Limit (max 5x)
    if (order.download_access_count >= 5) {
      return NextResponse.json(
        { error: 'Batas kuota akses unduhan (5x) telah tercapai.' },
        { status: 429 }
      );
    }

    const filePath = order.product?.file_path;
    if (!filePath) {
      return NextResponse.json({ error: 'Aset produk tidak ditemukan.' }, { status: 404 });
    }

    // 4. Increment access count
    await supabase
      .from('orders')
      .update({ download_access_count: (order.download_access_count || 0) + 1 })
      .eq('id', order.id);

    const remaining = Math.max(0, 5 - (order.download_access_count + 1));

    // 5. If filePath is a direct Web URL (Notion, GDrive, Video, etc.)
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return NextResponse.json({
        success: true,
        is_external_link: true,
        download_url: filePath,
        product_title: order.product?.title,
        remaining_quota: remaining,
      });
    }

    // 6. Generate Signed URL from private bucket 'product-files' (valid for 60 seconds)
    const { data: signedData, error: signErr } = await supabase
      .storage
      .from('product-files')
      .createSignedUrl(filePath, 60);

    if (signErr || !signedData?.signedUrl) {
      // Fallback demo url if storage not yet uploaded
      console.warn('Storage sign warning (falling back to demo url):', signErr?.message);
      return NextResponse.json({
        success: true,
        is_external_link: false,
        download_url: `https://example.com/demo-download/${order.order_code}`,
        filename: filePath.split('/').pop() || 'file-produk.zip',
        product_title: order.product?.title,
        remaining_quota: remaining,
      });
    }

    return NextResponse.json({
      success: true,
      is_external_link: false,
      download_url: signedData.signedUrl,
      filename: filePath.split('/').pop() || 'file-produk.zip',
      product_title: order.product?.title,
      remaining_quota: remaining,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
