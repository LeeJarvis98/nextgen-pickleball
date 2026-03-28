'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DataTable } from 'mantine-datatable';
import { Badge, Box, Grid, GridCol, Group, Select, Stack, TextInput } from '@mantine/core';
import { CalendarDays, MapPin, Search, X } from 'lucide-react';
import type { Tournament, TournamentStatus } from '@/types';
import styles from './TournamentTable.module.css';

function parseFeeVND(fee: string): number {
  return parseInt(fee.replace(/[^\d]/g, ''), 10) || 0;
}

function formatVND(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
}

function getEntryFeeDisplay(t: Tournament): string {
  if (t.registration.entryFeeMode === 'flat') {
    return t.registration.entryFee
      ? formatVND(parseFeeVND(t.registration.entryFee))
      : '—';
  }
  const fees = Object.values(t.registration.categoryFees ?? {})
    .filter(Boolean)
    .map((f) => parseFeeVND(f!));
  if (fees.length === 0) return '—';
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  return min === max ? formatVND(min) : `${formatVND(min)} – ${formatVND(max)}`;
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

const STATUS_COLORS: Record<TournamentStatus, { border: string; color: string }> = {
  UPCOMING:  { border: 'rgba(184, 255, 0, 0.5)',   color: '#b8ff00' },
  ONGOING:   { border: 'rgba(0, 212, 255, 0.5)',   color: '#00d4ff' },
  COMPLETED: { border: 'rgba(173, 170, 170, 0.5)', color: '#adaaaa' },
};

const STATUS_LABELS: Record<TournamentStatus, string> = {
  UPCOMING:  'Sắp diễn ra',
  ONGOING:   'Đang diễn ra',
  COMPLETED: 'Đã kết thúc',
};

interface SortStatus {
  columnAccessor: string;
  direction: 'asc' | 'desc';
}

interface TournamentDetailCardProps {
  tournament: Tournament;
  onClose: () => void;
  onSelectTournament: () => void;
}

function TournamentDetailCard({ tournament: t, onClose, onSelectTournament }: TournamentDetailCardProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <Box className={styles.detailCard} onClick={(e) => e.stopPropagation()}>
      {/* Venue image section — mirrors the carousel's venue card */}
      <Box className={styles.detailVenueSection}>
        <img src={t.venue.imageUrl} alt={t.venue.name} className={styles.detailVenueImage} />
        <Box className={styles.detailVenueGradient} />
        <button className={styles.detailCloseBtn} onClick={onClose} aria-label="Đóng">
          <X size={16} />
        </button>
        <Box className={styles.detailVenueContent}>
          {t.venue.logoUrl && (
            <img src={t.venue.logoUrl} alt="Tournament logo" className={styles.detailVenueLogo} />
          )}
          <h4 className={`neon-glow ${styles.detailVenueName}`}>{t.venue.name}</h4>
          <Grid gutter="sm" mb={12}>
            <GridCol span={6}>
              <Box className={styles.detailVenueStatBox}>
                <p className={styles.detailVenueStatLabel}>Quy mô</p>
                <span className={styles.detailVenueStatValue}>{t.venue.courts} Sân thi đấu</span>
              </Box>
            </GridCol>
            <GridCol span={6}>
              <Box className={styles.detailVenueStatBox}>
                <p className={styles.detailVenueStatLabel}>Loại sân</p>
                <span className={styles.detailVenueStatValue}>{t.venue.courtType}</span>
              </Box>
            </GridCol>
          </Grid>
          <Group gap="xs">
            <MapPin size={13} color="#ADAAAA" />
            <span className={styles.detailVenueLocation}>{t.venue.city}, {t.venue.country}</span>
          </Group>
        </Box>
      </Box>

      {/* Full tournament info */}
      <Box className={styles.detailBody}>
        <h3 className={styles.detailTournamentName}>{t.name}</h3>
        <Grid gutter="lg">
          {/* Schedule column */}
          <GridCol span={{ base: 12, md: 6 }}>
            <Box className={styles.detailInfoCard}>
              <Group gap="md" align="center" mb="md">
                <Box className={styles.detailCalendarIconBox}>
                  <CalendarDays size={20} color="#B8FF00" />
                </Box>
                <h4 className={styles.detailInfoCardTitle}>Thời Gian Thi Đấu</h4>
                <Badge
                  variant="outline"
                  size="sm"
                  ml="auto"
                  style={{ borderColor: STATUS_COLORS[t.status].border, color: STATUS_COLORS[t.status].color }}
                >
                  {STATUS_LABELS[t.status]}
                </Badge>
              </Group>
              <Stack gap={0}>
                <Group justify="space-between" py="xs" className={styles.detailInfoRow}>
                  <Group gap="xs">
                    <span className={styles.detailInfoLabel}>Ngày thi đấu</span>
                    {t.schedule.scheduleStatus && (
                      <span className={styles.detailSchedBadge}>{t.schedule.scheduleStatus}</span>
                    )}
                  </Group>
                  <span className={styles.detailInfoValue}>{t.schedule.displayDate}</span>
                </Group>
                <Group justify="space-between" py="xs" className={styles.detailInfoRow}>
                  <span className={styles.detailInfoLabel}>Check-in</span>
                  <span className={styles.detailInfoValue}>{t.schedule.checkInTime}</span>
                </Group>
                <Group justify="space-between" py="xs" className={styles.detailInfoRow}>
                  <span className={styles.detailInfoLabel}>Khai mạc</span>
                  <span className={styles.detailInfoValue}>{t.schedule.openingTime}</span>
                </Group>
                <Group justify="space-between" py="xs" className={styles.detailInfoRow}>
                  <span className={styles.detailInfoLabel}>Kết thúc</span>
                  <span className={styles.detailInfoValue}>{t.schedule.closingTime}</span>
                </Group>
              </Stack>
              <Box className={styles.detailFeeBox}>
                <span className={styles.detailFeeLabel}>Phí Tham Gia</span>
                {t.registration.entryFeeMode === 'flat' ? (
                  <span className={styles.detailFeeValue}>
                    {t.registration.entryFee ? formatVND(parseFeeVND(t.registration.entryFee)) : '—'}
                  </span>
                ) : (
                  <>
                    <span className={styles.detailFeeValue}>{getEntryFeeDisplay(t)}</span>
                    <span className={styles.detailFeeHint}>tuỳ nội dung thi đấu</span>
                  </>
                )}
              </Box>
            </Box>
          </GridCol>

          {/* Registration column */}
          <GridCol span={{ base: 12, md: 6 }}>
            <Box className={`${styles.detailInfoCard} ${styles.detailRegCard}`}>
              <Stack gap={0}>
                <Group justify="space-between" py="xs" className={styles.detailInfoRow}>
                  <span className={styles.detailInfoLabel}>Hạn đăng ký</span>
                  <span className={styles.detailInfoValue}>{t.registration.deadline}</span>
                </Group>
                {(() => {
                  const slot = getSlotSummary(t.registration);
                  if (!slot) return (
                    <Group justify="space-between" py="xs" className={styles.detailInfoRow}>
                      <span className={styles.detailInfoLabel}>Tổng số slots</span>
                      <span className={styles.detailInfoValue}>{t.registration.totalSlots}</span>
                    </Group>
                  );
                  const catEntries = Object.entries(t.registration.categorySlots);
                  return (
                    <>
                      <Group justify="space-between" py="xs" className={styles.detailInfoRow}>
                        <span className={styles.detailInfoLabel}>Slots còn lại</span>
                        <span className={slot.isFull ? styles.detailSlotFull : slot.isLow ? styles.detailSlotLow : styles.detailSlotOpen}>
                          {slot.isFull ? 'Hết chỗ' : `${slot.remaining} / ${slot.totalCap}`}
                        </span>
                      </Group>
                      <Box py="xs">
                        <Box className={styles.detailSlotBar}>
                          <Box
                            className={slot.isFull ? styles.detailSlotBarFillFull : styles.detailSlotBarFill}
                            style={{ width: `${slot.pct}%` }}
                          />
                        </Box>
                        {catEntries.length > 1 && (
                          <Stack gap={4} mt={8}>
                            {catEntries.map(([cat, s]) => {
                              if (!s) return null;
                              const avail = s.capacity - s.used;
                              const catFull = avail <= 0;
                              const catLow = avail > 0 && avail <= 5;
                              return (
                                <Group key={cat} justify="space-between">
                                  <span className={styles.detailSlotCatLabel}>{CATEGORY_LABELS[cat] ?? cat}</span>
                                  <span className={`${styles.detailSlotCatValue} ${catFull ? styles.detailSlotFull : catLow ? styles.detailSlotLow : styles.detailSlotOpen}`}>
                                    {catFull ? 'Hết chỗ' : `${avail} / ${s.capacity}`}
                                  </span>
                                </Group>
                              );
                            })}
                          </Stack>
                        )}
                      </Box>
                    </>
                  );
                })()}
                {t.registration.entryFeeMode === 'per_category' &&
                  Object.keys(t.registration.categoryFees ?? {}).length > 0 && (
                    <Box pt="sm">
                      <span className={styles.detailInfoLabel}>Phí theo nội dung</span>
                      <Stack gap={4} mt={8}>
                        {Object.entries(t.registration.categoryFees ?? {}).map(([cat, fee]) => (
                          <Group key={cat} justify="space-between">
                            <span className={styles.detailCatLabel}>{cat}</span>
                            <span className={styles.detailCatFee}>
                              {fee ? formatVND(parseFeeVND(fee)) : '—'}
                            </span>
                          </Group>
                        ))}
                      </Stack>
                    </Box>
                  )}
              </Stack>
              <button className={styles.detailSelectBtn} onClick={onSelectTournament}>
                Chọn Giải Đấu
              </button>
            </Box>
          </GridCol>
        </Grid>
      </Box>
      </Box>
    </div>,
    document.body,
  );
}

interface TournamentTableProps {
  tournaments: Tournament[];
  activeTournamentId?: string;
  onSelect?: (index: number) => void;
  onSelectTournament?: (index: number) => void;
}

export default function TournamentTable({
  tournaments,
  activeTournamentId,
  onSelect,
  onSelectTournament,
}: TournamentTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortStatus, setSortStatus] = useState<SortStatus>({
    columnAccessor: 'name',
    direction: 'asc',
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const expandedTournament = useMemo(
    () => tournaments.find((t) => t.id === expandedId) ?? null,
    [expandedId, tournaments],
  );

  const records = useMemo(() => {
    let data = [...tournaments];

    if (statusFilter) {
      data = data.filter((t) => t.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.venue.name.toLowerCase().includes(q) ||
          t.venue.city.toLowerCase().includes(q),
      );
    }

    data.sort((a, b) => {
      const dir = sortStatus.direction === 'asc' ? 1 : -1;
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortStatus.columnAccessor) {
        case 'name':   aVal = a.name;               bVal = b.name;               break;
        case 'status': aVal = a.status;             bVal = b.status;             break;
        case 'date':   aVal = a.schedule.startDate; bVal = b.schedule.startDate; break;
      }
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });

    return data;
  }, [tournaments, search, statusFilter, sortStatus]);

  return (
    <Stack gap="md">
      <Group gap="md" wrap="wrap">
        <TextInput
          placeholder="Tìm kiếm tên giải đấu, địa điểm..."
          leftSection={<Search size={14} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className={styles.searchInput}
        />
        <Select
          placeholder="Lọc trạng thái"
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          data={[
            { value: 'UPCOMING',  label: 'Sắp diễn ra' },
            { value: 'ONGOING',   label: 'Đang diễn ra' },
            { value: 'COMPLETED', label: 'Đã kết thúc' },
          ]}
          className={styles.statusSelect}
        />
      </Group>

      <Box className={styles.tableWrapper}>
        <DataTable
          records={records}
          idAccessor="id"
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          highlightOnHover
          onRowClick={({ record }) => {
            const idx = tournaments.findIndex((t) => t.id === record.id);
            if (idx !== -1) onSelect?.(idx);
            setExpandedId(record.id);
          }}
          rowClassName={(record: Tournament) =>
            record.id === expandedId || record.id === activeTournamentId ? styles.activeRow : ''
          }
          noRecordsText="Không tìm thấy giải đấu nào"
          minHeight={160}
          columns={[
            {
              accessor: 'logo',
              title: '',
              width: 110,
              render: (t) =>
                t.venue.logoUrl ? (
                  <Box className={styles.logoCell}>
                    <img src={t.venue.logoUrl} alt={t.name} className={styles.logoImg} />
                  </Box>
                ) : (
                  <Box className={styles.logoPlaceholder} />
                ),
            },
            {
              accessor: 'name',
              title: 'Tên giải đấu',
              width: 250,
              sortable: true,
              render: (t) => <span className={styles.nameCell}>{t.name}</span>,
            },
            {
              accessor: 'status',
              title: 'Trạng thái',
              sortable: true,
              width: 150,
              render: (t) => {
                const c = STATUS_COLORS[t.status];
                return (
                  <Badge variant="outline" size="sm" style={{ borderColor: c.border, color: c.color }}>
                    {STATUS_LABELS[t.status]}
                  </Badge>
                );
              },
            },
            {
              accessor: 'date',
              title: 'Ngày thi đấu',
              sortable: true,
              width: 170,
              render: (t) => <span className={styles.cell}>{t.schedule.displayDate}</span>,
            },
            {
              accessor: 'slots',
              title: 'Slots',
              width: 110,
              render: (t) => {
                const slot = getSlotSummary(t.registration);
                if (!slot) return <span className={styles.cell}>—</span>;
                return (
                  <span className={slot.isFull ? styles.slotsCellFull : slot.isLow ? styles.slotsCellLow : styles.slotsCell}>
                    {slot.isFull ? 'Hết chỗ' : `${slot.remaining} / ${slot.totalCap}`}
                  </span>
                );
              },
            },
            {
              accessor: 'entryFee',
              title: 'Phí tham gia',
              width: 240,
              render: (t) => <span className={styles.feeCell}>{getEntryFeeDisplay(t)}</span>,
            },
            {
              accessor: 'actions',
              title: '',
              width: 160,
              render: (t) => {
                const idx = tournaments.findIndex((ti) => ti.id === t.id);
                return (
                  <button
                    className={styles.selectBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTournament?.(idx);
                    }}
                  >
                    Chọn giải đấu
                  </button>
                );
              },
            },
          ]}
        />
      </Box>

      {expandedTournament && (
        <TournamentDetailCard
          tournament={expandedTournament}
          onClose={() => setExpandedId(null)}
          onSelectTournament={() => {
            const idx = tournaments.findIndex((t) => t.id === expandedTournament.id);
            onSelectTournament?.(idx);
          }}
        />
      )}
    </Stack>
  );
}
