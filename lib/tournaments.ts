import { createServerSupabaseClient } from './supabase-server';
import type { Tournament, RegistrationCategory, CategorySlotInfo } from '@/types';

export async function getTournaments(): Promise<Tournament[]> {
  const supabase = createServerSupabaseClient();

  const [{ data, error }, { data: regRows }] = await Promise.all([
    supabase
      .from('tournaments')
      .select(`
        id, name, status,
        tournament_schedule ( start_date, end_date, display_date, check_in_time, opening_time, closing_time, schedule_status ),
        tournament_venues ( name, image_url, logo_url, courts, court_type, city, country ),
        tournament_prizes ( total_prize ),
        tournament_prize_entries ( rank, title, amount, bonus ),
        tournament_registration_info ( deadline, deadline_date_time, total_slots, registration_link, cta_title, cta_description, features, available_categories, doubles_partner_mode, category_slots, category_fees, entry_fee_mode, entry_fee, group_url )
      `)
      .order('sort_order'),
    // Count registrations per tournament+category (confirmed only)
    supabase
      .from('registrations')
      .select('tournament_id, category')
      .eq('status', 'confirmed'),
  ]);

  if (error || !data) {
    console.error('Failed to fetch tournaments:', error);
    return [];
  }

  // Build a map: tournamentId → category → count
  const usedCounts: Record<string, Record<string, number>> = {};
  for (const reg of regRows ?? []) {
    if (!reg.tournament_id) continue;
    for (const cat of (reg.category as string[])) {
      usedCounts[reg.tournament_id] ??= {};
      usedCounts[reg.tournament_id][cat] = (usedCounts[reg.tournament_id][cat] ?? 0) + 1;
    }
  }

  return data.map((row) => {
    // PostgREST returns 1:1 relations as objects when FK is PK, but we handle both shapes
    const sched = Array.isArray(row.tournament_schedule) ? row.tournament_schedule[0] : row.tournament_schedule;
    const venue = Array.isArray(row.tournament_venues) ? row.tournament_venues[0] : row.tournament_venues;
    const prizesRow = Array.isArray(row.tournament_prizes) ? row.tournament_prizes[0] : row.tournament_prizes;
    const regInfo = Array.isArray(row.tournament_registration_info) ? row.tournament_registration_info[0] : row.tournament_registration_info;
    const prizeEntries = Array.isArray(row.tournament_prize_entries)
      ? row.tournament_prize_entries
      : [];

    return {
      id: row.id,
      name: row.name,
      status: row.status,
      schedule: {
        startDate: sched.start_date,
        endDate: sched.end_date,
        displayDate: sched.display_date,
        checkInTime: sched.check_in_time,
        openingTime: sched.opening_time,
        closingTime: sched.closing_time,
        scheduleStatus: (sched.schedule_status as string | null) ?? undefined,
      },
      venue: {
        name: venue.name,
        imageUrl: venue.image_url,
        logoUrl: (venue.logo_url as string | null) ?? undefined,
        courts: venue.courts,
        courtType: venue.court_type,
        city: venue.city,
        country: venue.country,
      },
      prizes: {
        totalPrize: prizesRow.total_prize,
        entries: prizeEntries.map((e: { rank: number; title: string; amount: string; bonus: string | null }) => ({
          rank: e.rank,
          title: e.title,
          amount: e.amount,
          ...(e.bonus ? { bonus: e.bonus } : {}),
        })),
      },
      registration: {
        deadline: regInfo.deadline,
        deadlineDateTime: regInfo.deadline_date_time,
        totalSlots: regInfo.total_slots,
        registrationLink: regInfo.registration_link,
        ctaTitle: regInfo.cta_title,
        ctaDescription: regInfo.cta_description,
        features: regInfo.features,
        availableCategories: regInfo.available_categories,
        doublesPartnerMode: regInfo.doubles_partner_mode,
        categorySlots: buildCategorySlots(
          regInfo.category_slots as Record<string, { capacity: number }>,
          usedCounts[row.id] ?? {},
        ),
        entryFeeMode: (regInfo.entry_fee_mode as 'per_category' | 'flat') ?? 'per_category',
        entryFee: (regInfo.entry_fee as string | null) ?? undefined,
        categoryFees: (regInfo.category_fees as Partial<Record<RegistrationCategory, string>> | null) ?? undefined,
        groupUrl: (regInfo.group_url as string | null) ?? undefined,
      },
    } satisfies Tournament;
  });
}

function buildCategorySlots(
  rawSlots: Record<string, { capacity: number }>,
  used: Record<string, number>,
): Partial<Record<RegistrationCategory, CategorySlotInfo>> {
  const result: Partial<Record<RegistrationCategory, CategorySlotInfo>> = {};
  for (const [cat, val] of Object.entries(rawSlots)) {
    result[cat as RegistrationCategory] = {
      capacity: val.capacity,
      used: used[cat] ?? 0,
    };
  }
  return result;
}
