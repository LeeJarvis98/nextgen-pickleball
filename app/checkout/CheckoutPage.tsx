"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Box, Container, Stack, Group, Button, Image, Badge, CopyButton, ActionIcon, Tooltip } from "@mantine/core";
import Navbar from "@/components/Navbar";
import { CheckCircle, ArrowLeft, Copy, Check } from "lucide-react";
import styles from "./CheckoutPage.module.css";

interface PaymentSettings {
  bank_name: string;
  bank_account: string;
  account_holder: string;
  qr_url: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  singles_male:   "Đấu Đơn — Nam",
  singles_female: "Đấu Đơn — Nữ",
  doubles_male:   "Đấu Đôi — Nam / Nam",
  doubles_female: "Đấu Đôi — Nữ / Nữ",
  doubles_mixed:  "Đấu Đôi — Nam / Nữ",
};

function formatVND(fee: string): string {
  const amount = parseInt(fee.replace(/[^\d]/g, ''), 10) || 0;
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
}

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  bank_name: "TP Bank",
  bank_account: "6598 8393 979",
  account_holder: "LE GIA VY",
  qr_url: "/QR.png",
};

export default function CheckoutPage({ paymentSettings = DEFAULT_PAYMENT_SETTINGS }: { paymentSettings?: PaymentSettings }) {
  const params = useSearchParams();
  const name = params.get("n") ?? "";
  const cats = params.get("cats")?.split(",").filter(Boolean) ?? [];
  const fee = params.get("fee") ?? "";
  const groupUrl = params.get("gu") ?? "";
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
                <h2 className={styles.sectionTitle}>CHUYỂN KHOẢN PHÍ THAM GIA</h2>
                <p className={styles.instrText}>
                  Vui lòng chuyển khoản phí tham gia theo thông tin bên dưới để hoàn tất đăng ký.
                  Ban tổ chức sẽ xác nhận sau khi nhận được thanh toán.
                </p>

                <Box className={styles.bankInfoBox}>
                  <span className={styles.bankSectionLabel}>THÔNG TIN NGÂN HÀNG</span>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Ngân hàng</span>
                    <span className={styles.bankValue}>{paymentSettings.bank_name}</span>
                  </div>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Số tài khoản</span>
                    <div className={styles.bankValueGroup}>
                      <span className={styles.bankAccountValue}>{paymentSettings.bank_account}</span>
                      <CopyButton value={paymentSettings.bank_account} timeout={2000}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? "Đã sao chép!" : "Sao chép"} withArrow position="top">
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={copy}
                              className={copied ? styles.copiedButton : styles.copyButton}
                              aria-label="Sao chép số tài khoản"
                            >
                              {copied ? <Check size={13} /> : <Copy size={13} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </div>
                  </div>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Chủ tài khoản</span>
                    <span className={styles.bankValue}>{paymentSettings.account_holder}</span>
                  </div>
                </Box>

                {showFees && (
                  <Box className={styles.feeBox}>
                    <span className={styles.feeSectionLabel}>SỐ TIỀN CẦN CHUYỂN</span>
                    {fee ? (
                      <div className={styles.feeLine}>
                        <span className={styles.feeLineLabel}>Phí tham gia</span>
                        <span className={styles.feeLineAmt}>{formatVND(fee)}</span>
                      </div>
                    ) : (
                      feeLines.map((fl) => (
                        <div key={fl.cat} className={styles.feeLine}>
                          <span className={styles.feeLineLabel}>{fl.label}</span>
                          <span className={styles.feeLineAmt}>{formatVND(fl.fee!)}</span>
                        </div>
                      ))
                    )}
                  </Box>
                )}
                <div className={styles.noteBox}>
                  <p className={styles.noteItem}>
                    <span className={styles.noteBullet}>✦</span>
                    <span>Nội dung CK: <strong>Không cần ghi nội dung</strong>.</span>
                  </p>
                  <p className={styles.noteItem}>
                    <span className={styles.noteBullet}>✦</span>
                    <span>Kiểm tra trạng thái bằng nút <strong>Xem Thông Tin Đăng Ký</strong> tại trang chủ.</span>
                  </p>
                </div>
              </div>

              <div className={styles.qrSection}>
                <span className={styles.qrLabel}>QUÉT ĐỂ CHUYỂN KHOẢN</span>
                <Box className={styles.qrFrame}>
                  <Image src={paymentSettings.qr_url} alt="Mã QR chuyển khoản" w={240} h={240} fit="contain" />
                </Box>
              </div>
            </div>

            <Stack gap="sm" align="center">
              {groupUrl && (
                <Button
                  component={Link}
                  href={groupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="md"
                  className={styles.groupButton}
                >
                  THAM GIA NHÓM GIẢI ĐẤU
                </Button>
              )}
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
          </Stack>
        </Container>
      </Box>
    </>
  );
}