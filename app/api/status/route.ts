import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

function looksLikeEmail(s: string): boolean {
  const at = s.indexOf('@');
  return at > 0 && at < s.length - 1 && s.slice(at + 1).includes('.');
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

    const supabase = createServerSupabaseClient();
    const field = looksLikeEmail(query) ? 'email' : 'phone';

    const { data, error } = await supabase
      .from('registrations')
      .select('id, full_name, category, status, created_at, tournament_id')
      .eq(field, query)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: 'Loi may chu. Vui long thu lai.' }, { status: 500 });
  }
}