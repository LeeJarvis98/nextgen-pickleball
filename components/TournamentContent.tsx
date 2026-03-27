'use client';

import { useState } from 'react';
import { Box, Container, Text } from '@mantine/core';
import type { Tournament } from '@/types';
import TournamentCarousel from './TournamentCarousel';
import PrizesSection from './PrizesSection';
import RegistrationSection from './RegistrationSection';
import styles from './TournamentInfoSection.module.css';

export default function TournamentContent({ tournaments }: { tournaments: Tournament[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTournament = tournaments[activeIndex] ?? tournaments[0];

  return (
    <>
      <Box component="section" id="tournament-info" className={styles.section}>
        <Container size="xl">
          <Box>
            <Box className={styles.accentBar} />
            <Text className={styles.sectionLabel}>THÔNG TIN GIẢI ĐẤU</Text>
            <Text component="h2" className={styles.sectionTitle}>
              Thời Gian &amp; Địa Điểm
            </Text>
          </Box>
          <TournamentCarousel
            tournaments={tournaments}
            onSlideChange={setActiveIndex}
          />
        </Container>
      </Box>

      <PrizesSection prizes={activeTournament.prizes} />
      <RegistrationSection tournamentId={activeTournament.id} registration={activeTournament.registration} />
    </>
  );
}
