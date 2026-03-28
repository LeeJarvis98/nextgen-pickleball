'use client';

import { useRef, useState } from 'react';
import { Box, Container, Group, Text, UnstyledButton } from '@mantine/core';
import { GalleryHorizontalEnd, Table2 } from 'lucide-react';
import type { Tournament } from '@/types';
import TournamentCarousel from './TournamentCarousel';
import TournamentTable from './TournamentTable';
import PrizesSection from './PrizesSection';
import RegistrationSection from './RegistrationSection';
import styles from './TournamentInfoSection.module.css';

type ViewMode = 'carousel' | 'table';

export default function TournamentContent({ tournaments }: { tournaments: Tournament[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('carousel');
  const [showDetails, setShowDetails] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  const activeTournament = tournaments[activeIndex] ?? tournaments[0];

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
                Thời Gian &amp; Địa Điểm
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
          <PrizesSection prizes={activeTournament.prizes} />
          <RegistrationSection tournamentId={activeTournament.id} registration={activeTournament.registration} onBack={handleBack} />
        </div>
      )}
    </>
  );
}
