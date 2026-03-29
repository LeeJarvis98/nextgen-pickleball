import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Determine which refund stage (A/B/C/D) the cancellation falls in based on
 * how far the current time is from the tournament start date.
 *
 * A = registration → 7 days before start  (100% refund)
 * B = 7 days       → 4 days before start  (70%  refund)
 * C = 4 days       → 1 day  before start  (40%  refund)
 * D = 1 day before start or later          (0%   refund)
 */
function getCancellationStage(startDateStr: string): string {
  const now = new Date();
  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const tournament = new Date(sy, sm - 1, sd);
  tournament.setHours(0, 0, 0, 0);

  const stageB = new Date(tournament);
  stageB.setDate(stageB.getDate() - 7);
  const stageC = new Date(tournament);
  stageC.setDate(stageC.getDate() - 4);
  const stageD = new Date(tournament);
  stageD.setDate(stageD.getDate() - 1);

  if (now < stageB) return 'A';
  if (now < stageC) return 'B';
  if (now < stageD) return 'C';
  return 'D';
}

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
      .select('id, email, phone, status, tournament_id, tournaments(tournament_schedule(start_date))')
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

    // Track the refund stage for confirmed registrations so admin knows how much to refund.
    let cancelled_at_stage: string | null = null;
    if (reg.status === 'confirmed') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const startDate = (reg.tournaments as any)?.tournament_schedule?.start_date as string | undefined;
      if (startDate) {
        cancelled_at_stage = getCancellationStage(startDate);
      }
    }

    const { error: updateError } = await supabase
      .from('registrations')
      .update({ status: 'cancelled', cancelled_at_stage })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Khong the huy dang ky. Vui long thu lai.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Loi may chu. Vui long thu lai.' }, { status: 500 });
  }
}