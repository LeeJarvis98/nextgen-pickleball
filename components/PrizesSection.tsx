import { Box, Container, Grid, GridCol, Stack, Center } from '@mantine/core';
import { Trophy, Medal, Award } from 'lucide-react';
import type { TournamentPrizes, TournamentPrizeEntry } from '@/types';
import styles from './PrizesSection.module.css';

const RANK_STYLES = {
  1: {
    highlight: true,
    borderColor: '#B8FF00',
    iconBorderColor: 'rgba(184,255,0,0.3)',
    icon: <Trophy size={40} color="#B8FF00" />,
  },
  2: {
    highlight: false,
    borderColor: 'rgba(173,170,170,0.5)',
    iconBorderColor: 'rgba(173,170,170,0.3)',
    icon: <Medal size={32} color="#ADAAAA" />,
  },
  3: {
    highlight: false,
    borderColor: 'rgba(205,127,50,0.5)',
    iconBorderColor: 'rgba(205,127,50,0.2)',
    icon: <Award size={32} color="#CD7F32" />,
  },
} as const;

function PrizePodium({ entry }: { entry: TournamentPrizeEntry }) {
  const config = RANK_STYLES[entry.rank as 1 | 2 | 3];
  if (!config) return null;
  const { highlight, borderColor, iconBorderColor, icon } = config;

  return (
    <Box
      className={`ghost-border ${styles.podium} ${highlight ? styles.podiumHighlight : styles.podiumDefault}`}
      style={{ borderTop: `4px solid ${borderColor}` }}
    >
      <Center
        className={`${styles.podiumIconCenter} ${highlight ? styles.podiumIconCenterHighlight : styles.podiumIconCenterDefault}`}
        style={{ border: `1px solid ${iconBorderColor}` }}
      >
        {icon}
      </Center>
      <h4
        className={`${styles.podiumTitle} ${highlight ? styles.podiumTitleHighlight : styles.podiumTitleDefault}`}
      >
        {entry.title}
      </h4>
      <span
        className={`${highlight ? 'neon-glow' : ''} ${styles.podiumAmount} ${highlight ? styles.podiumAmountHighlight : styles.podiumAmountDefault}`}
      >
        {entry.amount}
      </span>
      {entry.bonus && (
        <p className={styles.podiumBonus}>+ {entry.bonus}</p>
      )}
    </Box>
  );
}

export default function PrizesSection({ prizes }: { prizes: TournamentPrizes }) {
  const byRank = (rank: number) => prizes.entries.find((e) => e.rank === rank);
  const first = byRank(1);
  const second = byRank(2);
  const third = byRank(3);

  return (
    <Box component="section" id="prizes" className={styles.section}>
      <Box className={styles.glow} />

      <Container size="xl" style={{ position: 'relative', zIndex: 10 }}>
        <Stack align="center" mb={64}>
          <Box className={styles.accentBar} />
          <span className={styles.sectionLabel}>GIẢI THƯỞNG</span>
          <h2 className={styles.sectionTitle}>Tổng Giải Thưởng</h2>
        </Stack>

        <Center mb={80}>
          <span className={`neon-glow ${styles.totalPrize}`}>{prizes.totalPrize}</span>
        </Center>

        <Grid gutter="xl" align="flex-end">
          {second && (
            <GridCol span={{ base: 12, md: 4 }} order={{ base: 2, md: 1 }}>
              <PrizePodium entry={second} />
            </GridCol>
          )}
          {first && (
            <GridCol span={{ base: 12, md: 4 }} order={{ base: 1, md: 2 }}>
              <PrizePodium entry={first} />
            </GridCol>
          )}
          {third && (
            <GridCol span={{ base: 12, md: 4 }} order={{ base: 3, md: 3 }}>
              <PrizePodium entry={third} />
            </GridCol>
          )}
        </Grid>
      </Container>
    </Box>
  );
}