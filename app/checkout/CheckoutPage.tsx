"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Box, Container, Stack, Group, Button, Image, Badge } from "@mantine/core";
import Navbar from "@/components/Navbar";
import { CheckCircle, ArrowLeft } from "lucide-react";
import styles from "./CheckoutPage.module.css";

const CATEGORY_LABELS: Record<string, string> = {
  singles_male:   "Đấu Đơn — Nam",
  singles_female: "Đấu Đơn — Nữ",
  doubles_male:   "Đấu Đôi — Nam / Nam",
  doubles_female: "Đấu Đôi — Nữ / Nữ",
  doubles_mixed:  "Đấu Đôi — Nam / Nữ",
};

export default function CheckoutPage() {
  const params = useSearchParams();
  const name = params.get("n") ?? "";
  const cats = params.get("cats")?.split(",").filter(Boolean) ?? [];
  const fee = params.get("fee") ?? "";
  let catFees: Record<string, string> = {};
  try { catFees = JSON.parse(params.get("cf") ?? "{}"); } catch { /* noop */ }

  const feeLines = cats
    .map((c) => ({ cat: c, label: CATEGORY_LABELS[c] ?? c, fee: catFees[c] ?? null }))
    .filter((fl) => fl.fee !== null);

  const showFees = fee || feeLines.length > 0;

  return (
    <>
      <Navbar />
      <Box className={styles.page}>
        <Container size="lg" py={60}>
          <Stack gap={40} align="center">
            <Stack align="center" gap="md">
              <Box className={styles.iconRing}>
                <CheckCircle size={44} color="#b8ff00" strokeWidth={1.5} />
              </Box>
              <h1 className={styles.heading}>ĐĂNG KÝ THÀNH CÔNG!</h1>
              {name && <p className={styles.playerName}>{name}</p>}
              {cats.length > 0 && (
                <Group gap={8} justify="center" wrap="wrap">
                  {cats.map((c) => (
                    <Badge key={c} className={styles.catBadge} variant="outline" size="md">
                      {CATEGORY_LABELS[c] ?? c}
                    </Badge>
                  ))}
                </Group>
              )}
            </Stack>

            <div className={styles.paymentCard}>
              <div className={styles.instructions}>
                <h2 className={styles.sectionTitle}>CHUYỂN KHOẢN PHÍ THAM DỰ</h2>
                <p className={styles.instrText}>
                  Vui lòng chuyển khoản phí tham dự theo mã QR để hoàn tất đăng ký.
                  Ban tổ chức sẽ xác nhận sau khi nhận được thanh toán.
                </p>
                {showFees && (
                  <Box className={styles.feeBox}>
                    <span className={styles.feeSectionLabel}>SỐ TIỀN CẦN CHUYỂN</span>
                    {fee ? (
                      <div className={styles.feeLine}>
                        <span className={styles.feeLineLabel}>Phí tham dự</span>
                        <span className={styles.feeLineAmt}>{fee}</span>
                      </div>
                    ) : (
                      feeLines.map((fl) => (
                        <div key={fl.cat} className={styles.feeLine}>
                          <span className={styles.feeLineLabel}>{fl.label}</span>
                          <span className={styles.feeLineAmt}>{fl.fee}</span>
                        </div>
                      ))
                    )}
                  </Box>
                )}
                <div className={styles.noteBox}>
                  <p className={styles.noteItem}>
                    <span className={styles.noteBullet}>✦</span>
                    <span>Nội dung CK: <strong>Họ tên + Số điện thoại đã đăng ký</strong></span>
                  </p>
                  <p className={styles.noteItem}>
                    <span className={styles.noteBullet}>✦</span>
                    <span>Kiểm tra trạng thái bằng nút <strong>Theo Dõi Đăng Ký</strong> trên trang chủ.</span>
                  </p>
                </div>
              </div>

              <div className={styles.qrSection}>
                <span className={styles.qrLabel}>QUÉT ĐỂ CHUYỂN KHOẢN</span>
                <Box className={styles.qrFrame}>
                  <Image src="/QR.png" alt="Mã QR chuyển khoản" w={240} h={240} fit="contain" />
                </Box>
              </div>
            </div>

            <Button
              component={Link}
              href="/"
              size="md"
              variant="outline"
              leftSection={<ArrowLeft size={16} />}
              className={styles.homeButton}
            >
              VỀ TRANG CHỦ
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
}