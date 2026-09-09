import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const reason = body.reason || 'Refund manual oleh owner';

    const supabase = createAdminClient();
    await supabase.from('orders').update({
      status: 'refunded',
      notes: reason,
    }).eq('id', id);

    return NextResponse.json({ message: 'Order berhasil di-set sebagai refunded.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
