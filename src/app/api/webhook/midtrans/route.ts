import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyMidtransSignature } from '@/lib/midtrans';
import { sendDownloadEmail } from '@/lib/email';
import { logSecurityEvent } from '@/lib/securityAudit';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const orderId = payload.order_id;
    const statusCode = payload.status_code;
    const grossAmount = payload.gross_amount;
    const signatureKey = payload.signature_key;
    const transactionStatus = payload.transaction_status;
    const fraudStatus = payload.fraud_status;
    const transactionId = payload.transaction_id;
    const paymentType = payload.payment_type;

    if (!orderId || !statusCode || !grossAmount) {
      return NextResponse.json({ error: 'Missing required payload' }, { status: 400 });
    }

    // 1. VERIFIKASI SIGNATURE (WAJIB UNTUK KEAMANAN)
    const isSignatureValid = verifyMidtransSignature({
      orderId,
      statusCode,
      grossAmount,
      signatureKey,
    });

    if (!isSignatureValid) {
      logSecurityEvent({
        eventType: 'WEBHOOK_SIGNATURE_FAILURE',
        path: '/api/webhook/midtrans',
        method: 'POST',
        orderCode: orderId,
        details: { statusCode, grossAmount },
      });
      return NextResponse.json({ error: 'Invalid signature key' }, { status: 403 });
    }

    const supabase = createAdminClient();

    // 2. Fetch Existing Order
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*, product:products(*)')
      .eq('order_code', orderId)
      .single();

    if (fetchErr || !order) {
      console.warn('Order not found in DB:', orderId);
      return NextResponse.json({ message: 'Order noted but not found in DB' }, { status: 200 });
    }

    // Cegah double-processing jika sudah dibayar
    if (order.status === 'paid') {
      return NextResponse.json({ message: 'Order already paid' }, { status: 200 });
    }

    // 3. Tentukan status baru sesuai standar Midtrans
    let newStatus = order.status;
    let isPaid = false;

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        newStatus = 'paid';
        isPaid = true;
      }
    } else if (transactionStatus === 'settlement') {
      newStatus = 'paid';
      isPaid = true;
    } else if (['cancel', 'deny'].includes(transactionStatus)) {
      newStatus = 'failed';
    } else if (transactionStatus === 'expire') {
      newStatus = 'expired';
    } else if (transactionStatus === 'pending') {
      newStatus = 'pending';
    }

    // 4. Update Order jika Paid
    if (isPaid) {
      const downloadToken = crypto.randomBytes(24).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 hari

      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          midtrans_transaction_id: transactionId,
          midtrans_payment_type: paymentType,
          download_token: downloadToken,
          download_token_expires_at: expiresAt,
        })
        .eq('id', order.id);

      if (updateErr) {
        console.error('Failed to update order to paid:', updateErr);
      }

      // Decrement stock & increment sold count
      if (order.product) {
        const updates: any = {
          sold_count: (order.product.sold_count || 0) + 1,
        };

        if (order.product.stock_type === 'limited' && order.product.stock_qty != null) {
          updates.stock_qty = Math.max(0, order.product.stock_qty - 1);
        }

        await supabase.from('products').update(updates).eq('id', order.product.id);
      }

      // Kirim email notifikasi unduhan
      try {
        const emailResult = await sendDownloadEmail({
          buyerEmail: order.buyer_email,
          buyerName: order.buyer_name,
          productTitle: order.product?.title || 'Produk Digital',
          orderCode: order.order_code,
          downloadToken: downloadToken,
          expiresAt: expiresAt,
        });

        if (emailResult.success) {
          await supabase.from('orders').update({ email_sent: true }).eq('id', order.id);
          console.log(`✅ Email sent successfully to ${order.buyer_email} for order ${order.order_code}`);
        } else {
          console.error(`⚠️ Email sending failed: ${emailResult.error}`);
        }
      } catch (emailErr) {
        console.error('Non-blocking email delivery error:', emailErr);
      }

    } else {
      // Update non-paid status (failed / expired / pending)
      await supabase
        .from('orders')
        .update({
          status: newStatus,
          midtrans_transaction_id: transactionId,
          midtrans_payment_type: paymentType,
        })
        .eq('id', order.id);
    }

    console.log(`✅ Midtrans webhook processed: ${orderId} -> ${newStatus}`);
    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
