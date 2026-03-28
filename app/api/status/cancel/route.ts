import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === 'string' ? body.id.trim() : '';
    const q = typeof body?.q === 'string' ? body.q.trim() : '';

    if (!id || q.length < 6) {
      return NextResponse.json({ error: 'Du lieu khong hop le.' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data: reg, error: fetchError } = await supabase
      .from('registrations')
      .select('id, email, phone, status')
      .eq('id', id)
      .single();

    if (fetchError || !reg) {
      return NextResponse.json({ error: 'Khong tim thay dang ky.' }, { status: 404 });
    }

    const isOwner = reg.email === q || reg.phone === q;
    if (!isOwner) {
      return NextResponse.json({ error: 'Khong co quyen thuc hien hanh dong nay.' }, { status: 403 });
    }

    if (reg.status === 'cancelled' || reg.status === 'rejected') {
      return NextResponse.json(
        { error: 'Dang ky nay da bi huy hoac tu choi.' },
        { status: 409 },
      );
    }

    const { error: updateError } = await supabase
      .from('registrations')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Khong the huy dang ky. Vui long thu lai.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Loi may chu. Vui long thu lai.' }, { status: 500 });
  }
}