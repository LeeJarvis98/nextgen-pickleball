import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { RegistrationCategory } from '@/types';

// Force dynamic so Next.js never caches this route handler response.
export const dynamic = 'force-dynamic';

// Returns current used-slot counts per tournament per category (confirmed registrations only).
// Lightweight endpoint used for client-side polling so the homepage stays up-to-date
// without a full page reload.
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('registrations')
      .select('tournament_id, category')
      .eq('status', 'confirmed');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
    }

    // Build map: tournamentId → category → usedCount
    const usedCounts: Record<string, Record<RegistrationCategory, number>> = {};
    for (const reg of data ?? []) {
      if (!reg.tournament_id) continue;
      for (const cat of (reg.category as string[])) {
        usedCounts[reg.tournament_id] ??= {} as Record<RegistrationCategory, number>;
        const t = usedCounts[reg.tournament_id];
        t[cat as RegistrationCategory] = (t[cat as RegistrationCategory] ?? 0) + 1;
      }
    }

    return NextResponse.json(usedCounts, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
