'use client';

import { Carousel } from '@mantine/carousel';
import { Box, Grid, GridCol, Paper, Stack, Group, Badge } from '@mantine/core';
import { CalendarDays, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Tournament } from '@/types';
import styles from './TournamentCarousel.module.css';

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Group justify="space-between" py="sm" className={styles.infoRow}>
      <span className={styles.infoRowLabel}>{label}</span>
      <span className={styles.infoRowValue}>{value}</span>
    </Group>
  );
}

function TournamentSlide({ tournament }: { tournament: Tournament }) {
  return (
    <Carousel.Slide>
      <Box pb={8}>
        <h3 className={styles.slideName}>{tournament.name}</h3>

        <Grid gutter="xl">
          <GridCol span={{ base: 12, md: 6 }}>
            <Paper className={`ghost-border tournament-time-card ${styles.timeCard}`}>
              <Group justify="space-between" align="flex-start" mb={40}>
                <Group gap="md" align="center">
                  <Box className={styles.calendarIconBox}>
                    <CalendarDays size={28} color="#B8FF00" />
                  </Box>
                  <h4 className={styles.timeCardTitle}>Thời Gian Thi Đấu</h4>
                </Group>
                <Badge variant="outline" className={styles.statusBadge}>
                  {tournament.status}
                </Badge>
              </Group>
              <Stack gap={0}>
                <InfoRow label="Ngày thi đấu" value={tournament.schedule.displayDate} />
                <InfoRow label="Check-in" value={tournament.schedule.checkInTime} />
                <InfoRow label="Khai mạc" value={tournament.schedule.openingTime} />
                <Group justify="space-between" pt="sm">
                  <span className={styles.infoRowLabel}>Kết thúc</span>
                  <span className={styles.infoRowValue}>{tournament.schedule.closingTime}</span>
                </Group>
              </Stack>
            </Paper>
          </GridCol>

          <GridCol span={{ base: 12, md: 6 }}>
            <Box className={`ghost-border ${styles.venueCard}`}>
              <img
                src={tournament.venue.imageUrl}
                alt={tournament.venue.name}
                className={styles.venueImage}
              />
              <Box className={styles.venueGradient} />
              <Box className={styles.venueContent}>
                <Group gap="md" mb={24}>
                  <Box className={styles.venueIconBox}>
                    <MapPin size={22} color="#486700" />
                  </Box>
                  <span className={styles.venueLabel}>Tournament Venue</span>
                </Group>
                <h4 className={`neon-glow ${styles.venueName}`}>{tournament.venue.name}</h4>
                <Grid gutter="sm">
                  <GridCol span={6}>
                    <Box className={styles.venueStatBox}>
                      <p className={styles.venueStatLabel}>Quy mô</p>
                      <span className={styles.venueStatValue}>
                        {tournament.venue.courts} Sân thi đấu
                      </span>
                    </Box>
                  </GridCol>
                  <GridCol span={6}>
                    <Box className={styles.venueStatBox}>
                      <p className={styles.venueStatLabel}>Loại sân</p>
                      <span className={styles.venueStatValue}>{tournament.venue.courtType}</span>
                    </Box>
                  </GridCol>
                </Grid>
                <Group gap="xs" mt={16}>
                  <MapPin size={14} color="#ADAAAA" />
                  <span className={styles.venueLocation}>
                    {tournament.venue.city}, {tournament.venue.country}
                  </span>
                </Group>
              </Box>
            </Box>
          </GridCol>
        </Grid>
      </Box>
    </Carousel.Slide>
  );
}

interface TournamentCarouselProps {
  tournaments: Tournament[];
  onSlideChange?: (index: number) => void;
}

export default function TournamentCarousel({ tournaments, onSlideChange }: TournamentCarouselProps) {
  if (tournaments.length === 1) {
    return <TournamentSlide tournament={tournaments[0]} />;
  }

  return (
    <Carousel
      withIndicators
      emblaOptions={{ loop: true }}
      previousControlIcon={<ChevronLeft size={20} color="#B8FF00" />}
      nextControlIcon={<ChevronRight size={20} color="#B8FF00" />}
      onSlideChange={onSlideChange}
      classNames={{
        control: 'carousel-control',
        indicator: 'carousel-indicator',
      }}
    >
      {tournaments.map((tournament) => (
        <TournamentSlide key={tournament.id} tournament={tournament} />
      ))}
    </Carousel>
  );
}