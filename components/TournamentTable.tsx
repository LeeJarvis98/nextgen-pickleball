'use client';

import { useMemo, useState } from 'react';
import { DataTable } from 'mantine-datatable';
import { Badge, Box, Group, Select, Stack, TextInput } from '@mantine/core';
import { Search } from 'lucide-react';
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

interface TournamentTableProps {
  tournaments: Tournament[];
  activeTournamentId?: string;
  onSelect?: (index: number) => void;
}

export default function TournamentTable({
  tournaments,
  activeTournamentId,
  onSelect,
}: TournamentTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortStatus, setSortStatus] = useState<SortStatus>({
    columnAccessor: 'name',
    direction: 'asc',
  });

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
        case 'name':      aVal = a.name;               bVal = b.name;               break;
        case 'status':    aVal = a.status;             bVal = b.status;             break;
        case 'date':      aVal = a.schedule.startDate; bVal = b.schedule.startDate; break;
        case 'venue':     aVal = a.venue.name;         bVal = b.venue.name;         break;
        case 'city':      aVal = a.venue.city;         bVal = b.venue.city;         break;
        case 'courts':    aVal = a.venue.courts;       bVal = b.venue.courts;       break;
        case 'courtType': aVal = a.venue.courtType;    bVal = b.venue.courtType;    break;
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
          }}
          rowClassName={(record: Tournament) =>
            record.id === activeTournamentId ? styles.activeRow : ''
          }
          noRecordsText="Không tìm thấy giải đấu nào"
          minHeight={160}
          columns={[
            {
              accessor: 'logo',
              title: '',
              width: 90,
              render: (t) =>
                t.venue.logoUrl ? (
                  <Box className={styles.logoCell}>
                    <img
                      src={t.venue.logoUrl}
                      alt={t.name}
                      className={styles.logoImg}
                    />
                  </Box>
                ) : (
                  <Box className={styles.logoPlaceholder} />
                ),
            },
            {
              accessor: 'name',
              title: 'Tên giải đấu',
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
                  <Badge
                    variant="outline"
                    size="sm"
                    style={{ borderColor: c.border, color: c.color }}
                  >
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
              accessor: 'checkIn',
              title: 'Check-in',
              width: 110,
              render: (t) => <span className={styles.cell}>{t.schedule.checkInTime}</span>,
            },
            {
              accessor: 'venue',
              title: 'Địa điểm',
              sortable: true,
              render: (t) => <span className={styles.cell}>{t.venue.name}</span>,
            },
            {
              accessor: 'city',
              title: 'Thành phố',
              sortable: true,
              width: 130,
              render: (t) => <span className={styles.cell}>{t.venue.city}</span>,
            },
            {
              accessor: 'courts',
              title: 'Số sân',
              sortable: true,
              width: 85,
              textAlign: 'center',
              render: (t) => <span className={styles.cell}>{t.venue.courts}</span>,
            },
            {
              accessor: 'courtType',
              title: 'Loại sân',
              width: 120,
              render: (t) => <span className={styles.cell}>{t.venue.courtType}</span>,
            },
            {
              accessor: 'entryFee',
              title: 'Phí dự thi',
              width: 190,
              render: (t) => <span className={styles.feeCell}>{getEntryFeeDisplay(t)}</span>,
            },
          ]}
        />
      </Box>
    </Stack>
  );
}
