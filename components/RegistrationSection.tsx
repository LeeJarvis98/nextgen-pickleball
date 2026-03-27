'use client';

import { useDisclosure } from '@mantine/hooks';
import { Box, Container, Grid, GridCol, Button, Group, Stack, Center, Paper } from '@mantine/core';
import { Timer, CheckCircle, QrCode, RocketIcon } from 'lucide-react';
import RegisterModal from './RegisterModal';
import styles from './RegistrationSection.module.css';

function StepCircle({ number, active }: { number: number; active?: boolean }) {
  return (
    <Center className={active ? styles.stepCircleActive : styles.stepCircleInactive}>
      {number}
    </Center>
  );
}

export default function RegistrationSection() {
  const [opened, { open, close }] = useDisclosure(false);

  const steps = ['Điền Form', 'Xác Nhận', 'Hoàn Tất'];

  return (
    <>
      <Box component="section" id="registration" className={styles.section}>
        <Container size="xl">
          <Group justify="space-between" align="flex-end" mb={64} wrap="wrap" gap="md">
            <Box>
              <Box className={styles.accentBar} />
              <span className={styles.sectionLabel}>ĐĂNG KÝ THAM DỰ</span>
              <h2 className={styles.sectionTitle}>Sẵn Sàng Chinh Phục?</h2>
            </Box>
            <Group gap="xs" align="center">
              <Timer size={16} color="#FF7351" />
              <span className={styles.deadline}>HẠN CHÓT: 10/03/2026</span>
            </Group>
          </Group>

          <Box className={styles.stepsWrapper}>
            <Group justify="space-between" align="flex-start" style={{ position: 'relative' }}>
              <Box className={styles.stepConnector} />
              {steps.map((label, i) => (
                <Stack key={label} align="center" gap="xs" style={{ flex: 1 }}>
                  <StepCircle number={i + 1} active={i === 0} />
                  <span className={styles.stepLabel}>{label}</span>
                </Stack>
              ))}
            </Group>
          </Box>

          <Paper className={`ghost-border ${styles.ctaCard}`}>
            <Box className={styles.ctaTopAccent} />

            <Grid gutter={48} align="center">
              <GridCol span={{ base: 12, lg: 4 }}>
                <Stack align="center" pb="2rem">
                  <Box className={styles.qrBox}>
                    <QrCode size={80} color="#0E0E0E" />
                    <span className={styles.qrLabel}>Scan to register</span>
                  </Box>
                  <p className={styles.qrSubtext}>
                    Scan QR hoặc truy cập:
                    <br />
                    <span className={styles.qrLink}>bit.ly/nextgen-s1</span>
                  </p>
                </Stack>
              </GridCol>

              <GridCol span={{ base: 12, lg: 8 }}>
                <Stack align="center" gap="xl">
                  <h3 className={styles.ctaTitle}>
                    Trở thành nhà vô địch NextGen Season 1
                  </h3>
                  <p className={styles.ctaDescription}>
                    Hệ thống giải đấu chuyên nghiệp, tổ chức bài bản cùng đội ngũ trọng tài uy
                    tín. Đừng bỏ lỡ cơ hội khẳng định bản thân tại NextGen Season 1.
                  </p>

                  <Button
                    onClick={open}
                    size="xl"
                    rightSection={<RocketIcon size={24} />}
                    className={styles.registerButton}
                  >
                    ĐĂNG KÝ NGAY
                  </Button>

                  <Group gap="xl" wrap="wrap" justify="center">
                    {['Thi đấu 1vs1 & 2vs2', 'Trọng tài chuyên nghiệp', 'Giải thưởng hấp dẫn'].map(
                      (item) => (
                        <Group key={item} gap={6}>
                          <CheckCircle size={16} color="#B8FF00" />
                          <span className={styles.featureItem}>{item}</span>
                        </Group>
                      )
                    )}
                  </Group>

                  <Box className={styles.closingDivider}>
                    <Group justify="center" gap="sm" wrap="wrap">
                      <span className={styles.closingLabel}>Cổng đăng ký sẽ đóng sau:</span>
                      <span className={`neon-glow ${styles.closingTime}`}>23:59 · 10.03.2026</span>
                    </Group>
                  </Box>
                </Stack>
              </GridCol>
            </Grid>
          </Paper>
        </Container>
      </Box>

      <RegisterModal opened={opened} onClose={close} />
    </>
  );
}