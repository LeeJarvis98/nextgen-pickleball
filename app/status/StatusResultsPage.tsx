"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container, Box, Stack, Group, Badge, Text, Loader, Button, TextInput, Accordion } from "@mantine/core";
import { ArrowLeft, CalendarDays, Clock, CheckCircle, XCircle, Users, ExternalLink, Search, ChevronRight, MapPin, Trophy } from "lucide-react";
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
}

interface TournamentScheduleMeta {
  display_date: string;
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
                    <Group gap={14} mb={16} wrap="nowrap" align="center">
                      {venue?.logo_url && (
                        <img src={venue.logo_url} alt={t.name} className={styles.tournamentInfoLogo} />
                      )}
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
                        <Group justify="flex-end" mt={10}>
                          {isConfirming ? (
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
                          )}
                        </Group>
                      )}
                    </Box>

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
                                <span className={styles.infoValueAddress}>{venue.city}, {venue.country}</span>
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

              {participantsLoading && (
                <Box className={styles.loadingState}>
                  <Loader size="sm" color="#b8ff00" />
                  <Text size="sm" c="dimmed">Đang tải danh sách thi đấu...</Text>
                </Box>
              )}

              {!participantsLoading && participantData && (
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
        <Footer />
      </>
    );
  }

  // ── View 2: Tournament List ──────────────────────────────────────────────
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
