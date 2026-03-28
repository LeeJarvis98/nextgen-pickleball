'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Button, Container, Group, Stack, Tabs, Badge,
  TextInput, Textarea, Select, MultiSelect, NumberInput, ActionIcon,
  Modal, LoadingOverlay, Title, Tooltip, Divider, Text,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { DataTable } from 'mantine-datatable';
import {
  LogOut, Trophy, Users, RefreshCw, Edit, Trash2, Save, X,
  Calendar, MapPin, Award, ClipboardList, AlertCircle, Plus,
  ChevronUp, ChevronDown, Shuffle,
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TournamentRow {
  id: string;
  name: string;
  status: string;
  sort_order: number;
  tournament_schedule: Record<string, string> | null;
  tournament_venues: Record<string, string | number> | null;
  tournament_prizes: { total_prize: string } | null;
  tournament_registration_info: Record<string, unknown> | null;
  tournament_prize_entries: Array<Record<string, unknown>>;
}

interface RegistrationRow {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string;
  gender: string;
  category: string[];
  status: string;
  tournament_id: string | null;
  notes: string | null;
}

interface PrizeEntry {
  id?: string;
  rank: number;
  title: string;
  amount: string;
  bonus: string;
}

interface KVPair {
  key: string;
  value: string;
}

interface SlotEntry {
  key: string;
  capacity: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: 'yellow', ONGOING: 'green', COMPLETED: 'gray',
  pending: 'yellow', confirmed: 'green', cancelled: 'red',
};

function StatusBadge({ value }: { value: string }) {
  return (
    <Badge color={STATUS_COLORS[value] ?? 'gray'} variant="light" size="sm">
      {value}
    </Badge>
  );
}

// Label for a field, turning snake_case into Title Case
function fieldLabel(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Available registration categories
const CATEGORY_OPTIONS = [
  { value: 'singles_male',    label: 'Singles — Male' },
  { value: 'singles_female',  label: 'Singles — Female' },
  { value: 'doubles_male',    label: 'Doubles — Male' },
  { value: 'doubles_female',  label: 'Doubles — Female' },
  { value: 'doubles_mixed',   label: 'Doubles — Mixed' },
];

// Date-type field keys (datetime-local; start/end dates handled separately; deadline fields are auto-computed)
const DATE_FIELDS = new Set<string>();
// Date-only field keys (no time component)
const DATE_ONLY_FIELDS = new Set(['start_date', 'end_date']);
// URL-type field keys
const URL_FIELDS = new Set(['registration_link', 'image_url']);
// Time-type field keys
const TIME_FIELDS = new Set(['check_in_time', 'opening_time', 'closing_time']);
// Logo field keys
const LOGO_FIELDS = new Set(['logo_url']);

const LOGO_OPTIONS = [
  { value: '/logos/Family_Cup.webp',       label: 'Family Cup' },
  { value: '/logos/Open_Division.webp',    label: 'Open Division' },
  { value: '/logos/School_League.webp',    label: 'School League' },
  { value: '/logos/University_League.webp', label: 'University League' },
];

const SCHEDULE_STATUS_OPTIONS = [
  { value: 'Dự kiến',   label: 'Dự kiến' },
  { value: 'Chính thức', label: 'Chính thức' },
];

/** Format ISO datetime (YYYY-MM-DDTHH:MM) → short display "DD/MM/YYYY". */
function formatDeadlineDisplay(iso: string): string {
  const [datePart] = iso.split('T');
  if (!datePart) return '';
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

/** Format ISO datetime (YYYY-MM-DDTHH:MM) → full display "HH:MM · DD.MM.YYYY". */
function formatDeadlineDatetime(iso: string): string {
  const [datePart, timePart] = iso.split('T');
  if (!datePart || !timePart) return '';
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return '';
  const time = timePart.slice(0, 5); // HH:MM
  return `${time} · ${d}.${m}.${y}`;
}

/** Parse stored display strings back to ISO datetime for the picker (best-effort). */
function parseDeadlineToISO(deadlineDatetime: string): string {
  // Expected format: "HH:MM · DD.MM.YYYY"
  const parts = deadlineDatetime.split(' · ');
  if (parts.length !== 2) return '';
  const [time, datePart] = parts;
  const dateSplit = datePart.split('.');
  if (dateSplit.length !== 3) return '';
  const [dd, mm, yyyy] = dateSplit;
  if (!dd || !mm || !yyyy || !time) return '';
  return `${yyyy}-${mm}-${dd}T${time}`;
}

/** Auto-format display_date from two ISO date strings (YYYY-MM-DD). */
function computeDisplayDate(startDate: string, endDate: string): string {
  if (!startDate) return '';
  const [sy, sm, sd] = startDate.split('-');
  if (!sy || !sm || !sd) return '';
  if (!endDate || startDate === endDate) return `${sd} / ${sm} / ${sy}`;
  const [ey, em, ed] = endDate.split('-');
  if (!ey || !em || !ed) return `${sd} / ${sm} / ${sy}`;
  if (sy === ey && sm === em) return `${sd} - ${ed} / ${sm} / ${sy}`;
  if (sy === ey) return `${sd} / ${sm} - ${ed} / ${em} / ${sy}`;
  return `${sd} / ${sm} / ${sy} - ${ed} / ${em} / ${ey}`;
}

/** Section heading with optional dirty indicator */
function SectionTag({ label, dirty }: { label: string; dirty?: boolean }) {
  return (
    <Group gap={6} mb={4}>
      <span className={styles.sectionHeading}>{label}</span>
      {dirty && (
        <Badge size="xs" color="yellow" variant="filled" className={styles.dirtyBadge}>
          unsaved
        </Badge>
      )}
    </Group>
  );
}

/** Key-value pair editor for category_fees */
function KVEditor({ pairs, onChange }: { pairs: KVPair[]; onChange: (pairs: KVPair[]) => void }) {
  const update = (i: number, field: 'key' | 'value', val: string) => {
    const next = pairs.map((p, idx) => idx === i ? { ...p, [field]: val } : p);
    onChange(next);
  };
  const remove = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));

  const usedKeys = new Set(pairs.map((p) => p.key).filter(Boolean));
  const add = () => {
    const next = CATEGORY_OPTIONS.find((o) => !usedKeys.has(o.value));
    onChange([...pairs, { key: next?.value ?? '', value: '' }]);
  };
  const allUsed = CATEGORY_OPTIONS.every((o) => usedKeys.has(o.value));

  return (
    <Stack gap={6}>
      {pairs.map((p, i) => (
        <Group key={i} gap={8} wrap="nowrap">
          <Select
            placeholder="Select category"
            data={CATEGORY_OPTIONS.map((o) => ({
              ...o,
              disabled: usedKeys.has(o.value) && o.value !== p.key,
            }))}
            value={p.key || null}
            onChange={(v) => update(i, 'key', v ?? '')}
            style={{ flex: 1.4 }}
            size="xs"
            allowDeselect={false}
          />
          <TextInput
            placeholder="fee (e.g. 200.000 VNĐ)"
            value={p.value}
            onChange={(e) => update(i, 'value', e.currentTarget.value)}
            classNames={{ label: styles.inputLabel }}
            style={{ flex: 1 }}
            size="xs"
          />
          <ActionIcon size="sm" variant="subtle" color="red" onClick={() => remove(i)}>
            <X size={12} />
          </ActionIcon>
        </Group>
      ))}
      <Button
        size="xs"
        variant="subtle"
        leftSection={<Plus size={12} />}
        onClick={add}
        className={styles.addRowButton}
        disabled={allUsed}
      >
        {allUsed ? 'All categories added' : 'Add category'}
      </Button>
    </Stack>
  );
}

/** Category slot capacity editor */
const SINGLES_CATEGORIES = new Set(['singles_male', 'singles_female']);

/** Match boundary: singles need 2 persons/match, doubles need 4 persons/match. */
function matchSize(cat: string): number {
  return SINGLES_CATEGORIES.has(cat) ? 2 : 4;
}

/**
 * Distribute totalSlots evenly across categories, rounding each down to its
 * match boundary (2 for singles, 4 for doubles).
 * If there is only 1 category it receives the full cap (rounded to boundary).
 */
function autoDistributeSlots(cats: string[], totalSlots: number): SlotEntry[] {
  if (cats.length === 0 || totalSlots <= 0) return cats.map((key) => ({ key, capacity: 0 }));
  if (cats.length === 1) {
    const ms = matchSize(cats[0]);
    return [{ key: cats[0], capacity: Math.floor(totalSlots / ms) * ms }];
  }
  const base = totalSlots / cats.length;
  return cats.map((key) => {
    const ms = matchSize(key);
    return { key, capacity: Math.floor(base / ms) * ms };
  });
}

function CategorySlotsEditor({
  slots,
  totalSlots,
  availableCategories,
  onChange,
}: {
  slots: SlotEntry[];
  totalSlots: number;
  availableCategories: string[];
  onChange: (slots: SlotEntry[]) => void;
}) {
  const update = (i: number, field: 'key' | 'capacity', val: string | number) => {
    onChange(slots.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };
  const remove = (i: number) => onChange(slots.filter((_, idx) => idx !== i));

  const usedKeys = new Set(slots.map((s) => s.key).filter(Boolean));
  const add = () => {
    const next = CATEGORY_OPTIONS.find((o) => !usedKeys.has(o.value));
    onChange([...slots, { key: next?.value ?? '', capacity: 0 }]);
  };
  const allUsed = CATEGORY_OPTIONS.every((o) => usedKeys.has(o.value));
  const totalAllocated = slots.reduce((sum, s) => sum + (s.capacity || 0), 0);
  const overCap = totalSlots > 0 && totalAllocated > totalSlots;

  const handleAutoDistribute = () => {
    // Use existing slot keys; fall back to available categories if slots is empty
    const cats = slots.length > 0
      ? slots.map((s) => s.key).filter(Boolean)
      : availableCategories;
    onChange(autoDistributeSlots(cats, totalSlots));
  };

  const canAutoDistribute = totalSlots > 0 && (
    slots.some((s) => s.key) || availableCategories.length > 0
  );

  return (
    <Stack gap={6}>
      <Group justify="space-between" align="center">
        <Button
          size="xs"
          variant="light"
          color="neonLime"
          leftSection={<Shuffle size={12} />}
          onClick={handleAutoDistribute}
          disabled={!canAutoDistribute}
          title="Distribute total slots evenly across categories (singles=2pp/match, doubles=4pp/match)"
        >
          Auto Distribute
        </Button>
        <Text size="xs" c={overCap ? 'red' : 'dimmed'}>
          {overCap && '⚠ '}Allocated: {totalAllocated} / {totalSlots || '∞'}
        </Text>
      </Group>
      {slots.map((s, i) => (
        <Group key={i} gap={8} wrap="nowrap">
          <Select
            placeholder="Select category"
            data={CATEGORY_OPTIONS.map((o) => ({
              ...o,
              disabled: usedKeys.has(o.value) && o.value !== s.key,
            }))}
            value={s.key || null}
            onChange={(v) => update(i, 'key', v ?? '')}
            style={{ flex: 1.4 }}
            size="xs"
            allowDeselect={false}
          />
          <NumberInput
            placeholder="Capacity"
            value={s.capacity}
            onChange={(v) => update(i, 'capacity', Number(v))}
            min={0}
            style={{ flex: 0.8 }}
            size="xs"
          />
          <ActionIcon size="sm" variant="subtle" color="red" onClick={() => remove(i)}>
            <X size={12} />
          </ActionIcon>
        </Group>
      ))}
      <Button
        size="xs"
        variant="subtle"
        leftSection={<Plus size={12} />}
        onClick={add}
        className={styles.addRowButton}
        disabled={allUsed}
      >
        {allUsed ? 'All categories added' : 'Add category slot'}
      </Button>
    </Stack>
  );
}

/** Prize entries editor */
function PrizeEntriesEditor({ entries, onChange }: { entries: PrizeEntry[]; onChange: (entries: PrizeEntry[]) => void }) {
  const update = (i: number, field: keyof PrizeEntry, val: string | number) => {
    onChange(entries.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  };
  const remove = (i: number) => onChange(entries.filter((_, idx) => idx !== i));
  const add = () => onChange([...entries, { rank: entries.length + 1, title: '', amount: '', bonus: '' }]);
  const move = (i: number, dir: -1 | 1) => {
    const next = [...entries];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((e, idx) => ({ ...e, rank: idx + 1 })));
  };

  return (
    <Stack gap={8}>
      {entries.map((entry, i) => (
        <Box key={i} className={styles.prizeEntryRow}>
          <Group gap={6} wrap="nowrap" align="flex-start">
            <Stack gap={2} justify="center">
              <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => move(i, -1)} disabled={i === 0}>
                <ChevronUp size={10} />
              </ActionIcon>
              <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => move(i, 1)} disabled={i === entries.length - 1}>
                <ChevronDown size={10} />
              </ActionIcon>
            </Stack>
            <Box className={styles.prizeRank}>{entry.rank}</Box>
            <TextInput
              placeholder="Title (e.g. Champion)"
              value={entry.title}
              onChange={(e) => update(i, 'title', e.currentTarget.value)}
              style={{ flex: 2 }}
              size="xs"
            />
            <TextInput
              placeholder="Amount (e.g. 5.000.000đ)"
              value={entry.amount}
              onChange={(e) => update(i, 'amount', e.currentTarget.value)}
              style={{ flex: 1.5 }}
              size="xs"
            />
            <TextInput
              placeholder="Bonus"
              value={entry.bonus}
              onChange={(e) => update(i, 'bonus', e.currentTarget.value)}
              style={{ flex: 1 }}
              size="xs"
            />
            <ActionIcon size="sm" variant="subtle" color="red" onClick={() => remove(i)}>
              <Trash2 size={12} />
            </ActionIcon>
          </Group>
        </Box>
      ))}
      <Button
        size="xs"
        variant="subtle"
        leftSection={<Plus size={12} />}
        onClick={add}
        className={styles.addRowButton}
      >
        Add prize tier
      </Button>
    </Stack>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | null>('tournaments');

  // Tournaments state
  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);

  // Registrations state
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [regsLoading, setRegsLoading] = useState(false);
  const [filterTournament, setFilterTournament] = useState<string | null>(null);

  // Edit tournament modal
  const [editTournament, setEditTournament] = useState<TournamentRow | null>(null);
  const [editModalTab, setEditModalTab] = useState<string | null>('core');
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editSaving, setEditSaving] = useState(false);
  // Dirty section tracking
  const [dirtySections, setDirtySections] = useState<Set<string>>(new Set());
  const originalTournament = useRef<TournamentRow | null>(null);
  // Prize entries and category fees as structured state
  const [prizeEntries, setPrizeEntries] = useState<PrizeEntry[]>([]);
  const [categoryFees, setCategoryFees] = useState<KVPair[]>([]);
  const [categoryFeesJson, setCategoryFeesJson] = useState('');
  const [categoryFeesJsonError, setCategoryFeesJsonError] = useState('');
  const [categorySlots, setCategorySlots] = useState<SlotEntry[]>([]);
  // ISO datetime string driving the deadline display auto-compute (not stored directly)
  const [deadlinePicker, setDeadlinePicker] = useState('');

  // Create tournament modal
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createForm, setCreateForm] = useState({ id: '', name: '', status: 'UPCOMING', sort_order: 0 });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  // Edit registration modal
  const [editReg, setEditReg] = useState<RegistrationRow | null>(null);
  const [editRegOpened, { open: openEditReg, close: closeEditReg }] = useDisclosure(false);
  const [editRegSaving, setEditRegSaving] = useState(false);

  // ── Data fetchers ──────────────────────────────────────────────────────────

  const loadTournaments = useCallback(async () => {
    setTournamentsLoading(true);
    try {
      const res = await fetch('/api/admin/tournaments');
      if (!res.ok) throw new Error('Failed to load');
      setTournaments(await res.json());
    } catch {
      notifications.show({ title: 'Error', message: 'Could not load tournaments.', color: 'red' });
    } finally {
      setTournamentsLoading(false);
    }
  }, []);

  const loadRegistrations = useCallback(async (tid?: string | null) => {
    setRegsLoading(true);
    try {
      const url = tid ? `/api/admin/registrations?tournament_id=${tid}` : '/api/admin/registrations';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load');
      setRegistrations(await res.json());
    } catch {
      notifications.show({ title: 'Error', message: 'Could not load registrations.', color: 'red' });
    } finally {
      setRegsLoading(false);
    }
  }, []);

  useEffect(() => { loadTournaments(); }, [loadTournaments]);
  useEffect(() => { if (activeTab === 'registrations') loadRegistrations(filterTournament); }, [activeTab, filterTournament, loadRegistrations]);

  // ── Logout ─────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  // ── Tournament edit helpers ────────────────────────────────────────────────

  const markDirty = (section: string) => {
    setDirtySections((prev) => new Set([...prev, section]));
  };

  const setTournamentField = <K extends keyof TournamentRow>(
    field: K,
    value: TournamentRow[K],
    section: string,
  ) => {
    setEditTournament((prev) => prev ? { ...prev, [field]: value } : prev);
    markDirty(section);
  };

  const setSubField = (
    subKey: 'tournament_schedule' | 'tournament_venues' | 'tournament_prizes' | 'tournament_registration_info',
    field: string,
    value: unknown,
    section: string,
  ) => {
    setEditTournament((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [subKey]: { ...(prev[subKey] as Record<string, unknown>), [field]: value },
      };
    });
    markDirty(section);
  };

  /** Updates start_date or end_date and auto-computes display_date in one state update. */
  const setScheduleDateField = (dateKey: 'start_date' | 'end_date', value: string) => {
    setEditTournament((prev) => {
      if (!prev) return prev;
      const sched = { ...(prev.tournament_schedule ?? {}) } as Record<string, string>;
      sched[dateKey] = value;
      const s = String(sched.start_date ?? '');
      const e = String(sched.end_date ?? '');
      sched.display_date = computeDisplayDate(s, e);
      return { ...prev, tournament_schedule: sched };
    });
    markDirty('schedule');
  };

  // ── Tournament actions ─────────────────────────────────────────────────────

  const handleEditTournamentOpen = (row: TournamentRow) => {
    const snapshot = JSON.parse(JSON.stringify(row)) as TournamentRow;
    originalTournament.current = snapshot;
    setEditTournament(snapshot);
    setEditModalTab('core');
    setDirtySections(new Set());

    // Init prize entries
    const entries = (row.tournament_prize_entries ?? []).map((e) => ({
      id: String(e.id ?? ''),
      rank: Number(e.rank ?? 0),
      title: String(e.title ?? ''),
      amount: String(e.amount ?? ''),
      bonus: String(e.bonus ?? ''),
    }));
    setPrizeEntries(entries);

    // Init category fees KV pairs
    const fees = (row.tournament_registration_info as Record<string, unknown>)?.category_fees;
    if (fees && typeof fees === 'object' && !Array.isArray(fees)) {
      setCategoryFees(Object.entries(fees as Record<string, string>).map(([key, value]) => ({ key, value })));
      setCategoryFeesJson(JSON.stringify(fees, null, 2));
    } else {
      setCategoryFees([]);
      setCategoryFeesJson('');
    }
    setCategoryFeesJsonError('');

    // Init category slots
    const slotsRaw = (row.tournament_registration_info as Record<string, unknown>)?.category_slots;
    if (slotsRaw && typeof slotsRaw === 'object' && !Array.isArray(slotsRaw)) {
      setCategorySlots(
        Object.entries(slotsRaw as Record<string, { capacity: number }>).map(([key, val]) => ({
          key,
          capacity: Number(val?.capacity ?? 0),
        }))
      );
    } else {
      setCategorySlots([]);
    }

    // Init deadline picker from stored display string
    const regInfoRow = row.tournament_registration_info as Record<string, unknown> | null;
    const storedDdt = String(regInfoRow?.deadline_date_time ?? '');
    setDeadlinePicker(parseDeadlineToISO(storedDdt));

    openEdit();
  };

  const handleCloseEdit = () => {
    if (dirtySections.size > 0) {
      if (!confirm('You have unsaved changes. Discard and close?')) return;
    }
    closeEdit();
  };

  const handleEditTournamentSave = async () => {
    if (!editTournament) return;
    if (categoryFeesJsonError) {
      notifications.show({ title: 'Fix Errors', message: 'Category fees JSON is invalid.', color: 'red' });
      return;
    }
    setEditSaving(true);
    try {
      const { id, name, status, sort_order, tournament_schedule, tournament_venues, tournament_prizes, tournament_registration_info } = editTournament;

      // Merge category_fees back from KV pairs
      const feesObj = categoryFees.length > 0
        ? Object.fromEntries(categoryFees.filter((p) => p.key).map((p) => [p.key, p.value]))
        : null;

      // Merge category_slots back from slot entries
      const slotsObj = categorySlots.length > 0
        ? Object.fromEntries(
            categorySlots.filter((s) => s.key).map((s) => [s.key, { capacity: s.capacity }])
          )
        : {};

      const updates: Array<{ table: string; data: Record<string, unknown> }> = [
        { table: 'tournaments', data: { name, status, sort_order } },
      ];
      if (tournament_schedule) updates.push({ table: 'tournament_schedule', data: tournament_schedule });
      if (tournament_venues) updates.push({ table: 'tournament_venues', data: tournament_venues });
      if (tournament_prizes) updates.push({ table: 'tournament_prizes', data: tournament_prizes });
      if (tournament_registration_info) {
        updates.push({
          table: 'tournament_registration_info',
          data: { ...tournament_registration_info, category_fees: feesObj, category_slots: slotsObj },
        });
      }

      const results: PromiseSettledResult<void>[] = await Promise.allSettled(
        updates.map((u) =>
          fetch(`/api/admin/tournaments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(u),
          }).then((r) => { if (!r.ok) throw new Error(`Failed to update ${u.table}`); }),
        ),
      );

      // Save prize entries: single request, server does delete-then-re-insert
      if (dirtySections.has('prizes')) {
        const prizeResult = await Promise.allSettled([
          fetch(`/api/admin/tournaments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              table: 'tournament_prize_entries',
              data: { entries: prizeEntries },
            }),
          }).then(async (r) => {
            if (!r.ok) {
              const body = await r.json().catch(() => ({}));
              throw new Error(body.error ?? 'Failed to update tournament_prize_entries');
            }
          }),
        ]);
        results.push(...prizeResult);
      }

      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        notifications.show({ title: 'Partial Save', message: `${failed.length} section(s) failed to save.`, color: 'orange' });
      } else {
        notifications.show({ title: 'Saved', message: 'Tournament updated successfully.', color: 'teal' });
      }

      setDirtySections(new Set());
      closeEdit();
      loadTournaments();
    } catch (err) {
      notifications.show({ title: 'Error', message: err instanceof Error ? err.message : 'Save failed.', color: 'red' });
    } finally {
      setEditSaving(false);
    }
  };

  const handleCreateTournamentOpen = () => {
    setCreateForm({ id: '', name: '', status: 'UPCOMING', sort_order: tournaments.length });
    setCreateErrors({});
    openCreate();
  };

  const handleCreateTournamentSave = async () => {
    const errors: Record<string, string> = {};
    if (!createForm.id.trim()) errors.id = 'ID is required';
    if (!createForm.name.trim()) errors.name = 'Name is required';
    if (setCreateErrors(errors), Object.keys(errors).length > 0) return;

    setCreateSaving(true);
    try {
      const res = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Create failed');
      }
      notifications.show({ title: 'Created', message: `Tournament "${createForm.name}" created.`, color: 'teal' });
      closeCreate();
      loadTournaments();
    } catch (err) {
      notifications.show({ title: 'Error', message: err instanceof Error ? err.message : 'Could not create.', color: 'red' });
    } finally {
      setCreateSaving(false);
    }
  };

  const handleDeleteTournament = async (id: string) => {
    if (!confirm(`Delete tournament "${id}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/tournaments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      notifications.show({ title: 'Deleted', message: `Tournament ${id} deleted.`, color: 'orange' });
      loadTournaments();
    } catch {
      notifications.show({ title: 'Error', message: 'Could not delete tournament.', color: 'red' });
    }
  };

  // ── Registration actions ───────────────────────────────────────────────────

  const handleEditRegOpen = (row: RegistrationRow) => {
    setEditReg({ ...row });
    openEditReg();
  };

  const handleEditRegSave = async () => {
    if (!editReg) return;
    setEditRegSaving(true);
    try {
      const res = await fetch(`/api/admin/registrations/${editReg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editReg.status, notes: editReg.notes }),
      });
      if (!res.ok) throw new Error('Update failed');
      notifications.show({ title: 'Saved', message: 'Registration updated.', color: 'teal' });
      closeEditReg();
      loadRegistrations(filterTournament);
    } catch {
      notifications.show({ title: 'Error', message: 'Could not save.', color: 'red' });
    } finally {
      setEditRegSaving(false);
    }
  };

  const handleDeleteReg = async (id: string) => {
    if (!confirm('Delete this registration? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      notifications.show({ title: 'Deleted', message: 'Registration deleted.', color: 'orange' });
      loadRegistrations(filterTournament);
    } catch {
      notifications.show({ title: 'Error', message: 'Could not delete.', color: 'red' });
    }
  };

  // ── Smart field renderer ───────────────────────────────────────────────────

  const renderField = (
    key: string,
    value: unknown,
    subKey: 'tournament_schedule' | 'tournament_venues' | 'tournament_prizes' | 'tournament_registration_info',
    section: string,
  ) => {
    const label = fieldLabel(key);
    const strVal = String(value ?? '');
    const commonProps = {
      key,
      label,
      classNames: { label: styles.inputLabel },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSubField(subKey, key, e.currentTarget.value, section),
    };

    if (DATE_FIELDS.has(key)) {
      return <TextInput {...commonProps} type="datetime-local" value={strVal} />;
    }
    if (DATE_ONLY_FIELDS.has(key)) {
      return <TextInput {...commonProps} type="date" value={strVal} />;
    }
    if (TIME_FIELDS.has(key)) {
      return <TextInput {...commonProps} type="time" value={strVal} />;
    }
    if (URL_FIELDS.has(key)) {
      return <TextInput {...commonProps} type="url" value={strVal} placeholder="https://" />;
    }
    if (LOGO_FIELDS.has(key)) {
      return (
        <Stack key={key} gap={6}>
          <Select
            label={label}
            data={LOGO_OPTIONS}
            value={strVal || null}
            onChange={(v) => setSubField(subKey, key, v ?? '', section)}
            classNames={{ label: styles.inputLabel }}
            clearable
            placeholder="Select tournament logo"
          />
          {strVal && (
            <Box className={styles.logoPreviewBox}>
              <img src={strVal} alt="Logo preview" className={styles.logoPreviewImg} />
            </Box>
          )}
        </Stack>
      );
    }
    return <TextInput {...commonProps} value={strVal} />;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const regInfo = editTournament?.tournament_registration_info as Record<string, unknown> | null | undefined;

  return (
    <Box className={styles.page}>
      {/* Header */}
      <Box className={styles.header}>
        <Container size="xl">
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <span className={styles.headerTitle}>ADMIN DASHBOARD</span>
              <span className={styles.headerSub}>NextGen Pickleball Series</span>
            </Stack>
            <Button
              variant="subtle"
              leftSection={<LogOut size={16} />}
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Group>
        </Container>
      </Box>

      {/* Body */}
      <Container size="xl" py="xl">
        <Tabs value={activeTab} onChange={setActiveTab} classNames={{ tab: styles.tab, list: styles.tabList }}>
          <Tabs.List mb="xl">
            <Tabs.Tab value="tournaments" leftSection={<Trophy size={16} />}>
              Tournaments
            </Tabs.Tab>
            <Tabs.Tab value="registrations" leftSection={<Users size={16} />}>
              Registrations
            </Tabs.Tab>
          </Tabs.List>

          {/* ── Tournaments tab ── */}
          <Tabs.Panel value="tournaments">
            <Group justify="space-between" mb="md">
              <Button
                leftSection={<Plus size={15} />}
                onClick={handleCreateTournamentOpen}
                className={styles.saveButton}
                size="sm"
              >
                New Tournament
              </Button>
              <ActionIcon variant="subtle" color="gray" onClick={loadTournaments} title="Refresh">
                <RefreshCw size={16} />
              </ActionIcon>
            </Group>
            <Box pos="relative">
              <LoadingOverlay visible={tournamentsLoading} />
              <DataTable
                withTableBorder
                borderRadius="sm"
                records={tournaments}
                idAccessor="id"
                classNames={{ table: styles.dataTable }}
                columns={[
                  { accessor: 'id', title: 'ID', width: 180 },
                  { accessor: 'name', title: 'Name' },
                  {
                    accessor: 'status',
                    title: 'Status',
                    width: 120,
                    render: (row) => <StatusBadge value={row.status} />,
                  },
                  { accessor: 'sort_order', title: 'Order', width: 70, textAlign: 'center' },
                  {
                    accessor: 'actions',
                    title: '',
                    width: 80,
                    render: (row) => (
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon size="sm" variant="subtle" color="yellow" onClick={() => handleEditTournamentOpen(row)}>
                          <Edit size={14} />
                        </ActionIcon>
                        <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteTournament(row.id)}>
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Group>
                    ),
                  },
                ]}
              />
            </Box>
          </Tabs.Panel>

          {/* ── Registrations tab ── */}
          <Tabs.Panel value="registrations">
            <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
              <Select
                placeholder="Filter by tournament"
                clearable
                data={tournaments.map((t) => ({ value: t.id, label: t.name }))}
                value={filterTournament}
                onChange={setFilterTournament}
                classNames={{ input: styles.filterSelect }}
                w={280}
              />
              <Group gap="sm">
                <Badge variant="outline" color="gray" size="lg">
                  {registrations.length} records
                </Badge>
                <ActionIcon variant="subtle" color="gray" onClick={() => loadRegistrations(filterTournament)} title="Refresh">
                  <RefreshCw size={16} />
                </ActionIcon>
              </Group>
            </Group>
            <Box pos="relative">
              <LoadingOverlay visible={regsLoading} />
              <DataTable
                withTableBorder
                borderRadius="sm"
                records={registrations}
                idAccessor="id"
                classNames={{ table: styles.dataTable }}
                columns={[
                  {
                    accessor: 'created_at',
                    title: 'Date',
                    width: 120,
                    render: (row) => new Date(row.created_at).toLocaleDateString('vi-VN'),
                  },
                  { accessor: 'full_name', title: 'Name' },
                  { accessor: 'phone', title: 'Phone', width: 130 },
                  { accessor: 'email', title: 'Email', width: 200 },
                  { accessor: 'gender', title: 'Gender', width: 80, render: (row) => row.gender === 'male' ? 'Nam' : 'Nữ' },
                  {
                    accessor: 'category',
                    title: 'Categories',
                    render: (row) => (
                      <Group gap={4} wrap="wrap">
                        {row.category.map((c) => (
                          <Badge key={c} size="xs" variant="dot" color="neonLime">{c}</Badge>
                        ))}
                      </Group>
                    ),
                  },
                  {
                    accessor: 'status',
                    title: 'Status',
                    width: 110,
                    render: (row) => <StatusBadge value={row.status} />,
                  },
                  {
                    accessor: 'actions',
                    title: '',
                    width: 80,
                    render: (row) => (
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon size="sm" variant="subtle" color="yellow" onClick={() => handleEditRegOpen(row)}>
                          <Edit size={14} />
                        </ActionIcon>
                        <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteReg(row.id)}>
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Group>
                    ),
                  },
                ]}
              />
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Container>

      {/* ── Edit Tournament Modal ── */}
      <Modal
        opened={editOpened}
        onClose={handleCloseEdit}
        title={
          <Group gap={10} align="center">
            <span className={styles.modalTitle}>
              {editTournament?.name ?? 'Edit Tournament'}
            </span>
            {dirtySections.size > 0 && (
              <Badge size="sm" color="yellow" variant="filled">
                {dirtySections.size} unsaved
              </Badge>
            )}
          </Group>
        }
        size="xl"
        classNames={{ content: styles.modalContent, header: styles.modalHeader }}
      >
        {editTournament && (
          <Stack gap={0}>
            <Tabs
              value={editModalTab}
              onChange={setEditModalTab}
              classNames={{ tab: styles.editModalTab, list: styles.editModalTabList }}
            >
              <Tabs.List mb="md">
                <Tabs.Tab value="core" leftSection={<Trophy size={13} />}>
                  Core
                  {(dirtySections.has('core')) && <span className={styles.tabDot} />}
                </Tabs.Tab>
                <Tabs.Tab value="schedule" leftSection={<Calendar size={13} />}>
                  Schedule
                  {dirtySections.has('schedule') && <span className={styles.tabDot} />}
                </Tabs.Tab>
                <Tabs.Tab value="venue" leftSection={<MapPin size={13} />}>
                  Venue
                  {dirtySections.has('venue') && <span className={styles.tabDot} />}
                </Tabs.Tab>
                <Tabs.Tab value="prizes" leftSection={<Award size={13} />}>
                  Prizes
                  {dirtySections.has('prizes') && <span className={styles.tabDot} />}
                </Tabs.Tab>
                <Tabs.Tab value="registration" leftSection={<ClipboardList size={13} />}>
                  Registration
                  {dirtySections.has('registration') && <span className={styles.tabDot} />}
                </Tabs.Tab>
              </Tabs.List>

              {/* Core tab */}
              <Tabs.Panel value="core">
                <ScrollArea h={380} offsetScrollbars>
                  <Stack gap="sm" px={2} pb={8}>
                    <SectionTag label="Identity" dirty={dirtySections.has('core')} />
                    <TextInput
                      label="Tournament ID"
                      value={editTournament.id}
                      disabled
                      classNames={{ label: styles.inputLabel }}
                      description="Immutable identifier"
                    />
                    <TextInput
                      label="Name"
                      value={editTournament.name}
                      onChange={(e) => setTournamentField('name', e.currentTarget.value, 'core')}
                      classNames={{ label: styles.inputLabel }}
                    />
                    <Group grow>
                      <Select
                        label="Status"
                        data={[
                          { value: 'UPCOMING', label: 'Upcoming' },
                          { value: 'ONGOING', label: 'Ongoing' },
                          { value: 'COMPLETED', label: 'Completed' },
                        ]}
                        value={editTournament.status}
                        onChange={(v) => setTournamentField('status', v ?? 'UPCOMING', 'core')}
                        classNames={{ label: styles.inputLabel }}
                      />
                      <NumberInput
                        label="Sort Order"
                        description="Lower = appears first"
                        value={editTournament.sort_order}
                        onChange={(v) => setTournamentField('sort_order', Number(v), 'core')}
                        min={0}
                        classNames={{ label: styles.inputLabel }}
                      />
                    </Group>
                  </Stack>
                </ScrollArea>
              </Tabs.Panel>

              {/* Schedule tab */}
              <Tabs.Panel value="schedule">
                <ScrollArea h={380} offsetScrollbars>
                  <Stack gap="sm" px={2} pb={8}>
                    <SectionTag label="Tournament Dates & Times" dirty={dirtySections.has('schedule')} />
                    {editTournament.tournament_schedule ? (
                      <>
                        {/* Schedule status */}
                        <Select
                          label="Trạng thái lịch"
                          placeholder="Chọn trạng thái"
                          data={SCHEDULE_STATUS_OPTIONS}
                          value={editTournament.tournament_schedule.schedule_status ?? null}
                          onChange={(v) => setSubField('tournament_schedule', 'schedule_status', v ?? null, 'schedule')}
                          classNames={{ label: styles.inputLabel }}
                          clearable
                        />
                        {/* Date pickers — grouped side by side */}
                        <Group grow>
                          <TextInput
                            label="Start Date"
                            type="date"
                            value={String(editTournament.tournament_schedule.start_date ?? '')}
                            onChange={(e) => setScheduleDateField('start_date', e.currentTarget.value)}
                            classNames={{ label: styles.inputLabel }}
                          />
                          <TextInput
                            label="End Date"
                            type="date"
                            value={String(editTournament.tournament_schedule.end_date ?? '')}
                            onChange={(e) => setScheduleDateField('end_date', e.currentTarget.value)}
                            classNames={{ label: styles.inputLabel }}
                          />
                        </Group>
                        {/* Display date — auto-computed, read-only */}
                        <TextInput
                          label="Display Date"
                          value={String(editTournament.tournament_schedule.display_date ?? '')}
                          readOnly
                          description="Auto-computed from start / end dates"
                          classNames={{ label: styles.inputLabel }}
                        />
                        {/* Remaining schedule fields (times, etc.) */}
                        {Object.entries(editTournament.tournament_schedule)
                          .filter(([k]) => !['tournament_id', 'start_date', 'end_date', 'display_date', 'schedule_status'].includes(k))
                          .map(([key, value]) => renderField(key, value, 'tournament_schedule', 'schedule'))
                        }
                      </>
                    ) : (
                      <Text size="sm" c="dimmed">No schedule data available.</Text>
                    )}
                  </Stack>
                </ScrollArea>
              </Tabs.Panel>

              {/* Venue tab */}
              <Tabs.Panel value="venue">
                <ScrollArea h={380} offsetScrollbars>
                  <Stack gap="sm" px={2} pb={8}>
                    <SectionTag label="Venue Details" dirty={dirtySections.has('venue')} />
                    {editTournament.tournament_venues
                      ? Object.entries(editTournament.tournament_venues)
                          .filter(([k]) => k !== 'tournament_id')
                          .map(([key, value]) => renderField(key, value, 'tournament_venues', 'venue'))
                      : <Text size="sm" c="dimmed">No venue data available.</Text>
                    }
                  </Stack>
                </ScrollArea>
              </Tabs.Panel>

              {/* Prizes tab */}
              <Tabs.Panel value="prizes">
                <ScrollArea h={380} offsetScrollbars>
                  <Stack gap="sm" px={2} pb={8}>
                    <SectionTag label="Prize Pool" dirty={dirtySections.has('prizes')} />
                    {editTournament.tournament_prizes && (
                      <TextInput
                        label="Total Prize"
                        placeholder="e.g. 50.000.000 VNĐ"
                        value={String(editTournament.tournament_prizes.total_prize ?? '')}
                        onChange={(e) => setSubField('tournament_prizes', 'total_prize', e.currentTarget.value, 'prizes')}
                        classNames={{ label: styles.inputLabel }}
                      />
                    )}
                    <Divider
                      label={<span className={styles.dividerLabel}>Prize Tiers</span>}
                      labelPosition="left"
                      my={4}
                    />
                    <Group gap={6} mb={4} className={styles.prizeEntryHeader}>
                      <Box w={28} />
                      <Box w={24} />
                      <Text size="xs" c="dimmed" style={{ flex: 2 }}>Title</Text>
                      <Text size="xs" c="dimmed" style={{ flex: 1.5 }}>Amount</Text>
                      <Text size="xs" c="dimmed" style={{ flex: 1 }}>Bonus</Text>
                      <Box w={28} />
                    </Group>
                    <PrizeEntriesEditor
                      entries={prizeEntries}
                      onChange={(entries) => { setPrizeEntries(entries); markDirty('prizes'); }}
                    />
                  </Stack>
                </ScrollArea>
              </Tabs.Panel>

              {/* Registration tab */}
              <Tabs.Panel value="registration">
                <ScrollArea h={380} offsetScrollbars>
                  <Stack gap="sm" px={2} pb={8}>
                    <SectionTag label="Registration Settings" dirty={dirtySections.has('registration')} />
                    {regInfo && (
                      <>
                        <TextInput
                          label="Deadline"
                          type="datetime-local"
                          value={deadlinePicker}
                          onChange={(e) => {
                            const iso = e.currentTarget.value;
                            setDeadlinePicker(iso);
                            setEditTournament((prev) => {
                              if (!prev) return prev;
                              const ri = { ...(prev.tournament_registration_info as Record<string, unknown>) };
                              ri.deadline = formatDeadlineDisplay(iso);
                              ri.deadline_date_time = formatDeadlineDatetime(iso);
                              return { ...prev, tournament_registration_info: ri };
                            });
                            markDirty('registration');
                          }}
                          classNames={{ label: styles.inputLabel }}
                        />
                        <Group grow>
                          <TextInput
                            label="Deadline (short display)"
                            value={String(regInfo.deadline ?? '')}
                            readOnly
                            description="Auto-computed · e.g. 10/03/2026"
                            classNames={{ label: styles.inputLabel }}
                          />
                          <TextInput
                            label="Deadline (full display)"
                            value={String(regInfo.deadline_date_time ?? '')}
                            readOnly
                            description="Auto-computed · e.g. 23:59 · 10.03.2026"
                            classNames={{ label: styles.inputLabel }}
                          />
                        </Group>
                        <NumberInput
                          label="Total Slots"
                          description="Maximum number of persons who can participate"
                          value={Number(regInfo.total_slots ?? 0)}
                          onChange={(v) => setSubField('tournament_registration_info', 'total_slots', Number(v), 'registration')}
                          min={0}
                          classNames={{ label: styles.inputLabel }}
                        />
                        <Divider
                          label={<span className={styles.dividerLabel}>Category Slots</span>}
                          labelPosition="left"
                          my={4}
                        />
                        <Text size="xs" c="dimmed">
                          Set slot capacity per category (1 slot = 1 person). Total allocated should not exceed the slot cap above.
                        </Text>
                        <CategorySlotsEditor
                          slots={categorySlots}
                          totalSlots={Number(regInfo.total_slots ?? 0)}
                          availableCategories={Array.isArray(regInfo.available_categories) ? (regInfo.available_categories as string[]) : []}
                          onChange={(slots) => { setCategorySlots(slots); markDirty('registration'); }}
                        />
                        <TextInput
                          label="Registration Link"
                          type="url"
                          placeholder="https://"
                          value={String(regInfo.registration_link ?? '')}
                          onChange={(e) => setSubField('tournament_registration_info', 'registration_link', e.currentTarget.value, 'registration')}
                          classNames={{ label: styles.inputLabel }}
                        />
                        <TextInput
                          label="CTA Title"
                          value={String(regInfo.cta_title ?? '')}
                          onChange={(e) => setSubField('tournament_registration_info', 'cta_title', e.currentTarget.value, 'registration')}
                          classNames={{ label: styles.inputLabel }}
                        />
                        <Textarea
                          label="CTA Description"
                          value={String(regInfo.cta_description ?? '')}
                          onChange={(e) => setSubField('tournament_registration_info', 'cta_description', e.currentTarget.value, 'registration')}
                          minRows={2}
                          classNames={{ label: styles.inputLabel }}
                        />
                        <MultiSelect
                          label="Available Categories"
                          description="Which categories players can register for"
                          data={CATEGORY_OPTIONS}
                          value={Array.isArray(regInfo.available_categories) ? (regInfo.available_categories as string[]) : []}
                          onChange={(v) => setSubField('tournament_registration_info', 'available_categories', v, 'registration')}
                          classNames={{ label: styles.inputLabel }}
                        />
                        <Textarea
                          label="Features"
                          description="One feature per line — shown as bullet points below the register button"
                          placeholder={"Thi đấu 1vs1 & 2vs2\nTrọng tài chuyên nghiệp\nGiải thưởng hấp dẫn"}
                          value={(Array.isArray(regInfo.features) ? (regInfo.features as string[]) : []).join('\n')}
                          onChange={(e) => {
                            const lines = e.currentTarget.value.split('\n');
                            setSubField('tournament_registration_info', 'features', lines, 'registration');
                          }}
                          minRows={3}
                          classNames={{ label: styles.inputLabel }}
                        />
                        <Group grow>
                          <Select
                            label="Doubles Partner Mode"
                            data={[
                              { value: 'fixed', label: 'Fixed partner' },
                              { value: 'random', label: 'Random draw' },
                            ]}
                            value={String(regInfo.doubles_partner_mode ?? 'fixed')}
                            onChange={(v) => setSubField('tournament_registration_info', 'doubles_partner_mode', v, 'registration')}
                            classNames={{ label: styles.inputLabel }}
                          />
                          <Select
                            label="Entry Fee Mode"
                            data={[
                              { value: 'per_category', label: 'Per category' },
                              { value: 'flat', label: 'Flat fee' },
                            ]}
                            value={String(regInfo.entry_fee_mode ?? 'per_category')}
                            onChange={(v) => setSubField('tournament_registration_info', 'entry_fee_mode', v, 'registration')}
                            classNames={{ label: styles.inputLabel }}
                          />
                        </Group>
                        {String(regInfo.entry_fee_mode ?? 'per_category') === 'flat' && (
                          <TextInput
                            label="Entry Fee (flat)"
                            placeholder="e.g. 200.000 VNĐ"
                            value={String(regInfo.entry_fee ?? '')}
                            onChange={(e) => setSubField('tournament_registration_info', 'entry_fee', e.currentTarget.value, 'registration')}
                            classNames={{ label: styles.inputLabel }}
                          />
                        )}
                        {String(regInfo.entry_fee_mode ?? 'per_category') === 'per_category' && (
                          <>
                            <Divider
                              label={<span className={styles.dividerLabel}>Category Fees</span>}
                              labelPosition="left"
                              my={4}
                            />
                            <KVEditor
                              pairs={categoryFees}
                              onChange={(pairs) => {
                                setCategoryFees(pairs);
                                setCategoryFeesJson(JSON.stringify(
                                  Object.fromEntries(pairs.filter((p) => p.key).map((p) => [p.key, p.value])),
                                  null, 2,
                                ));
                                markDirty('registration');
                              }}
                            />
                          </>
                        )}
                        <Divider
                          label={<span className={styles.dividerLabel}>Advanced</span>}
                          labelPosition="left"
                          my={4}
                        />
                        <Textarea
                          label="Category Fees (raw JSON)"
                          description="Direct JSON edit — overrides the structured editor above on save."
                          placeholder='{"singles_male":"200.000 VNĐ"}'
                          minRows={3}
                          value={categoryFeesJson}
                          error={categoryFeesJsonError || undefined}
                          onChange={(e) => {
                            const raw = e.currentTarget.value;
                            setCategoryFeesJson(raw);
                            setSubField('tournament_registration_info', '_raw_json_edit', raw, 'registration');
                            if (!raw) {
                              setCategoryFees([]);
                              setCategoryFeesJsonError('');
                              return;
                            }
                            try {
                              const parsed = JSON.parse(raw) as Record<string, string>;
                              setCategoryFees(Object.entries(parsed).map(([key, value]) => ({ key, value })));
                              setCategoryFeesJsonError('');
                            } catch {
                              setCategoryFeesJsonError('Invalid JSON');
                            }
                          }}
                          classNames={{ label: styles.inputLabel }}
                          rightSection={
                            categoryFeesJsonError
                              ? <Tooltip label={categoryFeesJsonError}><AlertCircle size={14} color="#ff6b6b" /></Tooltip>
                              : undefined
                          }
                        />
                      </>
                    )}
                  </Stack>
                </ScrollArea>
              </Tabs.Panel>
            </Tabs>

            <Divider my="sm" />
            <Group justify="space-between" align="center">
              <Text size="xs" c="dimmed">
                {dirtySections.size > 0
                  ? `Unsaved changes in: ${[...dirtySections].join(', ')}`
                  : 'No unsaved changes'}
              </Text>
              <Group gap="sm">
                <Button variant="subtle" leftSection={<X size={16} />} onClick={handleCloseEdit} className={styles.cancelButton}>
                  Discard
                </Button>
                <Button
                  leftSection={<Save size={16} />}
                  loading={editSaving}
                  onClick={handleEditTournamentSave}
                  className={styles.saveButton}
                  disabled={dirtySections.size === 0 && !editSaving}
                >
                  Save All Changes
                </Button>
              </Group>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* ── Create Tournament Modal ── */}
      <Modal
        opened={createOpened}
        onClose={closeCreate}
        title={<span className={styles.modalTitle}>New Tournament</span>}
        size="md"
        classNames={{ content: styles.modalContent, header: styles.modalHeader }}
      >
        <Stack gap="sm">
          <TextInput
            label="Tournament ID"
            placeholder="e.g. spring-2026"
            description="Unique slug — cannot be changed later"
            value={createForm.id}
            onChange={(e) => setCreateForm({ ...createForm, id: e.currentTarget.value.toLowerCase().replace(/\s+/g, '-') })}
            error={createErrors.id}
            classNames={{ label: styles.inputLabel }}
          />
          <TextInput
            label="Name"
            placeholder="e.g. Spring Series 2026"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.currentTarget.value })}
            error={createErrors.name}
            classNames={{ label: styles.inputLabel }}
          />
          <Group grow>
            <Select
              label="Status"
              data={[
                { value: 'UPCOMING', label: 'Upcoming' },
                { value: 'ONGOING', label: 'Ongoing' },
                { value: 'COMPLETED', label: 'Completed' },
              ]}
              value={createForm.status}
              onChange={(v) => setCreateForm({ ...createForm, status: v ?? 'UPCOMING' })}
              classNames={{ label: styles.inputLabel }}
            />
            <NumberInput
              label="Sort Order"
              description="Lower = appears first"
              value={createForm.sort_order}
              onChange={(v) => setCreateForm({ ...createForm, sort_order: Number(v) })}
              min={0}
              classNames={{ label: styles.inputLabel }}
            />
          </Group>
          <Group justify="flex-end" pt="sm">
            <Button variant="subtle" leftSection={<X size={16} />} onClick={closeCreate} className={styles.cancelButton}>
              Cancel
            </Button>
            <Button leftSection={<Save size={16} />} loading={createSaving} onClick={handleCreateTournamentSave} className={styles.saveButton}>
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ── Edit Registration Modal ── */}
      <Modal
        opened={editRegOpened}
        onClose={closeEditReg}
        title={<span className={styles.modalTitle}>Edit Registration</span>}
        size="md"
        classNames={{ content: styles.modalContent, header: styles.modalHeader }}
      >
        {editReg && (
          <Stack gap="md">
            <Group grow>
              <TextInput label="Name" value={editReg.full_name} disabled classNames={{ label: styles.inputLabel }} />
              <TextInput label="Phone" value={editReg.phone} disabled classNames={{ label: styles.inputLabel }} />
            </Group>
            <TextInput label="Email" value={editReg.email} disabled classNames={{ label: styles.inputLabel }} />
            <Select
              label="Status"
              data={['pending', 'confirmed', 'cancelled']}
              value={editReg.status}
              onChange={(v) => setEditReg({ ...editReg, status: v ?? 'pending' })}
              classNames={{ label: styles.inputLabel }}
            />
            <Textarea
              label="Notes"
              value={editReg.notes ?? ''}
              onChange={(e) => setEditReg({ ...editReg, notes: e.currentTarget.value })}
              minRows={2}
              classNames={{ label: styles.inputLabel }}
            />
            <Group justify="flex-end" pt="sm">
              <Button variant="subtle" leftSection={<X size={16} />} onClick={closeEditReg} className={styles.cancelButton}>
                Cancel
              </Button>
              <Button leftSection={<Save size={16} />} loading={editRegSaving} onClick={handleEditRegSave} className={styles.saveButton}>
                Save
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
}
