'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Container, Group, Text, UnstyledButton } from '@mantine/core';
import { GalleryHorizontalEnd, Table2 } from 'lucide-react';
import type { RegistrationCategory, Tournament } from '@/types';
import TournamentCarousel from './TournamentCarousel';
import TournamentTable from './TournamentTable';
import PrizesSection from './PrizesSection';
import RegistrationSection from './RegistrationSection';
import styles from './TournamentInfoSection.module.css';

type ViewMode = 'carousel' | 'table';

const POLL_INTERVAL_MS = 30_000;

function mergeSlotCounts(
  tournaments: Tournament[],
  usedCounts: Record<string, Record<RegistrationCategory, number>>,
): Tournament[] {
  return tournaments.map((t) => {
    // Use an empty object when the tournament has zero confirmed registrations so
    // the zero-out loop below can reset all category counts to 0.
    const counts = usedCounts[t.id] ?? ({} as Record<RegistrationCategory, number>);
    const updatedSlots = { ...t.registration.categorySlots };
    for (const [cat, used] of Object.entries(counts) as [RegistrationCategory, number][]) {
      const existing = updatedSlots[cat];
      if (existing) {
        updatedSlots[cat] = { ...existing, used };
      }
    }
    // Zero out any category not present in the new counts
    for (const cat of Object.keys(updatedSlots) as RegistrationCategory[]) {
      if (!(cat in counts) && updatedSlots[cat]) {
        updatedSlots[cat] = { ...updatedSlots[cat]!, used: 0 };
      }
    }
    return {
      ...t,
      registration: { ...t.registration, categorySlots: updatedSlots },
    };
  });
}

export default function TournamentContent({ tournaments: initialTournaments, termsUrl }: { tournaments: Tournament[]; termsUrl: string }) {
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('carousel');
  const [showDetails, setShowDetails] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  const activeTournament = tournaments[activeIndex] ?? tournaments[0];

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch('/api/tournaments/slots', { cache: 'no-store' });
        if (!res.ok) return;
        const usedCounts: Record<string, Record<RegistrationCategory, number>> = await res.json();
        if (!cancelled) {
          setTournaments((prev) => mergeSlotCounts(prev, usedCounts));
        }
      } catch {
        // silently ignore network errors during polling
      }
    };

    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const handleSelectTournament = (index?: number) => {
    if (index !== undefined) setActiveIndex(index);
    setShowDetails(true);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleBack = () => {
    setShowDetails(false);
    setTimeout(() => {
      document.getElementById('tournament-info')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <>
      <Box component="section" id="tournament-info" className={styles.section}>
        <Container size="xl">
          <Group justify="space-between" align="flex-end" mb="xl" wrap="wrap" gap="md">
            <Box>
              <Box className={styles.accentBar} />
              <Text className={styles.sectionLabel}>THÔNG TIN GIẢI ĐẤU</Text>
              <Text component="h2" className={styles.sectionTitle}>
                Danh Sách Giải Đấu
              </Text>
            </Box>
            <Group gap={0} className={styles.viewToggle}>
              <UnstyledButton
                className={`${styles.viewToggleBtn} ${viewMode === 'carousel' ? styles.viewToggleBtnActive : ''}`}
                onClick={() => setViewMode('carousel')}
              >
                <GalleryHorizontalEnd size={15} />
                <span>Carousel</span>
              </UnstyledButton>
              <UnstyledButton
                className={`${styles.viewToggleBtn} ${viewMode === 'table' ? styles.viewToggleBtnActive : ''}`}
                onClick={() => setViewMode('table')}
              >
                <Table2 size={15} />
                <span>Bảng</span>
              </UnstyledButton>
            </Group>
          </Group>

          {viewMode === 'carousel' ? (
            <TournamentCarousel
              tournaments={tournaments}
              onSlideChange={setActiveIndex}
              onSelectTournament={handleSelectTournament}
            />
          ) : (
            <TournamentTable
              tournaments={tournaments}
              activeTournamentId={activeTournament.id}
              onSelect={setActiveIndex}
              onSelectTournament={handleSelectTournament}
            />
          )}
        </Container>
      </Box>

      {showDetails && (
        <div ref={detailsRef}>
          <PrizesSection key={activeTournament.id} prizes={activeTournament.prizes} />
          <RegistrationSection key={`reg-${activeTournament.id}`} tournamentId={activeTournament.id} tournament={{ name: activeTournament.name, venue: activeTournament.venue, schedule: { displayDate: activeTournament.schedule.displayDate } }} registration={activeTournament.registration} termsUrl={termsUrl} onBack={handleBack} />
        </div>
      )}
    </>
  );
}
