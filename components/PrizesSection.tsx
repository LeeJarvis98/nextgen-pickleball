'use client';

import { Carousel } from '@mantine/carousel';
import { Box, Container, Stack, Center } from '@mantine/core';
import { Trophy, Medal, Award, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TournamentPrizes, TournamentPrizeEntry } from '@/types';
import styles from './PrizesSection.module.css';

function getRankConfig(rank: number) {
  if (rank === 1) return {
    highlight: true,
    borderColor: '#B8FF00',
    iconBorderColor: 'rgba(184,255,0,0.3)',
    icon: <Trophy size={40} color="#B8FF00" />,
  };
  if (rank === 2) return {
    highlight: false,
    borderColor: 'rgba(173,170,170,0.5)',
    iconBorderColor: 'rgba(173,170,170,0.3)',
    icon: <Medal size={32} color="#ADAAAA" />,
  };
  if (rank === 3) return {
    highlight: false,
    borderColor: 'rgba(205,127,50,0.5)',
    iconBorderColor: 'rgba(205,127,50,0.2)',
    icon: <Award size={32} color="#CD7F32" />,
  };
  return {
    highlight: false,
    borderColor: 'rgba(100,100,100,0.4)',
    iconBorderColor: 'rgba(100,100,100,0.2)',
    icon: <Star size={28} color="#888888" />,
  };
}

function PrizeSlide({ entry }: { entry: TournamentPrizeEntry }) {
  const { highlight, borderColor, iconBorderColor, icon } = getRankConfig(entry.rank);

  return (
    <Carousel.Slide>
      <div className={styles.slideWrapper}>
        <Box
          className={`ghost-border ${styles.podium} ${highlight ? styles.podiumHighlight : styles.podiumDefault}`}
          style={{ borderTop: `4px solid ${borderColor}` }}
        >
          {/* Floating icon — lives outside podiumBody so it can overflow the top edge */}
          <Center
            className={`${styles.podiumIconCenter} ${highlight ? styles.podiumIconCenterHighlight : styles.podiumIconCenterDefault}`}
            style={{ border: `1px solid ${iconBorderColor}` }}
          >
            {icon}
          </Center>

          {/* Inner body clips the shine sweep & watermark */}
          <div className={`${styles.podiumBody} ${highlight ? styles.podiumBodyHighlight : styles.podiumBodyDefault}`}>
            {/* Giant rank watermark */}
            <span className={styles.rankWatermark}>{entry.rank}</span>

            {/* Rank badge pill */}
            <span className={`${styles.rankBadge} ${highlight ? styles.rankBadgeHighlight : styles.rankBadgeDefault}`}>
              #{entry.rank}
            </span>

            <h4
              className={`${styles.podiumTitle} ${highlight ? styles.podiumTitleHighlight : styles.podiumTitleDefault}`}
            >
              {entry.title}
            </h4>

            <div className={`${styles.divider} ${highlight ? styles.dividerHighlight : styles.dividerDefault}`} />

            <span
              className={`${highlight ? 'neon-glow' : ''} ${styles.podiumAmount} ${highlight ? styles.podiumAmountHighlight : styles.podiumAmountDefault}`}
            >
              {entry.amount}
            </span>
            {entry.bonus && (
              <p className={styles.podiumBonus}>+ {entry.bonus}</p>
            )}
          </div>
        </Box>
      </div>
    </Carousel.Slide>
  );
}

export default function PrizesSection({ prizes }: { prizes: TournamentPrizes }) {
  // Classic podium order for desktop: 2nd (left), 1st (centre), 3rd (right), then 4th+
  // Mobile order: 1st first so it is the default visible slide
  const byRank = (rank: number) => prizes.entries.find((e) => e.rank === rank);
  const first  = byRank(1);
  const second = byRank(2);
  const third  = byRank(3);
  const rest = prizes.entries
    .filter((e) => e.rank > 3)
    .sort((a, b) => a.rank - b.rank);

  const desktopOrdered = [second, first, third, ...rest].filter(Boolean) as typeof prizes.entries;
  const mobileOrdered  = [first, second, third, ...rest].filter(Boolean) as typeof prizes.entries;
  const showControls = desktopOrdered.length > 3;

  const carouselProps = (ordered: typeof prizes.entries) => ({
    slideGap: 'xl' as const,
    withIndicators: showControls,
    withControls: showControls,
    emblaOptions: { loop: showControls, slidesToScroll: 1, align: 'start' as const },
    previousControlIcon: <ChevronLeft size={20} color="#B8FF00" />,
    nextControlIcon: <ChevronRight size={20} color="#B8FF00" />,
    classNames: {
      control: 'carousel-control',
      indicator: 'carousel-indicator',
      slide: styles.carouselSlide,
    },
    children: ordered.map((entry) => <PrizeSlide key={entry.rank} entry={entry} />),
  });

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

        {/* Mobile: 1st place first */}
        <Box hiddenFrom="sm">
          <Carousel slideSize="100%" {...carouselProps(mobileOrdered)} />
        </Box>

        {/* Desktop: classic podium order (2nd, 1st, 3rd) */}
        <Box visibleFrom="sm">
          <Carousel slideSize={{ sm: '50%', md: '33.333%' }} {...carouselProps(desktopOrdered)} />
        </Box>
      </Container>
    </Box>
  );
}