"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, TextInput, Button, Stack, Group, Text } from "@mantine/core";
import { Search } from "lucide-react";
import styles from "./TrackStatusModal.module.css";

interface TrackStatusModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function TrackStatusModal({ opened, onClose }: TrackStatusModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    if (q.length < 6) {
      setError("Vui lòng nhập email hoặc số điện thoại hợp lệ (ít nhất 6 ký tự).");
      return;
    }
    handleClose();
    router.push(`/status?q=${encodeURIComponent(q)}`);
  };

  const handleClose = () => {
    setQuery("");
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
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            leftSection={<Search size={15} color="#adaaaa" />}
            className={styles.queryInput}
            classNames={{ root: styles.queryInputRoot }}
          />
          <Button
            onClick={handleSearch}
            className={styles.searchButton}
            px="md"
          >
            Tra cứu
          </Button>
        </Group>

        {error && <Text size="sm" className={styles.errorText}>{error}</Text>}
      </Stack>
    </Modal>
  );
}