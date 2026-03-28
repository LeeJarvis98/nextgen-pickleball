'use client';

import { useState, useEffect } from 'react';
import { Modal, Stack, Group, Text, Textarea, Button, Loader, Badge } from '@mantine/core';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import styles from './CancellationModal.module.css';

export interface CancellationTier {
  days_before: number | null; // null = registration day, 0 = tournament day
  label: string;
  refund: number;
}

export interface CancellationPolicy {
  tiers: CancellationTier[];
}

const DEFAULT_POLICY: CancellationPolicy = {
  tiers: [
    { days_before: null, label: 'Ngày đăng ký', refund: 100 },
    { days_before: 7,    label: '7 ngày trước giải',  refund: 70 },
    { days_before: 4,    label: '4 ngày trước giải',  refund: 40 },
    { days_before: 1,    label: '1 ngày trước giải',  refund: 0 },
    { days_before: 0,    label: 'Ngày thi đấu',  refund: 0 },
  ],
};

/** Returns the current refund % given today and the tournament start date. */
export function calcRefund(tiers: CancellationTier[], tournamentStartDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(tournamentStartDate);
  start.setHours(0, 0, 0, 0);
  const daysUntil = Math.round((start.getTime() - today.getTime()) / 86_400_000);

  // Walk from the last configurable threshold backwards
  const thresholds = tiers
    .filter((t) => t.days_before !== null && t.days_before !== 0)
    .sort((a, b) => (b.days_before as number) - (a.days_before as number));

  for (const tier of thresholds) {
    if (daysUntil >= (tier.days_before as number)) return tier.refund;
  }
  // Below the lowest day threshold → last tier (0%)
  const last = tiers[tiers.length - 1];
  return last?.refund ?? 0;
}

/** Returns the active tier index (0-based) for the timeline highlight.
 *  The active node corresponds to the tier whose refund % applies right now. */
function activeTierIndex(tiers: CancellationTier[], tournamentStartDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(tournamentStartDate);
  start.setHours(0, 0, 0, 0);
  const daysUntil = Math.round((start.getTime() - today.getTime()) / 86_400_000);

  const thresholds = tiers
    .map((t, i) => ({ ...t, i }))
    .filter((t) => t.days_before !== null && t.days_before !== 0)
    .sort((a, b) => (b.days_before as number) - (a.days_before as number));

  // Return the first threshold we're at or beyond (sorted desc → highest first)
  for (const tier of thresholds) {
    if (daysUntil >= (tier.days_before as number)) return tier.i;
  }
  return tiers.length - 1; // daysUntil < 1 → at the final node
}

/** Returns 0–1 representing how far we've progressed through the segment
 *  from node[fromIdx] toward node[fromIdx+1]. */
function getSegmentProgress(
  tiers: CancellationTier[],
  tournamentStartDate: string,
  fromIdx: number,
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(tournamentStartDate);
  start.setHours(0, 0, 0, 0);
  const daysUntil = Math.round((start.getTime() - today.getTime()) / 86_400_000);

  const fromDays = tiers[fromIdx]?.days_before;
  const toDays = tiers[fromIdx + 1]?.days_before ?? null;
  if (fromDays === null || toDays === null) return 0;

  const totalDays = fromDays - toDays; // e.g. 7 − 4 = 3
  if (totalDays === 0) return 1;

  const elapsed = fromDays - daysUntil; // days spent inside this segment
  return Math.max(0, Math.min(1, elapsed / totalDays));
}

function refundColor(refund: number): string {
  if (refund >= 70) return '#b8ff00';
  if (refund >= 40) return '#f59f00';
  return '#ff6b6b';
}

interface CancellationModalProps {
  opened: boolean;
  onClose: () => void;
  mode: 'view' | 'cancel';
  tournamentStartDate: string | null;
  registrationId: string;
  query: string;
  onCancelled: () => void;
}

export default function CancellationModal({
  opened, onClose, mode, tournamentStartDate, registrationId, query, onCancelled,
}: CancellationModalProps) {
  const [policy, setPolicy] = useState<CancellationPolicy>(DEFAULT_POLICY);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!opened) { setReason(''); setSubmitError(''); return; }
    const loadPolicy = async () => {
      setPolicyLoading(true);
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.cancellation_policy) {
            const parsed = JSON.parse(data.cancellation_policy) as CancellationPolicy;
            if (parsed?.tiers?.length) setPolicy(parsed);
          }
        }
      } catch { /* use default */ } finally {
        setPolicyLoading(false);
      }
    };
    loadPolicy();
  }, [opened]);

  const tiers = policy.tiers;
  const currentRefund = tournamentStartDate ? calcRefund(tiers, tournamentStartDate) : tiers[0]?.refund ?? 100;
  const activeIdx = tournamentStartDate ? activeTierIndex(tiers, tournamentStartDate) : 0;

  const daysUntil = tournamentStartDate
    ? (() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const start = new Date(tournamentStartDate); start.setHours(0, 0, 0, 0);
        return Math.round((start.getTime() - today.getTime()) / 86_400_000);
      })()
    : null;
  const daysLabel =
    daysUntil === null ? null
    : daysUntil > 1   ? `Còn ${daysUntil} ngày`
    : daysUntil === 1 ? 'Còn 1 ngày'
    : daysUntil === 0 ? 'Hôm nay'
    : 'Đã qua';

  const handleConfirmCancel = async () => {
    if (!reason.trim()) { setSubmitError('Vui lòng nhập lý do hủy đăng ký.'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/status/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: registrationId, q: query, reason: reason.trim(), refund_percentage: currentRefund }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Không thể hủy đăng ký');
      onCancelled();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Lỗi không xác định. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <span className={styles.modalTitle}>
          {mode === 'view' ? 'CHÍNH SÁCH HỦY ĐĂNG KÝ' : 'HỦY ĐĂNG KÝ'}
        </span>
      }
      size="lg"
      classNames={{ content: styles.modalContent, header: styles.modalHeader, body: styles.modalBody }}
    >
      {policyLoading ? (
        <Group justify="center" py={40}>
          <Loader size="sm" color="#b8ff00" />
        </Group>
      ) : (
        <Stack gap={24}>
          {/* Refund summary */}
          <div className={styles.refundBanner} style={{ borderColor: refundColor(currentRefund) + '55' }}>
            <Text className={styles.refundLabel}>Mức hoàn tiền hiện tại của bạn</Text>
            <span className={styles.refundValue} style={{ color: refundColor(currentRefund) }}>
              {currentRefund}%
            </span>
            {!tournamentStartDate && (
              <Text size="xs" c="dimmed" mt={4}>Không có thông tin ngày thi đấu</Text>
            )}
          </div>

          {/* Horizontal timeline */}
          <div className={styles.timelineWrapper}>
            {tiers.map((tier, i) => {
              const isActive = i === activeIdx;
              const isPast = i < activeIdx;

              // How much of the connector after this node should be filled (0–1)
              const connectorFill =
                i < activeIdx
                  ? 1
                  : i === activeIdx && tournamentStartDate
                  ? getSegmentProgress(tiers, tournamentStartDate, i)
                  : 0;

              const connectorBg =
                connectorFill >= 1
                  ? '#b8ff00'
                  : connectorFill > 0
                  ? `linear-gradient(to right, #b8ff00 ${connectorFill * 100}%, #2a2a2a ${connectorFill * 100}%)`
                  : '#2a2a2a';

              return (
                <div key={i} className={styles.timelineSegment} style={{ flex: i < tiers.length - 1 ? 1 : 0 }}>
                  <div className={styles.nodeCol}>
                    <div
                      className={styles.node}
                      style={{
                        background: isActive ? refundColor(tier.refund) : isPast ? '#2a2a2a' : '#1a1a1a',
                        borderColor: isActive ? refundColor(tier.refund) : isPast ? '#3a3a3a' : '#252525',
                        boxShadow: isActive ? `0 0 14px ${refundColor(tier.refund)}99` : 'none',
                      }}
                    >
                      <span className={styles.nodeLetter}>{String.fromCharCode(65 + i)}</span>
                    </div>
                    {isActive && daysLabel && (
                      <div
                        className={styles.daysChip}
                        style={{ color: refundColor(tier.refund), borderColor: refundColor(tier.refund) + '55' }}
                      >
                        {daysLabel}
                      </div>
                    )}
                  </div>
                  <Text className={styles.nodeLabel} c={isActive ? '#ffffff' : '#4a4a4a'}>
                    {tier.label}
                  </Text>
                  <Badge
                    size="xs"
                    variant="filled"
                    style={{
                      background: isActive ? refundColor(tier.refund) + '22' : 'transparent',
                      color: isActive ? refundColor(tier.refund) : '#333',
                      border: `1px solid ${isActive ? refundColor(tier.refund) + '66' : '#222'}`,
                    }}
                  >
                    {tier.refund}%
                  </Badge>
                  {i < tiers.length - 1 && (
                    <div className={styles.connector}>
                      <div className={styles.connectorLine} style={{ background: connectorBg }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Text size="xs" c="dimmed">
            Mức hoàn tiền được tính dựa trên thời điểm hủy so với ngày thi đấu. Tiền sẽ được hoàn trong vòng <strong style={{ color: '#e0e0e0' }}>7–14 ngày làm việc</strong>.
          </Text>

          {/* Cancel mode extras */}
          {mode === 'cancel' && (
            <Stack gap={12}>
              <div className={styles.divider} />
              <Textarea
                label="Lý do hủy đăng ký"
                placeholder="Nhập lý do hủy đăng ký của bạn..."
                required
                minRows={3}
                value={reason}
                onChange={(e) => { setReason(e.currentTarget.value); setSubmitError(''); }}
                classNames={{ label: styles.textareaLabel, input: styles.textareaInput }}
              />
              {submitError && (
                <Group gap={6} align="center">
                  <AlertTriangle size={14} color="#ff6b6b" />
                  <Text size="sm" c="#ff6b6b">{submitError}</Text>
                </Group>
              )}
              <Text size="xs" c="dimmed">
                Bạn sẽ được hoàn <strong style={{ color: refundColor(currentRefund) }}>{currentRefund}%</strong> phí đăng ký.
                Hành động này <strong style={{ color: '#ff6b6b' }}>không thể hoàn tác</strong>.
              </Text>
              <Group justify="flex-end" gap={8}>
                <Button variant="subtle" onClick={onClose} disabled={submitting} className={styles.cancelBtn}>
                  Quay lại
                </Button>
                <Button
                  leftSection={submitting ? <Loader size={14} color="#0e0e0e" /> : <CheckCircle size={14} />}
                  onClick={handleConfirmCancel}
                  disabled={submitting || !reason.trim()}
                  className={styles.confirmBtn}
                >
                  {submitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
                </Button>
              </Group>
            </Stack>
          )}
        </Stack>
      )}
    </Modal>
  );
}