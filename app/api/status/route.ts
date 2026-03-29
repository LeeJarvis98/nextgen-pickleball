import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

function looksLikeEmail(s: string): boolean {
  const at = s.indexOf('@');
  return at > 0 && at < s.length - 1 && s.slice(at + 1).includes('.');
}

async function lookupRegistrations(query: string) {
  const supabase = createServerSupabaseClient();
  const field = looksLikeEmail(query) ? 'email' : 'phone';
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id, full_name, category, status, created_at, tournament_id,
      tournaments(
        name, status,
        tournament_venues(logo_url, image_url, name, city, country, courts, court_type),
        tournament_schedule(display_date, start_date, end_date, check_in_time, opening_time, closing_time, schedule_status),
        tournament_prizes(total_prize),
        tournament_registration_info(deadline, total_slots, entry_fee_mode, entry_fee, category_fees, category_slots, rules_url)
      )
    `)
    .eq(field, query)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
    if (q.length < 6) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email hoặc số điện thoại hợp lệ (ít nhất 6 ký tự)' },
        { status: 400 },
      );
    }
    const data = await lookupRegistrations(q);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ. Vui lòng thử lại.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const query = typeof body?.query === 'string' ? body.query.trim() : '';

    if (query.length < 6) {
      return NextResponse.json(
        { error: 'Vui long nhap email hoac so dien thoai hop le (it nhat 6 ky tu)' },
        { status: 400 },
      );
    }

    const data = await lookupRegistrations(query);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Loi may chu. Vui long thu lai.' }, { status: 500 });
  }
}