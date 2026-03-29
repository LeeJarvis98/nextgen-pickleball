'use client';

import Link from 'next/link';
import { Box, Container, Group, Stack, ActionIcon, Tooltip, Image } from '@mantine/core';
import { CopyButton } from '@mantine/core';
import { ArrowLeft, Copy, Check, Landmark } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './PaymentInfoPage.module.css';

interface PaymentSettings {
  bank_name: string;
  bank_account: string;
  account_holder: string;
  qr_url: string;
}

export default function PaymentInfoPage({ paymentSettings }: { paymentSettings: PaymentSettings }) {
  return (
    <>
      <Navbar />
      <Box className={styles.page}>
        <Container size="md" py={64}>
          <Stack gap={40} align="center">

            {/* Back link */}
            <Group w="100%">
              <Link href="/" className={styles.backLink}>
                <ArrowLeft size={14} />
                Về trang chủ
              </Link>
            </Group>

            {/* Header */}
            <Stack align="center" gap="md">
              <Box className={styles.iconRing}>
                <Landmark size={38} color="#b8ff00" strokeWidth={1.5} />
              </Box>
              <h1 className={styles.heading}>THÔNG TIN CHUYỂN KHOẢN</h1>
              <p className={styles.subheading}>
                Chuyển khoản phí tham gia đến tài khoản bên dưới sau khi hoàn tất đăng ký để chính thức giữ chỗ.
              </p>
            </Stack>

            {/* Payment card */}
            <Box className={styles.paymentCard}>
              {/* Left: bank details */}
              <Stack gap={20} className={styles.bankSide}>
                <Box className={styles.bankInfoBox}>
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
                          <Tooltip label={copied ? 'Đã sao chép!' : 'Sao chép'} withArrow position="top">
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

                <div className={styles.noteBox}>
                  <p className={styles.noteItem}>
                    <span className={styles.noteBullet}>✦</span>
                    <span>Nội dung CK: <strong>Không cần ghi nội dung</strong>.</span>
                  </p>
                  <p className={styles.noteItem}>
                    <span className={styles.noteBullet}>✦</span>
                    <span>Sau khi chuyển khoản, dùng nút <strong>Tra Cứu Đăng Ký</strong> tại trang chủ để kiểm tra trạng thái.</span>
                  </p>
                  <p className={styles.noteItem}>
                    <span className={styles.noteBullet}>✦</span>
                    <span>Ban tổ chức sẽ xác nhận trong vòng <strong>24 giờ</strong> sau khi nhận được thanh toán.</span>
                  </p>
                </div>
              </Stack>

              {/* Right: QR */}
              <Stack align="center" gap={12} className={styles.qrSide}>
                <Box className={styles.qrFrame}>
                  <Image
                    src={paymentSettings.qr_url}
                    alt="Mã QR chuyển khoản"
                    w={220}
                    h={220}
                    fit="contain"
                  />
                </Box>
              </Stack>
            </Box>

          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
