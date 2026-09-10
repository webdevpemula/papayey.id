import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkMidtransStatus } from '@/lib/midtrans';
import { sendDownloadEmail } from '@/lib/email';

// In-memory throttling map to prevent hammering Midtrans API during rapid client polling
const lastExternalCheck = new Map<string, number>();
const MIDTRANS_THROTTLE_MS = 25000; // 25 seconds between external Midtrans API queries per order

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = createAdminClient();

    // Select targeted columns to minimize database bandwidth & memory
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_code, status, price, buyer_email, buyer_name, paid_at, download_token, download_token_expires_at, notes, midtrans_payment_type, created_at, product_id, product:products(id, title, thumbnail_url, stock_type, stock_qty, sold_count)')
      .eq('order_code', code)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    let currentStatus = order.status;
    let paidAt = order.paid_at;
    let downloadToken = order.download_token;
    let downloadTokenExpiresAt = order.download_token_expires_at;

    // Check if client explicitly requests real-time sync (e.g., clicked "Saya Sudah Bayar")
    const searchParams = req.nextUrl.searchParams;
    const isManualSync = searchParams.get('sync') === 'true' || searchParams.get('check') === 'true';

    const now = Date.now();
    const lastCheckTime = lastExternalCheck.get(order.order_code) || 0;
    const timeSinceLastCheck = now - lastCheckTime;
    const shouldCheckMidtrans = currentStatus === 'pending' && (isManualSync || timeSinceLastCheck > MIDTRANS_THROTTLE_MS);

    // 1. Proactively check Midtrans status only when throttle expires or manual sync is requested
    if (shouldCheckMidtrans) {
      lastExternalCheck.set(order.order_code, now);

      try {
        const midtransData = await checkMidtransStatus(order.order_code);
        const transStatus = midtransData?.transaction_status;
        const fraudStatus = midtransData?.fraud_status;

        const isPaid = (transStatus === 'capture' && fraudStatus === 'accept') || transStatus === 'settlement';

        if (isPaid) {
          currentStatus = 'paid';
          paidAt = new Date().toISOString();
          downloadToken = crypto.randomBytes(24).toString('hex');
          downloadTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          lastExternalCheck.delete(order.order_code);

          // Update in DB
          await supabase
            .from('orders')
            .update({
              status: 'paid',
              paid_at: paidAt,
              download_token: downloadToken,
              download_token_expires_at: downloadTokenExpiresAt,
              midtrans_transaction_id: midtransData.transaction_id,
            })
            .eq('id', order.id);

          // Update stock & sold_count
          const prodObj: any = Array.isArray(order.product) ? order.product[0] : order.product;
          if (prodObj) {
            const updates: any = {
              sold_count: (prodObj.sold_count || 0) + 1,
            };
            if (prodObj.stock_type === 'limited' && prodObj.stock_qty != null) {
              updates.stock_qty = Math.max(0, prodObj.stock_qty - 1);
            }
            await supabase.from('products').update(updates).eq('id', prodObj.id || order.product_id);
          }

          // Send confirmation email asynchronously without blocking status response
          sendDownloadEmail({
            buyerEmail: order.buyer_email,
            buyerName: order.buyer_name,
            productTitle: prodObj?.title || 'Produk Digital',
            orderCode: order.order_code,
            downloadToken: downloadToken,
            expiresAt: downloadTokenExpiresAt,
          }).then(async (emailRes) => {
            if (emailRes.success) {
              await supabase.from('orders').update({ email_sent: true }).eq('id', order.id);
            }
          }).catch((err) => console.error('Email send error on sync:', err));

        } else if (['cancel', 'deny'].includes(transStatus)) {
          currentStatus = 'failed';
          lastExternalCheck.delete(order.order_code);
          await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
        } else if (transStatus === 'expire') {
          currentStatus = 'expired';
          lastExternalCheck.delete(order.order_code);
          await supabase.from('orders').update({ status: 'expired' }).eq('id', order.id);
        }
      } catch {
        // Fallback gracefully to DB status if Midtrans status check encounters timeout
      }
    }

    // 2. Parse payment details from notes
    let paymentDetails = null;
    if (order.notes) {
      try {
        paymentDetails = JSON.parse(order.notes);
      } catch {
        paymentDetails = null;
      }
    }

    const prod: any = Array.isArray(order.product) ? order.product[0] : order.product;

    return NextResponse.json(
      {
        order_code: order.order_code,
        status: currentStatus,
        price: order.price,
        buyer_email: order.buyer_email,
        buyer_name: order.buyer_name,
        paid_at: paidAt,
        created_at: order.created_at,
        download_token: currentStatus === 'paid' ? downloadToken : null,
        download_token_expires_at: downloadTokenExpiresAt,
        payment_details: paymentDetails,
        product: {
          title: prod?.title || 'Produk Digital',
          thumbnail_url: prod?.thumbnail_url,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
