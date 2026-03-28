"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container, Box, Stack, Group, Badge, Text, Loader } from "@mantine/core";
import { ArrowLeft, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./StatusResultsPage.module.css";

interface TrackResult {
  id: string;
  full_name: string;
  category: string[];
  status: string;
  created_at: string;
  tournament_id: string | null;
}

interface Participant {
  full_name: string;
  category: string[];
}

interface ParticipantData {
  tournament_name: string;
  participants: Participant[];
}

const CATEGORY_LABELS: Record<string, string> = {
  singles_male:   "Đấu Đơn — Nam",
  singles_female: "Đấu Đơn — Nữ",
  doubles_male:   "Đấu Đôi — Nam / Nam",
  doubles_female: "Đấu Đôi — Nữ / Nữ",
  doubles_mixed:  "Đấu Đôi — Nam / Nữ",
};

const STATUS_INFO: Record<string, { label: string; color: string; message: string }> = {
  pending: {
    label: "Chờ xác nhận",
    color: "#f59f00",
    message: "Đang chờ xác nhận thanh toán. Nếu chưa chuyển khoản, vui lòng thực hiện sớm.",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "#b8ff00",
    message: "Đăng ký và thanh toán đã được xác nhận. Hẹn gặp bạn tại giải!",
  },
  cancelled: {
    label: "Đã hủy",
    color: "#ff6b6b",
    message: "Đăng ký đã bị hủy. Vui lòng liên hệ ban tổ chức để biết thêm.",
  },
};

export default function StatusResultsPage() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";

  const [registrations, setRegistrations] = useState<TrackResult[] | null>(null);
  const [participantsMap, setParticipantsMap] = useState<Record<string, ParticipantData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query || query.length < 6) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/status?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Lỗi tra cứu");

        setRegistrations(data);

        const confirmedIds = [
          ...new Set(
            (data as TrackResult[])
              .filter((r) => r.status === "confirmed" && r.tournament_id)
              .map((r) => r.tournament_id as string),
          ),
        ];

        if (confirmedIds.length > 0) {
          const fetchMap: Record<string, ParticipantData> = {};
          await Promise.all(
            confirmedIds.map(async (id) => {
              const pRes = await fetch(
                `/api/status/participants?tournament_id=${encodeURIComponent(id)}`,
              );
              const pData = await pRes.json();
              if (pRes.ok) fetchMap[id] = pData;
            }),
          );
          setParticipantsMap(fetchMap);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tra cứu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

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
              <h1 className={styles.pageTitle}>KẾT QUẢ TRA CỨU</h1>
              {!loading && registrations !== null && (
                <p className={styles.pageSubtitle}>
                  {registrations.length} đăng ký được tìm thấy
                </p>
              )}
            </div>

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
              <>
                {registrations.length === 0 ? (
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
                          : r.status === "cancelled"
                            ? XCircle
                            : Clock;
                      return (
                        <Box key={r.id} className={styles.resultCard}>
                          <Group justify="space-between" align="flex-start" mb={8}>
                            <Text className={styles.resultName}>{r.full_name}</Text>
                            <Badge
                              variant="outline"
                              leftSection={<StatusIcon size={11} />}
                              style={{ borderColor: info.color, color: info.color }}
                            >
                              {info.label}
                            </Badge>
                          </Group>
                          <Group gap={6} wrap="wrap" mb={8}>
                            {r.category.map((c) => (
                              <Badge key={c} size="xs" variant="dot" color="lime">
                                {CATEGORY_LABELS[c] ?? c}
                              </Badge>
                            ))}
                          </Group>
                          <p
                            className={styles.statusMessage}
                            data-status={r.status}
                          >
                            {info.message}
                          </p>
                          <Text size="xs" c="dimmed" mt={4}>
                            Đăng ký: {new Date(r.created_at).toLocaleDateString("vi-VN")}
                          </Text>
                        </Box>
                      );
                    })}
                  </Stack>
                )}

                {Object.entries(participantsMap).map(
                  ([tournamentId, { tournament_name, participants }]) => (
                    <Stack key={tournamentId} gap="md" mt={8}>
                      <Group gap={10} align="center">
                        <Users size={18} color="#b8ff00" />
                        <h2 className={styles.participantsTitle}>
                          DANH SÁCH THI ĐẤU — {tournament_name.toUpperCase()}
                        </h2>
                      </Group>
                      <p className={styles.participantsSubtitle}>
                        {participants.length} vận động viên đã xác nhận tham gia
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
                            {participants.map((p, i) => (
                              <tr
                                key={i}
                                className={i % 2 === 0 ? styles.trEven : styles.trOdd}
                              >
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
                  ),
                )}
              </>
            )}
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  );
}