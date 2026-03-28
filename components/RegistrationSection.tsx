'use client';

import { useDisclosure } from '@mantine/hooks';
import { Box, Container, Grid, GridCol, Button, Group, Stack, Paper } from '@mantine/core';
import { Timer, CheckCircle, RocketIcon, ChevronLeft } from 'lucide-react';
import type { TournamentRegistration } from '@/types';
import RegisterModal from './RegisterModal';
import styles from './RegistrationSection.module.css';

export default function RegistrationSection({
  tournamentId,
  registration,
  onBack,
}: {
  tournamentId: string;
  registration: TournamentRegistration;
  onBack?: () => void;
}) {
  const [opened, { open, close }] = useDisclosure(false);

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
            {/* <Group gap="xs" align="center">
              <Timer size={16} color="#FF7351" />
              <span className={styles.deadline}>HẠN CHÓT: {registration.deadline}</span>
            </Group> */}
          </Group>

          <Paper className={`ghost-border ${styles.ctaCard}`}>
            <Box className={styles.ctaTopAccent} />

            <Grid gutter={48} align="center">
              <GridCol span={12}>
                <Stack align="center" gap="xl">
                  <h3 className={styles.ctaTitle}>
                    {registration.ctaTitle}
                  </h3>
                  <p className={styles.ctaDescription}>
                    {registration.ctaDescription}
                  </p>

                  <Button
                    onClick={open}
                    size="xl"
                    rightSection={<RocketIcon size={24} />}
                    className={styles.registerButton}
                  >
                    ĐĂNG KÝ NGAY
                  </Button>

                  {onBack && (
                    <button onClick={onBack} className={styles.backButton}>
                      <ChevronLeft size={15} />
                      <span>Chọn giải đấu khác</span>
                    </button>
                  )}

                  <Group gap="xl" wrap="wrap" justify="center">
                    {registration.features.map((item) => (
                      <Group key={item} gap={6}>
                        <CheckCircle size={16} color="#B8FF00" />
                        <span className={styles.featureItem}>{item}</span>
                      </Group>
                    ))}
                  </Group>

                  <Box className={styles.closingDivider}>
                    <Group justify="center" gap="sm" wrap="wrap">
                      <span className={styles.closingLabel}>Cổng đăng ký sẽ đóng sau:</span>
                      <span className={`neon-glow ${styles.closingTime}`}>{registration.deadlineDateTime}</span>
                    </Group>
                  </Box>
                </Stack>
              </GridCol>
            </Grid>
          </Paper>
        </Container>
      </Box>

      <RegisterModal
        opened={opened}
        onClose={close}
        tournamentId={tournamentId}
        availableCategories={registration.availableCategories}
        doublesPartnerMode={registration.doublesPartnerMode}
        categorySlots={registration.categorySlots}
        entryFeeMode={registration.entryFeeMode}
        entryFee={registration.entryFee}
        categoryFees={registration.categoryFees}
      />
    </>
  );
}