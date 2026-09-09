import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkMidtransStatus } from '@/lib/midtrans';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const statusResult = await checkMidtransStatus(order.order_code);
    const txStatus = statusResult.transaction_status;

    let newStatus = order.status;
    if (['settlement', 'capture'].includes(txStatus)) newStatus = 'paid';
    else if (['deny', 'cancel'].includes(txStatus)) newStatus = 'failed';
    else if (txStatus === 'expire') newStatus = 'expired';

    await supabase.from('orders').update({ status: newStatus }).eq('id', id);

    return NextResponse.json({
      message: `Status berhasil disinkronkan ke: ${newStatus} (Midtrans: ${txStatus})`,
      new_status: newStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
