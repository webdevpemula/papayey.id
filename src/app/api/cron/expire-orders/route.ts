import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    // Optional Bearer token validation for Vercel Cron
    const authHeader = req.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Expire pending orders older than 24 hours
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: expiredList, error } = await supabase
      .from('orders')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('created_at', cutoffDate)
      .select('id, order_code');

    if (error) {
      throw error;
    }

    console.log(`⏰ Auto-expired ${expiredList?.length || 0} pending orders older than 24h.`);

    return NextResponse.json({
      success: true,
      expired_count: expiredList?.length || 0,
      expired_orders: expiredList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
