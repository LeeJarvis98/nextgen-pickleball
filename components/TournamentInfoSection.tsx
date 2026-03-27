import { Box, Container, Text } from '@mantine/core';
import { getTournaments } from '@/lib/tournaments';
import TournamentCarousel from './TournamentCarousel';
import styles from './TournamentInfoSection.module.css';

export default function TournamentInfoSection() {
  const tournaments = getTournaments();

  return (
    <Box component="section" id="tournament-info" className={styles.section}>
      <Container size="xl">
        <Box mb={64}>
          <Box className={styles.accentBar} />
          <Text className={styles.sectionLabel}>THÔNG TIN GIẢI ĐẤU</Text>
          <Text component="h2" className={styles.sectionTitle}>
            Thời Gian &amp; Địa Điểm
          </Text>
        </Box>

        <TournamentCarousel tournaments={tournaments} />
      </Container>
    </Box>
  );
}