import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const tournamentId = req.nextUrl.searchParams.get('tournament_id')?.trim() ?? '';
    if (!tournamentId) {
      return NextResponse.json({ error: 'tournament_id is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const [{ data: participants, error }, { data: tournament }, { data: regInfo }] = await Promise.all([
      supabase
        .from('registrations')
        .select('full_name, category')
        .eq('tournament_id', tournamentId)
        .eq('status', 'confirmed')
        .order('full_name'),
      supabase
        .from('tournaments')
        .select('name')
        .eq('id', tournamentId)
        .single(),
      supabase
        .from('tournament_registration_info')
        .select('group_url')
        .eq('tournament_id', tournamentId)
        .single(),
    ]);

    if (error) throw error;

    return NextResponse.json({
      tournament_name: tournament?.name ?? 'Giải đấu',
      participants: participants ?? [],
      group_url: (regInfo?.group_url as string | null) ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ. Vui lòng thử lại.' }, { status: 500 });
  }
}