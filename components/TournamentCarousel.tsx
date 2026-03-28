'use client';

import { Carousel } from '@mantine/carousel';
import { Box, Grid, GridCol, Paper, Stack, Group, Badge } from '@mantine/core';
import { CalendarDays, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Tournament, TournamentStatus } from '@/types';
import styles from './TournamentCarousel.module.css';

const STATUS_LABELS: Record<TournamentStatus, string> = {
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang diễn ra',
  COMPLETED: 'Đã kết thúc',
};

const STATUS_COLORS: Record<TournamentStatus, { border: string; color: string; bg: string }> = {
  UPCOMING: { border: 'rgba(184, 255, 0, 0.5)', color: '#b8ff00', bg: 'rgba(184, 255, 0, 0.1)' },
  ONGOING: { border: 'rgba(0, 212, 255, 0.5)', color: '#00d4ff', bg: 'rgba(0, 212, 255, 0.1)' },
  COMPLETED: { border: 'rgba(173, 170, 170, 0.5)', color: '#adaaaa', bg: 'rgba(173, 170, 170, 0.1)' },
};

function parseFeeVND(fee: string): number {
  return parseInt(fee.replace(/[^\d]/g, ''), 10) || 0;
}

function formatVND(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
}

function formatNumber(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function getCategoryFeeRange(categoryFees: Partial<Record<string, string>>): string {
  const values = Object.values(categoryFees).filter(Boolean).map((f) => parseFeeVND(f!));
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? formatVND(min) : `${formatVND(min)} – ${formatVND(max)}`;
}

function getCategoryFeeNumbers(categoryFees: Partial<Record<string, string>>): string {
  const values = Object.values(categoryFees).filter(Boolean).map((f) => parseFeeVND(f!));
  if (values.length === 0) return '—';
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? formatNumber(min) : `${formatNumber(min)} – ${formatNumber(max)}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  singles_male:   'Đơn Nam',
  singles_female: 'Đơn Nữ',
  doubles_male:   'Đôi Nam',
  doubles_female: 'Đôi Nữ',
  doubles_mixed:  'Đôi Hỗn Hợp',
};

function getSlotSummary(reg: Tournament['registration']): {
  totalCap: number; totalUsed: number; remaining: number; pct: number; isFull: boolean; isLow: boolean;
} | null {
  const entries = Object.values(reg.categorySlots);
  if (entries.length === 0) return null;
  const totalCap = entries.reduce((s, e) => s + (e?.capacity ?? 0), 0);
  const totalUsed = entries.reduce((s, e) => s + (e?.used ?? 0), 0);
  const remaining = totalCap - totalUsed;
  return {
    totalCap, totalUsed, remaining,
    pct: totalCap > 0 ? Math.min(100, (totalUsed / totalCap) * 100) : 0,
    isFull: remaining <= 0,
    isLow: remaining > 0 && remaining <= 10,
  };
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

        {/* ── Mobile / tablet: single compact combined card ── */}
        <Box hiddenFrom="md" className={styles.compactCard}>
          <Box className={styles.compactVenueBanner}>
            <img
              src={tournament.venue.imageUrl}
              alt={tournament.venue.name}
              className={styles.compactVenueImage}
            />
            <Box className={styles.compactVenueBannerGradient} />
            <Box className={styles.compactStatusOverlay}>
              <Badge
                className={styles.statusBadge}
                style={{
                  borderColor: STATUS_COLORS[tournament.status].border,
                  color: STATUS_COLORS[tournament.status].color,
                  backgroundColor: STATUS_COLORS[tournament.status].bg,
                }}
              >
                {STATUS_LABELS[tournament.status]}
              </Badge>
            </Box>
            {tournament.venue.logoUrl && (
              <Box className={styles.compactLogoOverlay}>
                <img
                  src={tournament.venue.logoUrl}
                  alt="Tournament logo"
                  className={styles.compactVenueLogo}
                />
              </Box>
            )}
          </Box>

          <Box className={styles.compactBody}>
            <Group justify="flex-start" align="flex-start" mb={10}>
              <Group gap="xs" align="center">
                <Box className={styles.compactVenueIconBox}>
                  <MapPin size={15} color="#486700" />
                </Box>
                <div>
                  <p className={styles.venueLabel}>Địa Điểm Tổ Chức</p>
                  <h4 className={`neon-glow ${styles.compactVenueName}`}>{tournament.venue.name}</h4>
                </div>
              </Group>
            </Group>

            <Group gap="xs" mb={14}>
              <span className={styles.venueLocation}>
                <MapPin size={12} color="#ADAAAA" /> {tournament.venue.city}, {tournament.venue.country}
              </span>
            </Group>

            <Stack gap={0} mb={12}>
              <Group justify="space-between" py="xs" className={styles.infoRow}>
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
              <InfoRow label="Kết thúc" value={tournament.schedule.closingTime} />
            </Stack>

            <Grid gutter="sm" mb={14} className={styles.compactStatsGrid}>
              <GridCol span={6}>
                <Box className={styles.compactStatBox}>
                  <p className={styles.venueStatLabel}>Phí Tham Gia</p>
                  <Box className={styles.compactFeeWrapper}>
                    <span className={styles.compactFeeNumber}>
                      {tournament.registration.entryFeeMode === 'flat'
                        ? (tournament.registration.entryFee
                            ? formatNumber(parseFeeVND(tournament.registration.entryFee))
                            : '—')
                        : getCategoryFeeNumbers(tournament.registration.categoryFees ?? {})}
                    </span>
                    <span className={styles.compactFeeCurrency}>VNĐ</span>
                  </Box>
                  {tournament.registration.entryFeeMode !== 'flat' && (
                    <span className={styles.compactFeeHint}>tuỳ nội dung</span>
                  )}
                </Box>
              </GridCol>
              <GridCol span={6}>
                <Box className={styles.compactStatBox}>
                  <p className={styles.venueStatLabel}>Quy mô</p>
                  <span className={styles.venueStatValue}>{tournament.venue.courts} Sân</span>
                  <span className={styles.compactCourtType}>{tournament.venue.courtType}</span>
                </Box>
              </GridCol>
            </Grid>

            {(() => {
              const slot = getSlotSummary(tournament.registration);
              if (!slot) return null;
              return (
                <Box className={styles.slotStatusBox} mb={14}>
                  <Group justify="space-between" align="center" mb={6}>
                    <span className={styles.slotStatusLabel}>Slots còn lại</span>
                    <span className={slot.isFull ? styles.slotFull : slot.isLow ? styles.slotLow : styles.slotOpen}>
                      {slot.isFull ? 'Hết chỗ' : `${slot.remaining} / ${slot.totalCap}`}
                    </span>
                  </Group>
                  <Box className={styles.slotBar}>
                    <Box
                      className={slot.isFull ? styles.slotBarFillFull : styles.slotBarFill}
                      style={{ width: `${slot.pct}%` }}
                    />
                  </Box>
                </Box>
              );
            })()}

            <button
              className={styles.compactSelectBtn}
              onClick={onSelectTournament}
              disabled={getSlotSummary(tournament.registration)?.isFull ?? false}
            >
              {getSlotSummary(tournament.registration)?.isFull ? 'Hết chỗ' : 'Chọn giải đấu'}
            </button>
          </Box>
        </Box>

        {/* ── Desktop: original two-column layout ── */}
        <Box visibleFrom="md">
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
                {(() => {
                  const slot = getSlotSummary(tournament.registration);
                  if (!slot) return null;
                  const catEntries = Object.entries(tournament.registration.categorySlots);
                  return (
                    <Box className={styles.slotStatusBox}>
                      <Group justify="space-between" align="center" mb={6}>
                        <span className={styles.slotStatusLabel}>Slots còn lại</span>
                        <span className={slot.isFull ? styles.slotFull : slot.isLow ? styles.slotLow : styles.slotOpen}>
                          {slot.isFull ? 'Hết chỗ' : `${slot.remaining} / ${slot.totalCap}`}
                        </span>
                      </Group>
                      <Box className={styles.slotBar}>
                        <Box
                          className={slot.isFull ? styles.slotBarFillFull : styles.slotBarFill}
                          style={{ width: `${slot.pct}%` }}
                        />
                      </Box>
                      {catEntries.length > 1 && (
                        <Stack gap={4} mt={10}>
                          {catEntries.map(([cat, s]) => {
                            if (!s) return null;
                            const avail = s.capacity - s.used;
                            const catFull = avail <= 0;
                            const catLow = avail > 0 && avail <= 5;
                            return (
                              <Group key={cat} justify="space-between">
                                <span className={styles.slotCatLabel}>{CATEGORY_LABELS[cat] ?? cat}</span>
                                <span className={catFull ? styles.slotFull : catLow ? styles.slotLow : styles.slotOpen}>
                                  {catFull ? 'Hết chỗ' : `${avail} / ${s.capacity}`}
                                </span>
                              </Group>
                            );
                          })}
                        </Stack>
                      )}
                    </Box>
                  );
                })()}
                <Box className={styles.entryFeeBox}>
                  <div className={styles.entryFeeHeader}>
                    <span className={styles.entryFeeLabel}>Phí Tham Gia</span>
                    {tournament.registration.entryFeeMode !== 'flat' && (
                      <span className={styles.entryFeeRangeHint}>tuỳ nội dung thi đấu</span>
                    )}
                  </div>
                  {tournament.registration.entryFeeMode === 'flat' ? (
                    <span className={styles.entryFeeValue}>
                      {tournament.registration.entryFee
                        ? formatVND(parseFeeVND(tournament.registration.entryFee))
                        : '—'}
                    </span>
                  ) : (
                    <span className={styles.entryFeeValue}>
                      {getCategoryFeeRange(tournament.registration.categoryFees ?? {})}
                    </span>
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
              <Box className={styles.venueContent}>
                <Group gap="md" mb={24}> 
                  <Box className={styles.venueIconBox}>
                    <MapPin size={28} color="#B8FF00" />
                  </Box>
                  <span className={styles.venueLabel}>Địa Điểm Tổ Chức</span>
                  <button
                    className={styles.selectBtn}
                    onClick={onSelectTournament}
                    disabled={getSlotSummary(tournament.registration)?.isFull ?? false}
                  >
                    {getSlotSummary(tournament.registration)?.isFull ? 'Hết chỗ' : 'Chọn giải đấu'}
                  </button>
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
      </Box>
    </Carousel.Slide>
  );
}

interface TournamentCarouselProps {
  tournaments: Tournament[];
  onSlideChange?: (index: number) => void;
  onSelectTournament?: (index: number) => void;
}

export default function TournamentCarousel({ tournaments, onSlideChange, onSelectTournament }: TournamentCarouselProps) {
  const isSingle = tournaments.length === 1;

  return (
    <Carousel
      withIndicators={!isSingle}
      withControls={!isSingle}
      emblaOptions={{ loop: !isSingle }}
      previousControlIcon={<ChevronLeft size={20} color="#B8FF00" />}
      nextControlIcon={<ChevronRight size={20} color="#B8FF00" />}
      onSlideChange={onSlideChange}
      classNames={{
        control: 'carousel-control',
        indicator: 'carousel-indicator',
      }}
    >
      {tournaments.map((tournament, idx) => (
        <TournamentSlide key={tournament.id} tournament={tournament} onSelectTournament={() => onSelectTournament?.(idx)} />
      ))}
    </Carousel>
  );
}