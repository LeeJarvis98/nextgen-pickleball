"use client";

import { useState } from "react";
import { Modal, TextInput, Button, Stack, Box, Badge, Group, Text } from "@mantine/core";
import { Search, Clock, CheckCircle, XCircle } from "lucide-react";
import styles from "./TrackStatusModal.module.css";

interface TrackResult {
  id: string;
  full_name: string;
  category: string[];
  status: string;
  created_at: string;
  tournament_id: string | null;
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

interface TrackStatusModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function TrackStatusModal({ opened, onClose }: TrackStatusModalProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TrackResult[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    setSearched(false);
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lỗi tra cứu");
      setResults(data);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tra cứu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuery("");
    setResults(null);
    setSearched(false);
    setError("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<span className={styles.modalTitle}>XEM THÔNG TIN ĐĂNG KÝ</span>}
      size="md"
      classNames={{
        content: styles.modalContent,
        header: styles.modalHeader,
        close: styles.modalClose,
      }}
      centered
    >
      <Stack gap="md">
        <p className={styles.instrText}>
          Nhập email hoặc số điện thoại bạn đã dùng khi đăng ký.
        </p>
        <Group gap={8} wrap="nowrap">
          <TextInput
            placeholder="Email hoặc số điện thoại"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !loading) handleSearch(); }}
            leftSection={<Search size={15} color="#adaaaa" />}
            className={styles.queryInput}
            style={{ flex: 1 }}
          />
          <Button
            onClick={handleSearch}
            loading={loading}
            className={styles.searchButton}
            px="md"
          >
            Tra cứu
          </Button>
        </Group>

        {error && <Text size="sm" className={styles.errorText}>{error}</Text>}

        {searched && results !== null && (
          <Stack gap="sm" mt={4}>
            {results.length === 0 ? (
              <Box className={styles.emptyState}>
                <Text size="sm" c="dimmed" ta="center">
                  Không tìm thấy đăng ký nào với thông tin này.
                </Text>
              </Box>
            ) : (
              results.map((r) => {
                const info = STATUS_INFO[r.status] ?? STATUS_INFO.pending;
                const StatusIcon =
                  r.status === "confirmed" ? CheckCircle
                  : r.status === "cancelled" ? XCircle
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
                      style={{ borderLeftColor: info.color, color: info.color }}
                    >
                      {info.message}
                    </p>
                    <Text size="xs" c="dimmed" mt={4}>
                      Đăng ký: {new Date(r.created_at).toLocaleDateString("vi-VN")}
                    </Text>
                  </Box>
                );
              })
            )}
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}