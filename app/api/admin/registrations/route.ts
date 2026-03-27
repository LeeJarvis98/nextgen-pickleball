import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get('tournament_id');
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (tournamentId) query = query.eq('tournament_id', tournamentId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}