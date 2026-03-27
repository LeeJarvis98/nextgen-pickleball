'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Button, Container, Group, Stack, Tabs, Badge,
  TextInput, Textarea, Select, NumberInput, ActionIcon,
  Modal, LoadingOverlay, Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { DataTable } from 'mantine-datatable';
import {
  LogOut, Trophy, Users, RefreshCw, Edit, Trash2, Save, X,
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
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editSaving, setEditSaving] = useState(false);

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

  // ── Tournament actions ─────────────────────────────────────────────────────

  const handleEditTournamentOpen = (row: TournamentRow) => {
    setEditTournament(JSON.parse(JSON.stringify(row)));
    openEdit();
  };

  const handleEditTournamentSave = async () => {
    if (!editTournament) return;
    setEditSaving(true);
    try {
      const { id, name, status, sort_order, tournament_schedule, tournament_venues, tournament_prizes, tournament_registration_info } = editTournament;
      const updates: Array<{ table: string; data: Record<string, unknown> }> = [
        { table: 'tournaments', data: { name, status, sort_order } },
      ];
      if (tournament_schedule) updates.push({ table: 'tournament_schedule', data: tournament_schedule });
      if (tournament_venues) updates.push({ table: 'tournament_venues', data: tournament_venues });
      if (tournament_prizes) updates.push({ table: 'tournament_prizes', data: tournament_prizes });
      if (tournament_registration_info) updates.push({ table: 'tournament_registration_info', data: tournament_registration_info });

      await Promise.all(
        updates.map((u) =>
          fetch(`/api/admin/tournaments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(u),
          }).then((r) => { if (!r.ok) throw new Error(`Failed to update ${u.table}`); }),
        ),
      );
      notifications.show({ title: 'Saved', message: 'Tournament updated.', color: 'teal' });
      closeEdit();
      loadTournaments();
    } catch (err) {
      notifications.show({ title: 'Error', message: err instanceof Error ? err.message : 'Save failed.', color: 'red' });
    } finally {
      setEditSaving(false);
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

  // ── Render ─────────────────────────────────────────────────────────────────

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
            <Group justify="flex-end" mb="md">
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
        onClose={closeEdit}
        title={<span className={styles.modalTitle}>Edit Tournament</span>}
        size="xl"
        classNames={{ content: styles.modalContent, header: styles.modalHeader }}
      >
        {editTournament && (
          <Stack gap="md">
            <Title order={5} className={styles.sectionHeading}>Core</Title>
            <Group grow>
              <TextInput label="ID" value={editTournament.id} disabled classNames={{ label: styles.inputLabel }} />
              <TextInput
                label="Name"
                value={editTournament.name}
                onChange={(e) => setEditTournament({ ...editTournament, name: e.currentTarget.value })}
                classNames={{ label: styles.inputLabel }}
              />
            </Group>
            <Group grow>
              <Select
                label="Status"
                data={['UPCOMING', 'ONGOING', 'COMPLETED']}
                value={editTournament.status}
                onChange={(v) => setEditTournament({ ...editTournament, status: v ?? 'UPCOMING' })}
                classNames={{ label: styles.inputLabel }}
              />
              <NumberInput
                label="Sort Order"
                value={editTournament.sort_order}
                onChange={(v) => setEditTournament({ ...editTournament, sort_order: Number(v) })}
                classNames={{ label: styles.inputLabel }}
              />
            </Group>

            {editTournament.tournament_schedule && (
              <>
                <Title order={5} className={styles.sectionHeading}>Schedule</Title>
                {Object.entries(editTournament.tournament_schedule)
                  .filter(([k]) => k !== 'tournament_id')
                  .map(([key, value]) => (
                    <TextInput
                      key={key}
                      label={key.replace(/_/g, ' ')}
                      value={String(value ?? '')}
                      onChange={(e) =>
                        setEditTournament({
                          ...editTournament,
                          tournament_schedule: { ...editTournament.tournament_schedule!, [key]: e.currentTarget.value },
                        })
                      }
                      classNames={{ label: styles.inputLabel }}
                    />
                  ))}
              </>
            )}

            {editTournament.tournament_venues && (
              <>
                <Title order={5} className={styles.sectionHeading}>Venue</Title>
                {Object.entries(editTournament.tournament_venues)
                  .filter(([k]) => k !== 'tournament_id')
                  .map(([key, value]) => (
                    <TextInput
                      key={key}
                      label={key.replace(/_/g, ' ')}
                      value={String(value ?? '')}
                      onChange={(e) =>
                        setEditTournament({
                          ...editTournament,
                          tournament_venues: { ...editTournament.tournament_venues!, [key]: e.currentTarget.value },
                        })
                      }
                      classNames={{ label: styles.inputLabel }}
                    />
                  ))}
              </>
            )}

            {editTournament.tournament_prizes && (
              <>
                <Title order={5} className={styles.sectionHeading}>Prizes</Title>
                <TextInput
                  label="Total Prize"
                  value={String(editTournament.tournament_prizes.total_prize ?? '')}
                  onChange={(e) =>
                    setEditTournament({
                      ...editTournament,
                      tournament_prizes: { ...editTournament.tournament_prizes!, total_prize: e.currentTarget.value },
                    })
                  }
                  classNames={{ label: styles.inputLabel }}
                />
              </>
            )}

            {editTournament.tournament_registration_info && (
              <>
                <Title order={5} className={styles.sectionHeading}>Registration Info</Title>
                {(['deadline', 'deadline_date_time', 'registration_link', 'cta_title', 'cta_description'] as const).map((key) => (
                  <TextInput
                    key={key}
                    label={key.replace(/_/g, ' ')}
                    value={String((editTournament.tournament_registration_info as Record<string, unknown>)[key] ?? '')}
                    onChange={(e) =>
                      setEditTournament({
                        ...editTournament,
                        tournament_registration_info: { ...editTournament.tournament_registration_info!, [key]: e.currentTarget.value },
                      })
                    }
                    classNames={{ label: styles.inputLabel }}
                  />
                ))}
                <Group grow>
                  <Select
                    label="Entry Fee Mode"
                    data={['per_category', 'flat']}
                    value={String((editTournament.tournament_registration_info as Record<string, unknown>).entry_fee_mode ?? 'per_category')}
                    onChange={(v) =>
                      setEditTournament({
                        ...editTournament,
                        tournament_registration_info: { ...editTournament.tournament_registration_info!, entry_fee_mode: v },
                      })
                    }
                    classNames={{ label: styles.inputLabel }}
                  />
                  <TextInput
                    label="Entry Fee (flat)"
                    placeholder="e.g. 200.000 VNĐ"
                    value={String((editTournament.tournament_registration_info as Record<string, unknown>).entry_fee ?? '')}
                    onChange={(e) =>
                      setEditTournament({
                        ...editTournament,
                        tournament_registration_info: { ...editTournament.tournament_registration_info!, entry_fee: e.currentTarget.value },
                      })
                    }
                    classNames={{ label: styles.inputLabel }}
                  />
                </Group>
                <NumberInput
                  label="Total Slots"
                  value={Number((editTournament.tournament_registration_info as Record<string, unknown>).total_slots ?? 0)}
                  onChange={(v) =>
                    setEditTournament({
                      ...editTournament,
                      tournament_registration_info: { ...editTournament.tournament_registration_info!, total_slots: Number(v) },
                    })
                  }
                  classNames={{ label: styles.inputLabel }}
                />
                <Select
                  label="Doubles Partner Mode"
                  data={['fixed', 'random']}
                  value={String((editTournament.tournament_registration_info as Record<string, unknown>).doubles_partner_mode ?? 'fixed')}
                  onChange={(v) =>
                    setEditTournament({
                      ...editTournament,
                      tournament_registration_info: { ...editTournament.tournament_registration_info!, doubles_partner_mode: v },
                    })
                  }
                  classNames={{ label: styles.inputLabel }}
                />
                <Textarea
                  label="Category Fees (JSON)"
                  placeholder='{"singles_male":"200.000 VNĐ"}'
                  minRows={3}
                  value={
                    (editTournament.tournament_registration_info as Record<string, unknown>).category_fees
                      ? JSON.stringify((editTournament.tournament_registration_info as Record<string, unknown>).category_fees, null, 2)
                      : ''
                  }
                  onChange={(e) => {
                    try {
                      const parsed = e.currentTarget.value ? JSON.parse(e.currentTarget.value) : null;
                      setEditTournament({
                        ...editTournament,
                        tournament_registration_info: { ...editTournament.tournament_registration_info!, category_fees: parsed },
                      });
                    } catch {
                      // keep typing — don't update until valid JSON
                    }
                  }}
                  classNames={{ label: styles.inputLabel }}
                />
              </>
            )}

            <Group justify="flex-end" pt="sm">
              <Button variant="subtle" leftSection={<X size={16} />} onClick={closeEdit} className={styles.cancelButton}>
                Cancel
              </Button>
              <Button leftSection={<Save size={16} />} loading={editSaving} onClick={handleEditTournamentSave} className={styles.saveButton}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        )}
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
