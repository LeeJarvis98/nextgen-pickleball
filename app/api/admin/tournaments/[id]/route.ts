import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { table, data: payload } = body as { table: string; data: Record<string, unknown> };

  const ALLOWED_TABLES = [
    'tournaments',
    'tournament_schedule',
    'tournament_venues',
    'tournament_prizes',
    'tournament_prize_entries',
    'tournament_registration_info',
  ] as const;

  type AllowedTable = typeof ALLOWED_TABLES[number];

  if (!ALLOWED_TABLES.includes(table as AllowedTable)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
  }

  // Prize entries require a full delete-then-insert because rows are identified by (tournament_id, rank)
  // and the set of ranks may change (entries added/removed/reordered).
  if (table === 'tournament_prize_entries') {
    const entries = payload.entries as Array<{
      rank: number; title: string; amount: string; bonus: string;
    }>;
    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: 'entries must be an array' }, { status: 400 });
    }
    const { error: delError } = await supabase
      .from('tournament_prize_entries')
      .delete()
      .eq('tournament_id', id);
    if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });
    if (entries.length > 0) {
      const rows = entries.map((e, i) => ({
        tournament_id: id,
        rank: i + 1,
        title: e.title,
        amount: e.amount,
        bonus: e.bonus || null,
      }));
      const { error: insError } = await supabase.from('tournament_prize_entries').insert(rows);
      if (insError) return NextResponse.json({ error: insError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  const fkColumn = table === 'tournaments' ? 'id' : 'tournament_id';
  const { error } = await supabase.from(table as AllowedTable).update(payload).eq(fkColumn, id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('tournaments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}