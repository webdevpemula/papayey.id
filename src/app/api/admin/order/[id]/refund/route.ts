import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logSecurityEvent } from '@/lib/securityAudit';
import { getClientIp } from '@/lib/rateLimit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const reason = body.reason || 'Refund manual oleh owner';
    const ip = getClientIp(req);

    const supabase = createAdminClient();

    // Fetch order to verify existence and log order_code
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_code, price, status, buyer_email')
      .eq('id', id)
      .single();

    await supabase.from('orders').update({
      status: 'refunded',
      notes: reason,
    }).eq('id', id);

    logSecurityEvent({
      eventType: 'ADMIN_REFUND_EXECUTED',
      path: `/api/admin/order/${id}/refund`,
      method: 'POST',
      ip,
      orderCode: order?.order_code,
      details: {
        orderId: id,
        previousStatus: order?.status,
        amount: order?.price,
        reason,
      },
    });

    return NextResponse.json({ message: 'Order berhasil di-set sebagai refunded.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
