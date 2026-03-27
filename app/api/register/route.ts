import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { registrationSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { partner_names, notes, ...required } = parsed.data;
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        ...required,
        partner_names:
          partner_names && Object.keys(partner_names).length > 0 ? partner_names : null,
        notes: notes || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Đăng ký thất bại. Vui lòng thử lại.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ. Vui lòng thử lại.' }, { status: 500 });
  }
}
