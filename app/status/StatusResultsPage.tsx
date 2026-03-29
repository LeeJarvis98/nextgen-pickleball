"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container, Box, Stack, Group, Badge, Text, Loader, Button, TextInput, Accordion, Progress } from "@mantine/core";
import { ArrowLeft, AlertTriangle, CalendarDays, Clock, CheckCircle, XCircle, Users, ExternalLink, Search, ChevronRight, MapPin, Trophy, ShieldAlert, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./StatusResultsPage.module.css";

interface TournamentVenueMeta {
  logo_url: string | null;
  image_url: string | null;
  name: string;
  city: string;
  country: string;
  courts: number;
  court_type: string;
  location_url: string | null;
}

interface TournamentScheduleMeta {
  display_date: string;
  start_date: string;
  end_date: string;
  check_in_time: string;
  opening_time: string;
  closing_time: string;
  schedule_status: string | null;
}

interface TournamentMeta {
  name: string;
  status: string;
  tournament_venues: TournamentVenueMeta | null;
  tournament_schedule: TournamentScheduleMeta | null;
  tournament_prizes: { total_prize: string } | null;
  tournament_registration_info: {
    deadline: string;
    total_slots: number;
    entry_fee_mode: string;
    entry_fee: string | null;
    category_fees: Record<string, string> | null;
    category_slots: Record<string, { capacity: number; used: number }> | null;
    rules_url: string | null;
  } | null;
}

interface TrackResult {
  id: string;
  full_name: string;
  category: string[];
  status: string;
  created_at: string;
  tournament_id: string | null;
  tournaments: TournamentMeta | null;
}

interface Participant {
  full_name: string;
  category: string[];
}

interface ParticipantData {
  tournament_name: string;
  participants: Participant[];
  group_url: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  singles_male: "Đấu Đơn — Nam",
  singles_female: "Đấu Đơn — Nữ",
  doubles_male: "Đấu Đôi — Nam / Nam",
  doubles_female: "Đấu Đôi — Nữ / Nữ",
  doubles_mixed: "Đấu Đôi — Nam / Nữ",
};

const STATUS_INFO: Record<string, { label: string; color: string; message: string }> = {
  pending: {
    label: "Chờ xác nhận",
    color: "#f59f00",
    message: "Đang chờ xác nhận thanh toán. Bạn vui lòng thực hiện sớm để giữ chỗ.",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "#b8ff00",
    message: "Xác nhận đăng ký thành công. Hẹn gặp bạn tại giải!",
  },
  cancelled: {
    label: "Đã hủy",
    color: "#ff6b6b",
    message: "Đăng ký đã bị hủy. Bạn có thể tiến hành đăng ký lại.",
  },
  rejected: {
    label: "Từ chối",
    color: "#ff922b",
    message: "Đăng ký đã bị từ chối bởi ban tổ chức. Vui lòng liên hệ để biết thêm chi tiết.",
  },
};

function parseFee(fee: string): number {
  return parseInt(fee.replace(/[^\d]/g, ''), 10) || 0;
}
function formatVND(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
}
function getEntryFeeDisplay(regInfo: NonNullable<TournamentMeta['tournament_registration_info']>): string {
  if (regInfo.entry_fee_mode === 'flat') {
    return regInfo.entry_fee ? formatVND(parseFee(regInfo.entry_fee)) : '—';
  }
  const fees = Object.values(regInfo.category_fees ?? {}).filter(Boolean).map((f) => parseFee(f!));
  if (fees.length === 0) return '—';
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  return min === max ? formatVND(min) : `${formatVND(min)} – ${formatVND(max)}`;
}

const STATUS_COLORS: Record<string, { border: string; color: string }> = {
  UPCOMING: { border: 'rgba(184,255,0,0.5)', color: '#b8ff00' },
  ONGOING: { border: 'rgba(0,212,255,0.5)', color: '#00d4ff' },
  COMPLETED: { border: 'rgba(173,170,170,0.5)', color: '#adaaaa' },
};
const STATUS_LABELS: Record<string, string> = {
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang diễn ra',
  COMPLETED: 'Đã kết thúc',
};

const CATEGORY_LABELS_SHORT: Record<string, string> = {
  singles_male: 'Đơn Nam',
  singles_female: 'Đơn Nữ',
  doubles_male: 'Đôi Nam',
  doubles_female: 'Đôi Nữ',
  doubles_mixed: 'Đôi Hỗn Hợp',
};

// ── Cancellation Policy Modal ────────────────────────────────────────────────

interface PolicyStage {
  key: string;
  label: string;
  date: Date;
  refund: string;
  refundPct: number;
}

function formatRelativeDays(diffMs: number): string {
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    const abs = Math.abs(diffDays);
    return abs === 1 ? "1 ngày trước" : `${abs} ngày trước`;
  }
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "1 ngày nữa";
  return `${diffDays} ngày nữa`;
}

function formatDMY(d: Date): string {
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface CancellationPolicyModalProps {
  open: boolean;
  onClose: () => void;
  registrationDate: string; // ISO string
  tournamentStartDate: string; // ISO date string e.g. "2026-04-15"
}

function CancellationPolicyModal({
  open,
  onClose,
  registrationDate,
  tournamentStartDate,
}: CancellationPolicyModalProps) {
  const [now, setNow] = useState(() => new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) return;
    setNow(new Date());
    timerRef.current = setInterval(() => setNow(new Date()), 60_000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open]);

  // Trap focus & close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const regDate = new Date(registrationDate);
  // Parse tournament start date as local date (no timezone shift)
  const [sy, sm, sd] = tournamentStartDate.split("-").map(Number);
  const tournamentDate = new Date(sy, sm - 1, sd);
  tournamentDate.setHours(0, 0, 0, 0);

  // Stage boundary dates
  const stageB = new Date(tournamentDate);
  stageB.setDate(stageB.getDate() - 7); // 1 week before
  const stageC = new Date(tournamentDate);
  stageC.setDate(stageC.getDate() - 4); // 4 days before
  const stageD = new Date(tournamentDate);
  stageD.setDate(stageD.getDate() - 1); // 1 day before

  const stages: PolicyStage[] = [
    { key: "A", label: "Ngày đăng ký", date: regDate, refund: "100% hoàn tiền", refundPct: 100 },
    { key: "B", label: "1 tuần trước giải", date: stageB, refund: "70% hoàn tiền", refundPct: 70 },
    { key: "C", label: "4 ngày trước giải", date: stageC, refund: "40% hoàn tiền", refundPct: 40 },
    { key: "D", label: "1 ngày trước giải", date: stageD, refund: "Không hoàn tiền", refundPct: 0 },
    { key: "E", label: "Ngày thi đấu", date: tournamentDate, refund: "Không hoàn tiền", refundPct: 0 },
  ];

  // Determine which zone "now" is in
  function getActiveZone(): number {
    const nowMs = now.getTime();
    if (nowMs < stageB.getTime()) return 0; // A→B: 100%
    if (nowMs < stageC.getTime()) return 1; // B→C: 70%
    if (nowMs < stageD.getTime()) return 2; // C→D: 40%
    return 3; // D/E: 0%
  }

  const activeZone = getActiveZone();

  const zoneColors = ["#b8ff00", "#f9e64a", "#ff922b", "#ff6b6b"];
  const zoneRefunds = ["100%", "70%", "40%", "0%"];
  const activeColor = zoneColors[activeZone];

  // Which stage node is "current" (last stage that now has passed)
  function getActiveStageIdx(): number {
    let idx = 0;
    for (let i = 0; i < stages.length; i++) {
      if (now >= stages[i].date) idx = i;
    }
    return idx;
  }
  const activeStageIdx = getActiveStageIdx();

  return (
    <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label="Chính sách hủy đăng ký">
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <Group gap={8} align="center">
            <ShieldAlert size={16} color="#b8ff00" />
            <span className={styles.modalTitle}>CHÍNH SÁCH HỦY ĐĂNG KÝ</span>
          </Group>
          <button className={styles.modalClose} onClick={onClose} aria-label="Đóng">
            <X size={16} />
          </button>
        </div>

        {/* Current zone banner */}
        <div
          className={styles.modalZoneBanner}
          style={{ "--banner-color": activeColor } as React.CSSProperties}
          data-active-zone={activeZone}
        >
          <Text size="xs" fw={700} ff="var(--font-space-grotesk)" className={styles.bannerLabel}>
            HIỆN TẠI: {zoneRefunds[activeZone]} HOÀN TIỀN
          </Text>
          <Text size="xs" c="dimmed" ff="var(--font-space-grotesk)">
            {now.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
          </Text>
        </div>

        {/* Timeline — horizontal on wide, vertical on mobile */}
        <div>
          {/* ── HORIZONTAL layout (≥600px) ── */}
          <div className={styles.horizTimeline}>
            {stages.flatMap((stage, i) => {
              const isPast = i < activeStageIdx;
              const isCurrent = i === activeStageIdx;
              const nodeColor = isPast || isCurrent ? zoneColors[Math.min(i, zoneColors.length - 1)] : "#2a2a2a";
              const relativeDiff = stage.date.getTime() - now.getTime();
              const refundLabels = ["100% hoàn tiền", "70% hoàn tiền", "40% hoàn tiền", "Không hoàn tiền"];

              const nodeEl = (
                <div
                  key={`node-${stage.key}`}
                  className={styles.horizNode}
                >
                  <div className={styles.horizNodeAbove}>
                    <span
                      className={styles.nodeKey}
                      style={{ "--node-color": nodeColor } as React.CSSProperties}
                    >
                      {stage.key}
                    </span>
                  </div>
                  <div
                    className={`${styles.nodeDot} ${isCurrent ? styles.nodeDotActive : ""}`}
                    style={{
                      "--dot-border": isPast || isCurrent ? nodeColor : "#3a3a3a",
                      "--dot-bg": isCurrent ? nodeColor : isPast ? `${nodeColor}55` : "#1a1a1a",
                      "--dot-shadow": isCurrent ? `0 0 0 4px ${nodeColor}30` : "none",
                    } as React.CSSProperties}
                  />
                  <div className={styles.horizNodeBelow}>
                    <span className={styles.nodeLabel}>{stage.label}</span>
                    <span className={styles.nodeDate}>{formatDMY(stage.date)}</span>
                    <span
                      className={styles.nodeCountdown}
                      style={{ "--countdown-color": isCurrent ? nodeColor : "#5a5959" } as React.CSSProperties}
                    >
                      {formatRelativeDays(relativeDiff)}
                    </span>
                  </div>
                </div>
              );

              if (i >= stages.length - 1) return [nodeEl];

              const segStart = stages[i].date.getTime();
              const segEnd = stages[i + 1].date.getTime();
              const segProgress = Math.min(100, Math.max(0, (now.getTime() - segStart) / (segEnd - segStart) * 100));

              const segEl = (
                <div
                  key={`seg-${i}`}
                  className={styles.horizSeg}
                >
                  <div className={styles.horizSegTop} />
                  <div className={styles.horizSegMid}>
                    <Progress
                      value={segProgress}
                      color={zoneColors[i]}
                      size={4}
                      radius="xl"
                      classNames={{ root: styles.horizSegProgress }}
                      aria-label={`${refundLabels[i]}: ${Math.round(segProgress)}%`}
                    />
                  </div>
                </div>
              );

              return [nodeEl, segEl];
            })}
          </div>

          {/* ── VERTICAL layout (mobile) ── */}
          <div className={styles.timelineVertical}>
            {stages.map((stage, i) => {
              const isPast = i < activeStageIdx;
              const isCurrent = i === activeStageIdx;
              const nodeColor = isPast || isCurrent ? zoneColors[Math.min(i, zoneColors.length - 1)] : "#3a3a3a";
              const relativeDiff = stage.date.getTime() - now.getTime();
              const isLast = i === stages.length - 1;
              const segColor = zoneColors[Math.min(i, zoneColors.length - 1)];
              const segProgress = !isLast
                ? Math.min(100, Math.max(0, (now.getTime() - stages[i].date.getTime()) / (stages[i + 1].date.getTime() - stages[i].date.getTime()) * 100))
                : 0;

              return (
                <div key={stage.key} className={styles.verticalItem}>
                  {/* Stage letter — left of dot */}
                  <div className={styles.verticalKeyCol}>
                    <span
                      className={styles.nodeKey}
                      style={{ "--node-color": nodeColor } as React.CSSProperties}
                    >
                      {stage.key}
                    </span>
                  </div>
                  {/* Dot + progress connector */}
                  <div className={styles.verticalLeft}>
                    <div
                      className={`${styles.nodeDot} ${isCurrent ? styles.nodeDotActive : ""}`}
                      style={{
                        "--dot-border": isPast || isCurrent ? nodeColor : "#3a3a3a",
                        "--dot-bg": isCurrent ? nodeColor : isPast ? `${nodeColor}55` : "#1a1a1a",
                        "--dot-shadow": isCurrent ? `0 0 0 4px ${nodeColor}30` : "none",
                      } as React.CSSProperties}
                    />
                    {!isLast && (
                      <div
                        className={styles.verticalConnector}
                        style={{
                          "--seg-color": segColor,
                          "--seg-progress": `${segProgress}%`,
                        } as React.CSSProperties}
                      />
                    )}
                  </div>
                  {/* Label + date */}
                  <div className={styles.verticalRight}>
                    <span className={styles.nodeLabel}>{stage.label}</span>
                    <span className={styles.nodeDate} style={{ display: "block", marginTop: 2 }}>{formatDMY(stage.date)}</span>
                    <span
                      className={styles.nodeCountdown}
                      style={{ "--countdown-color": isCurrent ? nodeColor : "#5a5959", display: "block", marginTop: 2 } as React.CSSProperties}
                    >
                      {formatRelativeDays(relativeDiff)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Refund policy note */}
        <div className={styles.policyNote}>
          <ul className={styles.policyNoteList}>
            {[
              { from: "A", to: "B", label: "Từ ngày đăng ký đến 1 tuần trước giải", refund: "Hoàn 100%", color: zoneColors[0] },
              { from: "B", to: "C", label: "Từ 1 tuần đến 4 ngày trước giải", refund: "Hoàn 70%", color: zoneColors[1] },
              { from: "C", to: "D", label: "Từ 4 ngày đến 1 ngày trước giải", refund: "Hoàn 40%", color: zoneColors[2] },
              { from: "D", to: "E", label: "Từ 1 ngày trước giải đến ngày thi đấu", refund: "Không hoàn", color: zoneColors[3] },
            ].map((rule, i) => (
              <li key={i} className={styles.policyNoteItem}>
                <span
                  className={styles.policyNoteDot}
                  style={{ "--rule-color": rule.color } as React.CSSProperties}
                />
                <span className={styles.policyNoteText}>
                  <span className={styles.policyNoteRange}>
                    {rule.from}→{rule.to}
                  </span>
                  {rule.label} —{" "}
                  <span
                    className={styles.policyNoteRefund}
                    style={{ "--rule-color": rule.color } as React.CSSProperties}
                  >
                    {rule.refund}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

// ── Cancel Confirm Modal ────────────────────────────────────────────────────

interface CancelConfirmModalProps {
  open: boolean;
  onClose: () => void;
  submitting: boolean;
  onConfirm: () => void;
  onViewPolicy: () => void;
}

function CancelConfirmModal({ open, onClose, submitting, onConfirm, onViewPolicy }: CancelConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Xác nhận hủy đăng ký"
    >
      <div className={styles.cancelConfirmModalContent}>
        <div className={styles.modalHeader}>
          <Group gap={8} align="center">
            <AlertTriangle size={16} color="#ff922b" />
            <span className={styles.modalTitle}>HỦY ĐĂNG KÝ</span>
          </Group>
          <button className={styles.modalClose} onClick={onClose} aria-label="Đóng">
            <X size={16} />
          </button>
        </div>
        <div className={styles.cancelConfirmModalBody}>
          <p className={styles.cancelConfirmModalText}>
            Hành động này <strong>không thể hoàn tác</strong>. Vui lòng đọc chính sách hủy đăng ký để biết mức hoàn tiền áp dụng cho thời điểm hiện tại trước khi đưa ra quyết định.
          </p>
          <button className={styles.viewPolicyButton} onClick={onViewPolicy}>
            <ShieldAlert size={13} />
            Xem chính sách hủy đăng ký
          </button>
        </div>
        <div className={styles.cancelConfirmModalActions}>
          <button className={styles.cancelConfirmNo} onClick={onClose} disabled={submitting}>
            Không, quay lại
          </button>
          <button className={styles.cancelConfirmYes} onClick={onConfirm} disabled={submitting}>
            {submitting ? "Đang hủy..." : "Xác nhận hủy"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StatusResultsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") ?? "";

  const [searchInput, setSearchInput] = useState(query);
  const [registrations, setRegistrations] = useState<TrackResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tournament detail view
  const [selectedReg, setSelectedReg] = useState<TrackResult | null>(null);
  const [participantData, setParticipantData] = useState<ParticipantData | null>(null);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  // Cancel state
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Policy modal state
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  // Cancel confirm modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Sync search input when URL query changes
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Fetch registrations when query present
  useEffect(() => {
    if (!query || query.length < 6) {
      setRegistrations(null);
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setError("");
      setSelectedReg(null);
      try {
        const res = await fetch(`/api/status?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Lỗi tra cứu");
        setRegistrations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tra cứu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  // Fetch participants when tournament selected
  useEffect(() => {
    if (!selectedReg?.tournament_id) {
      setParticipantData(null);
      return;
    }
    const fetchParticipants = async () => {
      setParticipantsLoading(true);
      try {
        const res = await fetch(
          `/api/status/participants?tournament_id=${encodeURIComponent(selectedReg.tournament_id!)}`,
        );
        const data = await res.json();
        if (res.ok) setParticipantData(data);
      } catch {
        // silently fail
      } finally {
        setParticipantsLoading(false);
      }
    };
    fetchParticipants();
  }, [selectedReg]);

  const handleSearch = () => {
    const q = searchInput.trim();
    if (q.length < 6) {
      setError("Vui lòng nhập email hoặc số điện thoại hợp lệ (ít nhất 6 ký tự).");
      return;
    }
    setError("");
    router.push(`/status?q=${encodeURIComponent(q)}`);
  };

  const handleCancelConfirm = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch("/api/status/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, q: query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Không thể hủy đăng ký");
      setRegistrations((prev) =>
        prev ? prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)) : prev,
      );
      if (selectedReg?.id === id) {
        setSelectedReg((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
      }
      setCancelConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể hủy. Vui lòng thử lại.");
    } finally {
      setCancellingId(null);
    }
  };

  // ── View 3: Tournament Detail ────────────────────────────────────────────
  if (query && selectedReg) {
    const info = STATUS_INFO[selectedReg.status] ?? STATUS_INFO.pending;
    const StatusIcon =
      selectedReg.status === "confirmed"
        ? CheckCircle
        : selectedReg.status === "cancelled" || selectedReg.status === "rejected"
          ? XCircle
          : Clock;
    const canCancel = selectedReg.status === "pending" || selectedReg.status === "confirmed";
    const isConfirming = cancelConfirmId === selectedReg.id;
    const isCancelling = cancellingId === selectedReg.id;

    return (
      <>
        <Navbar />
        <Box className={styles.page}>
          <Container size={780} py={60}>
            <Stack gap={40}>
              <nav className={styles.breadcrumb} aria-label="breadcrumb">
                <Link href="/" className={styles.breadcrumbItem}>Trang chủ</Link>
                <ChevronRight size={12} className={styles.breadcrumbSep} />
                <button
                  className={styles.breadcrumbItem}
                  onClick={() => { setSelectedReg(null); setParticipantData(null); }}
                >
                  Lịch sử đăng ký
                </button>
                <ChevronRight size={12} className={styles.breadcrumbSep} />
                <span className={styles.breadcrumbCurrent}>
                  {selectedReg.tournaments?.name ?? "Giải đấu"}
                </span>
              </nav>

              <div>
                <h1 className={styles.pageTitle}>
                  {selectedReg.tournaments?.name?.toUpperCase() ?? "GIẢI ĐẤU"}
                </h1>
                <p className={styles.pageSubtitle}>
                  Đăng ký ngày {new Date(selectedReg.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>

              {selectedReg.tournaments && (() => {
                const t = selectedReg.tournaments;
                const venue = t.tournament_venues;
                const sched = t.tournament_schedule;
                const regInfo = t.tournament_registration_info;
                const prizes = t.tournament_prizes;
                const statusColor = STATUS_COLORS[t.status] ?? STATUS_COLORS.UPCOMING;

                return (
                  <Box className={styles.tournamentInfoCard}>
                    {/* Header: logo + name + status */}
                    {venue?.logo_url && (
                      <img src={venue.logo_url} alt={t.name} className={styles.tournamentInfoLogo} />
                    )}
                    <Group gap={14} mb={16} wrap="nowrap" align="center">

                      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                        <span className={styles.tournamentInfoName}>{t.name}</span>
                        <Group gap={6} wrap="wrap" align="center">
                          {venue && (
                            <Group gap={4} wrap="nowrap">
                              <MapPin size={11} color="#adaaaa" />
                              <Text size="xs" c="dimmed">{venue.name}, {venue.city}</Text>
                            </Group>
                          )}
                          <Badge
                            variant="outline"
                            size="xs"
                            style={{ borderColor: statusColor.border, color: statusColor.color }}
                          >
                            {STATUS_LABELS[t.status] ?? t.status}
                          </Badge>
                        </Group>
                      </Stack>
                    </Group>

                    <Box className={styles.resultCard}>
                      <Group justify="space-between" align="flex-start" mb={8}>
                        <Text className={styles.resultName}>{selectedReg.full_name}</Text>
                        <Badge
                          variant="outline"
                          leftSection={<StatusIcon size={11} />}
                          style={{ borderColor: info.color, color: info.color }}
                        >
                          {info.label}
                        </Badge>
                      </Group>
                      <Group gap={6} wrap="wrap" mb={8}>
                        {selectedReg.category.map((c) => (
                          <Badge key={c} size="xs" variant="dot" color="lime">
                            {CATEGORY_LABELS[c] ?? c}
                          </Badge>
                        ))}
                      </Group>
                      <p className={styles.statusMessage} data-status={selectedReg.status}>
                        {info.message}
                      </p>
                      {canCancel && (
                        <Group justify="flex-end" mt={10} gap={8} wrap="wrap">
                          {selectedReg.status === "confirmed" && selectedReg.tournaments?.tournament_schedule?.start_date && (
                            <button
                              className={styles.policyButton}
                              onClick={() => setPolicyModalOpen(true)}
                            >
                              <ShieldAlert size={12} />
                              Chính sách hủy đăng ký
                            </button>
                          )}
                          {selectedReg.status === "confirmed" && selectedReg.tournaments?.tournament_schedule?.start_date ? (
                            <button
                              className={styles.cancelButton}
                              onClick={() => setCancelModalOpen(true)}
                            >
                              Hủy đăng ký
                            </button>
                          ) : (
                            isConfirming ? (
                              <div className={styles.cancelConfirmGroup}>
                                <span className={styles.cancelConfirmText}>Xác nhận hủy?</span>
                                <button
                                  className={styles.cancelConfirmYes}
                                  onClick={() => handleCancelConfirm(selectedReg.id)}
                                  disabled={isCancelling}
                                >
                                  {isCancelling ? "Đang hủy..." : "Hủy đăng ký"}
                                </button>
                                <button
                                  className={styles.cancelConfirmNo}
                                  onClick={() => setCancelConfirmId(null)}
                                  disabled={isCancelling}
                                >
                                  Không
                                </button>
                              </div>
                            ) : (
                              <button
                                className={styles.cancelButton}
                                onClick={() => setCancelConfirmId(selectedReg.id)}
                              >
                                Hủy đăng ký
                              </button>
                            )
                          )}
                        </Group>
                      )}
                    </Box>

                    {regInfo?.rules_url && (
                      <a
                        href={regInfo.rules_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.rulesLink}
                      >
                        Điều lệ giải →
                      </a>
                    )}

                    {/* Info accordion */}
                    <Accordion
                      mt={16}
                      multiple
                      defaultValue={["schedule", "venue", "regprize"]}
                      classNames={{
                        item: styles.accordionItem,
                        control: styles.accordionControl,
                        chevron: styles.accordionChevron,
                        label: styles.accordionLabel,
                        panel: styles.accordionPanel,
                      }}
                    >
                      {sched && (
                        <Accordion.Item value="schedule">
                          <Accordion.Control icon={<CalendarDays size={13} color="#b8ff00" />}>
                            LỊCH THI ĐẤU
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap={0}>
                              <Group justify="space-between" className={styles.infoRow}>
                                <Group gap={6} wrap="nowrap" align="center">
                                  <span className={styles.infoLabel}>Ngày thi đấu</span>
                                  {sched.schedule_status && (
                                    <span className={styles.schedBadge}>{sched.schedule_status}</span>
                                  )}
                                </Group>
                                <span className={styles.infoValue}>{sched.display_date}</span>
                              </Group>
                              <Group justify="space-between" className={styles.infoRow}>
                                <span className={styles.infoLabel}>Check-in</span>
                                <span className={styles.infoValue}>{sched.check_in_time}</span>
                              </Group>
                              <Group justify="space-between" className={styles.infoRow}>
                                <span className={styles.infoLabel}>Khai mạc</span>
                                <span className={styles.infoValue}>{sched.opening_time}</span>
                              </Group>
                              <Group justify="space-between" className={styles.infoRow}>
                                <span className={styles.infoLabel}>Kết thúc</span>
                                <span className={styles.infoValue}>{sched.closing_time}</span>
                              </Group>
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      )}

                      {sched && venue && (
                        <Accordion.Item value="venue">
                          <Accordion.Control icon={<MapPin size={13} color="#b8ff00" />}>
                            SÂN THI ĐẤU
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap={0}>
                              <Group justify="space-between" className={styles.infoRow}>
                                <span className={styles.infoLabel}>Tên sân</span>
                                <span className={styles.infoValue}>{venue.name}</span>
                              </Group>
                              <Group justify="space-between" align="flex-start" className={styles.infoRow}>
                                <span className={styles.infoLabel}>Địa chỉ</span>
                                {venue.location_url ? (
                                  <a href={venue.location_url} target="_blank" rel="noopener noreferrer" className={styles.infoValueAddressLink}>
                                    {venue.city}, {venue.country}
                                  </a>
                                ) : (
                                  <span className={styles.infoValueAddress}>{venue.city}, {venue.country}</span>
                                )}
                              </Group>
                              <Group justify="space-between" className={styles.infoRow}>
                                <span className={styles.infoLabel}>Quy mô</span>
                                <span className={styles.infoValue}>{venue.courts} sân • {venue.court_type}</span>
                              </Group>
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      )}

                      {(regInfo || prizes) && (
                        <Accordion.Item value="regprize">
                          <Accordion.Control icon={<Trophy size={13} color="#b8ff00" />}>
                            ĐĂNG KÝ & GIẢI THƯỞNG
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap={0}>
                              {prizes && (
                                <Group justify="space-between" className={styles.infoRow}>
                                  <span className={styles.infoLabel}>Tổng giải</span>
                                  <span className={`${styles.infoValue} ${styles.prizeValue}`}>{prizes.total_prize}</span>
                                </Group>
                              )}
                              {regInfo && (
                                <>
                                  <Group justify="space-between" className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Hạn đăng ký</span>
                                    <span className={styles.infoValue}>{regInfo.deadline}</span>
                                  </Group>
                                  <Group justify="space-between" className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Phí tham gia</span>
                                    <span className={styles.infoValue}>{getEntryFeeDisplay(regInfo)}</span>
                                  </Group>
                                </>
                              )}
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      )}
                    </Accordion>

                  </Box>
                );
              })()}

              {participantsLoading && selectedReg.status !== "cancelled" && (
                <Box className={styles.loadingState}>
                  <Loader size="sm" color="#b8ff00" />
                  <Text size="sm" c="dimmed">Đang tải danh sách thi đấu...</Text>
                </Box>
              )}

              {!participantsLoading && participantData && selectedReg.status !== "cancelled" && (
                <Stack gap="md">
                  <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                    <Group gap={10} align="center">
                      <Users size={18} color="#b8ff00" />
                      <h2 className={styles.participantsTitle}>DANH SÁCH THI ĐẤU</h2>
                    </Group>
                    {participantData.group_url && (
                      <Button
                        component={Link}
                        href={participantData.group_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="xs"
                        rightSection={<ExternalLink size={12} />}
                        className={styles.groupButton}
                      >
                        THAM GIA NHÓM
                      </Button>
                    )}
                  </Group>
                  <p className={styles.participantsSubtitle}>
                    <strong style={{ color: "#ffffff" }}>{participantData.participants.length}</strong> vận động viên đã xác nhận tham gia
                  </p>
                  <Box className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={`${styles.th} ${styles.thNum}`}>STT</th>
                          <th className={styles.th}>Họ và Tên</th>
                          <th className={styles.th}>Hạng Mục</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participantData.participants.map((p, i) => (
                          <tr key={i} className={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                            <td className={styles.tdNum}>{i + 1}</td>
                            <td className={styles.tdName}>{p.full_name}</td>
                            <td className={styles.tdCat}>
                              <Group gap={4} wrap="wrap">
                                {p.category.map((c) => (
                                  <Badge key={c} size="xs" variant="dot" color="lime">
                                    {CATEGORY_LABELS[c] ?? c}
                                  </Badge>
                                ))}
                              </Group>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Stack>
              )}
            </Stack>
          </Container>
        </Box>
        {selectedReg?.status === "confirmed" && selectedReg.tournaments?.tournament_schedule?.start_date && (
          <>
            <CancellationPolicyModal
              open={policyModalOpen}
              onClose={() => setPolicyModalOpen(false)}
              registrationDate={selectedReg.created_at}
              tournamentStartDate={selectedReg.tournaments.tournament_schedule.start_date}
            />
            <CancelConfirmModal
              open={cancelModalOpen}
              onClose={() => setCancelModalOpen(false)}
              submitting={cancellingId === selectedReg.id}
              onConfirm={async () => {
                await handleCancelConfirm(selectedReg.id);
                setCancelModalOpen(false);
              }}
              onViewPolicy={() => { setCancelModalOpen(false); setPolicyModalOpen(true); }}
            />
          </>
        )}
        <Footer />
      </>
    );
  }
  if (query) {
    return (
      <>
        <Navbar />
        <Box className={styles.page}>
          <Container size={780} py={60}>
            <Stack gap={40}>
              <Link href="/" className={styles.backLink}>
                <ArrowLeft size={14} />
                Về trang chủ
              </Link>
              <div>
                <h1 className={styles.pageTitle}>DANH SÁCH GIẢI ĐÃ ĐĂNG KÝ</h1>
              </div>

              <Box className={styles.searchAgain}>
                <Text size="sm" c="dimmed" mb={8}>Tra cứu với thông tin khác:</Text>
                <Group gap={8} wrap="nowrap">
                  <TextInput
                    placeholder="Email hoặc số điện thoại"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.currentTarget.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                    leftSection={<Search size={15} color="#adaaaa" />}
                    className={styles.queryInput}
                    classNames={{ root: styles.queryInputRoot }}
                  />
                  <Button onClick={handleSearch} className={styles.searchButton} px="md">
                    Tra cứu
                  </Button>
                </Group>
                {error && <Text size="sm" className={styles.errorText} mt={8}>{error}</Text>}
              </Box>

              {loading && (
                <Box className={styles.loadingState}>
                  <Loader size="sm" color="#b8ff00" />
                  <Text size="sm" c="dimmed">Đang tra cứu...</Text>
                </Box>
              )}

              {!loading && error && (
                <Box className={styles.errorState}>
                  <Text size="sm" className={styles.errorText}>{error}</Text>
                </Box>
              )}

              {!loading && !error && registrations !== null && (
                registrations.length === 0 ? (
                  <Box className={styles.emptyState}>
                    <Text size="sm" c="dimmed" ta="center">
                      Không tìm thấy đăng ký nào với thông tin này.
                    </Text>
                  </Box>
                ) : (
                  <Stack gap="sm">
                    {registrations.map((r) => {
                      const info = STATUS_INFO[r.status] ?? STATUS_INFO.pending;
                      const StatusIcon =
                        r.status === "confirmed"
                          ? CheckCircle
                          : r.status === "cancelled" || r.status === "rejected"
                            ? XCircle
                            : Clock;
                      return (
                        <><div>
                          {!loading && registrations !== null && (
                            <p className={styles.pageSubtitle}>
                              <span className={styles.countHighlight}>{registrations.length}</span> giải đấu
                            </p>
                          )}
                        </div>
                          <button
                            key={r.id}
                            className={styles.tournamentRow}
                            onClick={() => setSelectedReg(r)}
                          >
                            <Group justify="space-between" align="center" wrap="nowrap" gap={12}>
                              <Group gap={12} align="center" style={{ flex: 1, minWidth: 0 }}>
                                {r.tournaments?.tournament_venues?.logo_url && (
                                  <img
                                    src={r.tournaments.tournament_venues.logo_url}
                                    alt=""
                                    className={styles.rowLogo} />
                                )}
                                <Stack gap={4} align="flex-start" style={{ flex: 1, minWidth: 0 }}>
                                  <span className={styles.tournamentRowName}>
                                    {r.tournaments?.name ?? "Giải đấu"}
                                  </span>
                                  <Group gap={4} wrap="nowrap">
                                    {r.tournaments?.tournament_schedule?.display_date && (
                                      <Text size="xs" c="dimmed">
                                        {r.tournaments.tournament_schedule.display_date}
                                      </Text>
                                    )}
                                    {r.tournaments?.tournament_venues?.city && (
                                      <>
                                        <Text size="xs" c="#3a3a3a">·</Text>
                                        <Text size="xs" c="dimmed">
                                          {r.tournaments.tournament_venues.city}
                                        </Text>
                                      </>
                                    )}
                                  </Group>
                                  <Group gap={6} wrap="wrap">
                                    {r.category.map((c) => (
                                      <Badge key={c} size="xs" variant="dot" color="lime">
                                        {CATEGORY_LABELS[c] ?? c}
                                      </Badge>
                                    ))}
                                  </Group>
                                </Stack>
                              </Group>
                              <Group gap={8} align="center" style={{ flexShrink: 0 }}>
                                <Badge
                                  variant="outline"
                                  leftSection={<StatusIcon size={11} />}
                                  style={{ borderColor: info.color, color: info.color }}
                                >
                                  {info.label}
                                </Badge>
                                <ChevronRight size={16} color="#5a5959" />
                              </Group>
                            </Group>
                          </button></>
                      );
                    })}
                  </Stack>
                )
              )}
            </Stack>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  // ── View 1: Search Form ──────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <Box className={styles.page}>
        <Container size={780} py={60}>
          <Stack gap={40}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={14} />
              Về trang chủ
            </Link>

            <div>
              <h1 className={styles.pageTitle}>TRA CỨU ĐĂNG KÝ</h1>
              <p className={styles.pageSubtitle}>
                Nhập email hoặc số điện thoại bạn đã dùng khi đăng ký.
              </p>
            </div>

            <Box className={styles.searchBox}>
              <Group gap={8} wrap="nowrap">
                <TextInput
                  placeholder="Email hoặc số điện thoại"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.currentTarget.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  leftSection={<Search size={15} color="#adaaaa" />}
                  className={styles.queryInput}
                  classNames={{ root: styles.queryInputRoot }}
                />
                <Button onClick={handleSearch} className={styles.searchButton} px="md">
                  Tra cứu
                </Button>
              </Group>
              {error && <Text size="sm" className={styles.errorText} mt={8}>{error}</Text>}
            </Box>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
