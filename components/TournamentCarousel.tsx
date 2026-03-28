'use client';

import { Carousel } from '@mantine/carousel';
import { Box, Grid, GridCol, Paper, Stack, Group, Badge } from '@mantine/core';
import { CalendarDays, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Tournament, TournamentStatus } from '@/types';
import styles from './TournamentCarousel.module.css';

const STATUS_LABELS: Record<TournamentStatus, string> = {
  UPCOMING:  'Sắp diễn ra',
  ONGOING:   'Đang diễn ra',
  COMPLETED: 'Đã kết thúc',
};

const STATUS_COLORS: Record<TournamentStatus, { border: string; color: string; bg: string }> = {
  UPCOMING:  { border: 'rgba(184, 255, 0, 0.5)',   color: '#b8ff00', bg: 'rgba(184, 255, 0, 0.1)' },
  ONGOING:   { border: 'rgba(0, 212, 255, 0.5)',   color: '#00d4ff', bg: 'rgba(0, 212, 255, 0.1)' },
  COMPLETED: { border: 'rgba(173, 170, 170, 0.5)', color: '#adaaaa', bg: 'rgba(173, 170, 170, 0.1)' },
};

function parseFeeVND(fee: string): number {
  return parseInt(fee.replace(/[^\d]/g, ''), 10) || 0;
}

function formatVND(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
}

function getCategoryFeeRange(categoryFees: Partial<Record<string, string>>): string {
  const values = Object.values(categoryFees).filter(Boolean).map((f) => parseFeeVND(f!));
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? formatVND(min) : `${formatVND(min)} – ${formatVND(max)}`;
}

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

interface TournamentSlideProps {
  tournament: Tournament;
  onSelectTournament?: () => void;
}

function TournamentSlide({ tournament, onSelectTournament }: TournamentSlideProps) {
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
                <Badge
                  variant="outline"
                  className={styles.statusBadge}
                  style={{
                    borderColor: STATUS_COLORS[tournament.status].border,
                    color: STATUS_COLORS[tournament.status].color,
                    backgroundColor: STATUS_COLORS[tournament.status].bg,
                  }}
                >
                  {STATUS_LABELS[tournament.status]}
                </Badge>
              </Group>
              <Stack gap={0}>
                <Group justify="space-between" py="sm" className={styles.infoRow}>
                  <Group gap="xs" align="center">
                    <span className={styles.infoRowLabel}>Ngày thi đấu</span>
                    {tournament.schedule.scheduleStatus && (
                      <span className={styles.scheduleStatusBadge}>{tournament.schedule.scheduleStatus}</span>
                    )}
                  </Group>
                  <span className={styles.infoRowValue}>{tournament.schedule.displayDate}</span>
                </Group>
                <InfoRow label="Check-in" value={tournament.schedule.checkInTime} />
                <InfoRow label="Khai mạc" value={tournament.schedule.openingTime} />
                <Group justify="space-between" py="sm" className={styles.infoRow}>
                  <span className={styles.infoRowLabel}>Kết thúc</span>
                  <span className={styles.infoRowValue}>{tournament.schedule.closingTime}</span>
                </Group>
                <Box className={styles.entryFeeBox}>
                  <span className={styles.entryFeeLabel}>Phí Tham Gia</span>
                  {tournament.registration.entryFeeMode === 'flat' ? (
                    <span className={styles.entryFeeValue}>
                      {tournament.registration.entryFee
                        ? formatVND(parseFeeVND(tournament.registration.entryFee))
                        : '—'}
                    </span>
                  ) : (
                    <>
                      <span className={styles.entryFeeValue}>
                        {getCategoryFeeRange(tournament.registration.categoryFees ?? {})}
                      </span>
                      <span className={styles.entryFeeRangeHint}>tuỳ nội dung thi đấu</span>
                    </>
                  )}
                </Box>
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
              <button className={styles.selectBtn} onClick={onSelectTournament}>
                Chọn giải đấu
              </button>
              <Box className={styles.venueContent}>
                <Group gap="md" mb={24}>
                  <Box className={styles.venueIconBox}>
                    <MapPin size={22} color="#486700" />
                  </Box>
                  <span className={styles.venueLabel}>Tournament Venue</span>
                </Group>
                {tournament.venue.logoUrl && (
                  <Box className={styles.venueLogoWrapper}>
                    <img
                      src={tournament.venue.logoUrl}
                      alt="Tournament logo"
                      className={styles.venueLogo}
                    />
                  </Box>
                )}
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
  onSelectTournament?: () => void;
}

export default function TournamentCarousel({ tournaments, onSlideChange, onSelectTournament }: TournamentCarouselProps) {
  if (tournaments.length === 1) {
    return <TournamentSlide tournament={tournaments[0]} onSelectTournament={onSelectTournament} />;
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
        <TournamentSlide key={tournament.id} tournament={tournament} onSelectTournament={onSelectTournament} />
      ))}
    </Carousel>
  );
}