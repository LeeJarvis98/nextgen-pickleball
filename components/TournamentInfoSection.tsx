import { getTournaments } from '@/lib/tournaments';
import TournamentContent from './TournamentContent';

export default async function TournamentInfoSection() {
  const tournaments = await getTournaments();
  return <TournamentContent tournaments={tournaments} />;
}