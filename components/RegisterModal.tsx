'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Group,
  Box,
  Divider,
  SimpleGrid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { DataTable } from 'mantine-datatable';
import { User, Phone, Mail, Check, MapPin, CalendarDays } from 'lucide-react';
import type { RegistrationCategory, RegistrationFormValues, CategorySlotInfo } from '@/types';
import styles from './RegisterModal.module.css';

export interface TournamentSummary {
  name: string;
  venue: { name: string; logoUrl?: string; city: string; country: string };
  schedule: { displayDate: string };
}

function parseFeeVND(fee: string): number {
  return parseInt(fee.replace(/[^\d]/g, ''), 10) || 0;
}

function formatVND(fee: string): string {
  const amount = parseFeeVND(fee);
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
}

const DOUBLES_CATEGORIES: RegistrationCategory[] = [
  'doubles_male',
  'doubles_female',
  'doubles_mixed',
];

const CATEGORY_LABELS: Record<RegistrationCategory, string> = {
  singles_male:   'Đấu Đơn — Nam',
  singles_female: 'Đấu Đơn — Nữ',
  doubles_male:   'Đấu Đôi — Nam / Nam',
  doubles_female: 'Đấu Đôi — Nữ / Nữ',
  doubles_mixed:  'Đấu Đôi — Nam / Nữ',
};

interface CategoryRow {
  id: RegistrationCategory;
  label: string;
  available: number | null;
  capacity: number | null;
  isFull: boolean;
  isLow: boolean;
  isDoubles: boolean;
  fee: string | null;
  partner: null; // virtual accessor for the partner column
}

interface RegisterModalProps {
  opened: boolean;
  onClose: () => void;
  tournamentId: string;
  tournament: TournamentSummary;
  availableCategories: RegistrationCategory[];
  doublesPartnerMode: 'fixed' | 'random';
  categorySlots: Partial<Record<RegistrationCategory, CategorySlotInfo>>;
  entryFeeMode: 'per_category' | 'flat';
  entryFee?: string;
  categoryFees?: Partial<Record<RegistrationCategory, string>>;
  groupUrl?: string;
}

export default function RegisterModal({
  opened,
  onClose,
  tournamentId,
  tournament,
  availableCategories,
  doublesPartnerMode,
  categorySlots,
  entryFeeMode,
  entryFee,
  categoryFees,
  groupUrl,
}: RegisterModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegistrationFormValues>({
    initialValues: {
      tournament_id: tournamentId,
      full_name: '',
      phone: '',
      email: '',
      gender: 'male',
      category: [],
      partner_names: {},
      notes: '',
    },
    validate: {
      full_name: (v) =>
        v.trim().length < 2 ? 'Vui lòng nhập họ và tên (ít nhất 2 ký tự)' : null,
      phone: (v) =>
        /^[0-9+\-\s()]{9,15}$/.test(v.trim()) ? null : 'Số điện thoại không hợp lệ',
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Email không hợp lệ'),
      gender: (v) => (v ? null : 'Vui lòng chọn giới tính'),
      category: (v) =>
        v.length === 0 ? 'Vui lòng chọn ít nhất một hạng mục thi đấu' : null,
      partner_names: (v, values) => {
        if (doublesPartnerMode !== 'fixed') return null;
        const selectedDoubles = values.category.filter((c) => DOUBLES_CATEGORIES.includes(c));
        if (selectedDoubles.length === 0) return null;
        return selectedDoubles.every((c) => v[c] && (v[c] as string).trim().length >= 2)
          ? null
          : 'required';
      },
    },
  });

  // ── Visible categories filtered by slot config + gender ──
  const visibleCategories = useMemo(() => {
    const g = form.values.gender;
    // When category slots are configured, restrict to only those categories.
    // This keeps the modal consistent with the slot-availability display.
    const slotKeys = Object.keys(categorySlots) as RegistrationCategory[];
    const base = slotKeys.length > 0
      ? availableCategories.filter((cat) => categorySlots[cat] !== undefined)
      : availableCategories;
    return base.filter((cat) => {
      if (cat === 'singles_male')   return g === 'male';
      if (cat === 'singles_female') return g === 'female';
      if (cat === 'doubles_male')   return g === 'male';
      if (cat === 'doubles_female') return g === 'female';
      return true; // doubles_mixed open to all
    });
  }, [availableCategories, categorySlots, form.values.gender]);

  // ── DataTable row data ────────────────────────────────────
  const tableRows: CategoryRow[] = useMemo(
    () =>
      visibleCategories.map((cat) => {
        const slot = categorySlots[cat];
        const avail = slot !== undefined ? slot.capacity - slot.used : null;
        return {
          id: cat,
          label: CATEGORY_LABELS[cat],
          available: avail,
          capacity: slot?.capacity ?? null,
          isFull: avail !== null && avail <= 0,
          isLow: avail !== null && avail > 0 && avail <= 5,
          isDoubles: DOUBLES_CATEGORIES.includes(cat),
          fee: categoryFees?.[cat] ?? null,
          partner: null,
        };
      }),
    [visibleCategories, categorySlots, categoryFees],
  );

  const feeColumn = {
    accessor: 'fee' as const,
    title: 'Phí',
    width: 130,
    textAlign: 'right' as const,
    render: (row: CategoryRow) =>
      row.fee ? (
        <span className={styles.categoryFee}>{formatVND(row.fee)}</span>
      ) : (
        <span className={styles.categorySlots}>—</span>
      ),
  };

  const hasDoubles = form.values.category.some((c) => DOUBLES_CATEGORIES.includes(c));

  // ── Category toggle ───────────────────────────────────────
  const toggleCategory = (cat: RegistrationCategory) => {
    const current = form.values.category;
    if (current.includes(cat)) {
      form.setFieldValue('category', current.filter((c) => c !== cat));
      if (DOUBLES_CATEGORIES.includes(cat)) {
        const newNames = { ...form.values.partner_names };
        delete newNames[cat];
        form.setFieldValue('partner_names', newNames);
      }
    } else {
      form.setFieldValue('category', [...current, cat]);
    }
  };

  // ── Gender change — also prunes incompatible categories ───
  const handleGenderChange = (value: string | null) => {
    const newGender = (value ?? 'male') as 'male' | 'female';
    form.setFieldValue('gender', newGender);
    const removed = form.values.category.filter((c) => {
      if (c === 'singles_male')   return newGender !== 'male';
      if (c === 'singles_female') return newGender !== 'female';
      if (c === 'doubles_male')   return newGender !== 'male';
      if (c === 'doubles_female') return newGender !== 'female';
      return false;
    });
    form.setFieldValue(
      'category',
      form.values.category.filter((c) => !removed.includes(c)),
    );
    const removedDoubles = removed.filter((c) => DOUBLES_CATEGORIES.includes(c));
    if (removedDoubles.length > 0) {
      const newNames = { ...form.values.partner_names };
      removedDoubles.forEach((c) => delete newNames[c]);
      form.setFieldValue('partner_names', newNames);
    }
  };

  // ── DataTable columns ─────────────────────────────────────
  const categoryColumn = {
    accessor: 'id' as const,
    title: 'Hạng Mục',
    render: (row: CategoryRow) => {
      const isSelected = form.values.category.includes(row.id);
      return (
        <Group gap={10} wrap="nowrap">
          <Box className={isSelected ? styles.categoryCheckOn : styles.categoryCheckOff}>
            {isSelected && <Check size={10} strokeWidth={3} color="#1a1919" />}
          </Box>
          <span className={styles.categoryName}>{row.label}</span>
        </Group>
      );
    },
  };

  const slotsColumn = {
    accessor: 'available' as const,
    title: 'Còn Lại',
    width: 90,
    textAlign: 'center' as const,
    render: (row: CategoryRow) => {
      if (row.available === null) return <span className={styles.categorySlots}>—</span>;
      if (row.isFull) return <span className={styles.categorySlotsFull}>Hết chỗ</span>;
      return (
        <span className={row.isLow ? styles.categorySlotsLow : styles.categorySlots}>
          {row.available} / {row.capacity}
        </span>
      );
    },
  };

  const partnerColumn = {
    accessor: 'partner' as const,
    title: 'Đồng Đội',
    render: (row: CategoryRow) => {
      if (!row.isDoubles) return null;
      const isSelected = form.values.category.includes(row.id);
      if (!isSelected) return null;

      if (doublesPartnerMode === 'random') {
        return <span className={styles.randomNote}>BTC ghép ngẫu nhiên ✨</span>;
      }

      // fixed mode — show partner name input
      const value = form.values.partner_names[row.id] ?? '';
      const showError = !!form.errors.partner_names && value.trim().length < 2;
      return (
        <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <TextInput
            placeholder="Tên đồng đội..."
            size="xs"
            value={value}
            onChange={(e) =>
              form.setFieldValue('partner_names', {
                ...form.values.partner_names,
                [row.id]: e.currentTarget.value,
              })
            }
            error={showError ? ' ' : undefined}
          />
        </div>
      );
    },
  };

  const hasFees = entryFeeMode === 'per_category' && tableRows.some((r) => r.fee !== null);
  const baseColumns = hasFees
    ? [categoryColumn, feeColumn, slotsColumn]
    : [categoryColumn, slotsColumn];
  const columns = hasDoubles ? [...baseColumns, partnerColumn] : baseColumns;

  // ── Form submit ───────────────────────────────────────────
  const handleSubmit = async (values: RegistrationFormValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Đăng ký thất bại');
      const catFeesObj =
        entryFeeMode === 'per_category'
          ? Object.fromEntries(
              values.category
                .filter((c) => categoryFees?.[c])
                .map((c) => [c, categoryFees![c]]),
            )
          : {};
      const urlParams = new URLSearchParams({
        n: values.full_name,
        cats: values.category.join(','),
        ...(entryFeeMode === 'flat' && entryFee ? { fee: entryFee } : {}),
        ...(Object.keys(catFeesObj).length > 0 ? { cf: JSON.stringify(catFeesObj) } : {}),
        ...(groupUrl ? { gu: groupUrl } : {}),
      });
      form.reset();
      onClose();
      router.push(`/checkout?${urlParams.toString()}`);
    } catch (err) {
      notifications.show({
        title: 'Lỗi đăng ký',
        message: err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<span className={styles.modalTitle}>ĐĂNG KÝ THAM GIA</span>}
      size="xl"
      classNames={{
        content: styles.modalContent,
        header: styles.modalHeader,
        close: styles.modalClose,
      }}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md" mt="sm">
            {/* ── Mobile logo banner (full-width, above summary card) ── */}
            {tournament.venue.logoUrl && (
              <Box className={styles.summaryLogoBanner}>
                <img
                  src={tournament.venue.logoUrl}
                  alt={tournament.name}
                  className={styles.summaryLogoBannerImg}
                />
              </Box>
            )}

            {/* ── Tournament summary ── */}
            <Box className={styles.tournamentSummary}>
              {tournament.venue.logoUrl && (
                <img
                  src={tournament.venue.logoUrl}
                  alt={tournament.name}
                  className={styles.summaryLogo}
                />
              )}
              <Box className={styles.summaryInfo}>
                <span className={styles.summaryName}>{tournament.name}</span>
                <Group gap={12} mt={4} wrap="wrap">
                  <Group gap={5} style={{ minWidth: 0, overflow: 'hidden' }}>                    
                    <span className={styles.summaryMeta}><MapPin size={12} color="#b8ff00" style={{ flexShrink: 0 }} /> {tournament.venue.name} · {tournament.venue.city}</span>
                  </Group>
                  <Group gap={5} style={{ minWidth: 0, overflow: 'hidden' }}>
                    <CalendarDays size={12} color="#b8ff00" style={{ flexShrink: 0 }} />
                    <span className={styles.summaryMeta}>{tournament.schedule.displayDate}</span>
                  </Group>
                </Group>
              </Box>
            </Box>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" style={{ alignItems: 'start' }}>
              <TextInput
                label="Họ và Tên"
                placeholder="Nguyễn Văn A"
                required
                leftSection={<User size={16} color="#ADAAAA" />}
                classNames={{ label: styles.inputLabel }}
                {...form.getInputProps('full_name')}
              />

              <Box>
                <Box component="label" className={styles.inputLabel} mb={6} display="block">
                  Giới Tính <span className={styles.requiredStar}>*</span>
                </Box>
                <Group gap={10}>
                  {(['male', 'female'] as const).map((g) => {
                    const isActive = form.values.gender === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        className={`${styles.genderBtn} ${isActive ? styles.genderBtnActive : ''}`}
                        onClick={() => handleGenderChange(g)}
                      >
                        <span className={`${styles.genderDot} ${isActive ? styles.genderDotActive : ''}`} />
                        {g === 'male' ? 'Nam' : 'Nữ'}
                      </button>
                    );
                  })}
                </Group>
                {form.errors.gender && (
                  <Box className={styles.categoryError}>{form.errors.gender}</Box>
                )}
              </Box>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Số Điện Thoại"
                placeholder="0912 345 678"
                required
                leftSection={<Phone size={16} color="#ADAAAA" />}
                classNames={{ label: styles.inputLabel }}
                {...form.getInputProps('phone')}
              />
              <TextInput
                label="Email"
                placeholder="email@example.com"
                required
                leftSection={<Mail size={16} color="#ADAAAA" />}
                classNames={{ label: styles.inputLabel }}
                {...form.getInputProps('email')}
              />
            </SimpleGrid>

            {/* ── Category selection table ── */}
            <Box>
              <Box component="label" className={styles.inputLabel} mb={6} display="block">
                Hạng Mục Thi Đấu{' '}
                <span className={styles.requiredStar}>*</span>
              </Box>
              <Box className={styles.categoryDataTableWrapper}>
                <DataTable
                  withTableBorder
                  borderRadius="sm"
                  records={tableRows}
                  idAccessor="id"
                  columns={columns}
                  onRowClick={({ record: row }) => !row.isFull && toggleCategory(row.id)}
                  rowClassName={(row) =>
                    [
                      styles.categoryRow,
                      form.values.category.includes(row.id) ? styles.categoryRowSelected : '',
                      row.isFull ? styles.categoryRowFull : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  }
                />
              </Box>
              {form.errors.category && (
                <Box className={styles.categoryError}>{form.errors.category}</Box>
              )}
              {form.errors.partner_names && (
                <Box className={styles.categoryError}>
                  Vui lòng nhập tên đồng đội cho tất cả hạng mục đôi đã chọn
                </Box>
              )}
              {entryFeeMode === 'flat' && entryFee && (
                <Group justify="space-between" className={styles.flatFeeRow}>
                  <span className={styles.flatFeeLabel}>Phí tham gia</span>
                  <span className={styles.flatFeeAmount}>{formatVND(entryFee)}</span>
                </Group>
              )}
            </Box>

            <Textarea
              label="Ghi Chú (Tùy chọn)"
              placeholder="Thông tin thêm, yêu cầu đặc biệt..."
              classNames={{ label: styles.inputLabel }}
              minRows={2}
              {...form.getInputProps('notes')}
            />

            <Divider className={styles.divider} mt="xs" />

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className={styles.submitButton}
            >
              {loading ? 'ĐANG GỬI...' : '[ ĐĂNG KÝ NGAY ]'}
            </Button>
          </Stack>
        </form>
    </Modal>
  );
}
