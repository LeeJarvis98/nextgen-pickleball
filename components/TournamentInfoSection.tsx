import { getTournaments } from '@/lib/tournaments';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import TournamentContent from './TournamentContent';

export default async function TournamentInfoSection() {
  const supabase = createServerSupabaseClient();
  const [tournaments, { data: settingsRows }] = await Promise.all([
    getTournaments(),
    supabase.from('site_settings').select('key, value').eq('key', 'terms_url').maybeSingle(),
  ]);
  const termsUrl = (settingsRows as { key: string; value: string } | null)?.value ?? '';
  return <TournamentContent tournaments={tournaments} termsUrl={termsUrl} />;
}