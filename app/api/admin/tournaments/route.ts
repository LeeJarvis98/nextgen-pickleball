import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('tournaments')
    .select(
      `id, name, status, sort_order,
      tournament_schedule ( start_date, end_date, display_date, check_in_time, opening_time, closing_time ),
      tournament_venues ( name, image_url, logo_url, courts, court_type, city, country ),
      tournament_prizes ( total_prize ),
      tournament_prize_entries ( id, rank, title, amount, bonus ),
      tournament_registration_info ( deadline, deadline_date_time, total_slots, registration_link, cta_title, cta_description, features, available_categories, doubles_partner_mode, category_slots, category_fees, entry_fee_mode, entry_fee )`
    )
    .order('sort_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.name) {
    return NextResponse.json({ error: 'id and name required' }, { status: 400 });
  }
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('tournaments')
    .insert({ id: body.id, name: body.name, status: body.status ?? 'UPCOMING', sort_order: body.sort_order ?? 0 })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
