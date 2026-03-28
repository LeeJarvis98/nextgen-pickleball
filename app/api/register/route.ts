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

    // Check for duplicate: block only if an active (pending/confirmed) registration
    // exists with the same email or phone for this tournament.
    // Cancelled and rejected registrations are ignored — those users may re-register.
    const { data: existing, error: checkError } = await supabase
      .from('registrations')
      .select('id, email, phone')
      .eq('tournament_id', required.tournament_id)
      .in('status', ['pending', 'confirmed'])
      .or(`email.eq.${required.email},phone.eq.${required.phone}`)
      .limit(1);

    if (checkError) {
      console.error('Duplicate check error:', checkError);
      return NextResponse.json({ error: 'Đăng ký thất bại. Vui lòng thử lại.' }, { status: 500 });
    }

    if (existing && existing.length > 0) {
      const duplicate = existing[0];
      const field =
        duplicate.email === required.email && duplicate.phone === required.phone
          ? 'Email và số điện thoại này'
          : duplicate.email === required.email
            ? 'Email này'
            : 'Số điện thoại này';
      return NextResponse.json(
        { error: `${field} đã được dùng để đăng ký giải đấu. Mỗi người chỉ được đăng ký một lần.` },
        { status: 409 },
      );
    }

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
