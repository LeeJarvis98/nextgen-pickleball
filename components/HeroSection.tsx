'use client';

import { Box, Container, Grid, GridCol, Button, Group, Stack, Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ArrowRight, Info, Search } from 'lucide-react';
import styles from './HeroSection.module.css';
import TrackStatusModal from './TrackStatusModal';

export default function HeroSection() {
  const [trackOpened, { open: openTrack, close: closeTrack }] = useDisclosure(false);
  return (
    <>
    <Box component="section" className={`diagonal-texture ${styles.section}`}>
      <Box className={styles.gradientOverlay} />

      <Container size="xl" className={styles.content} py={80}>
        <Grid gutter="xl" align="center">
          <GridCol span={{ base: 12, lg: 8 }}>
            <Stack gap="xl">
              <Box className={styles.seasonBadge}>
                <span className={styles.seasonLabel}>SEASON 1</span>
              </Box>

              <Box>
                <Image
                  src="/logos/Nextgen_Logo.webp"
                  alt="NextGen Pickleball Series"
                  className={styles.heroLogo}
                  fit="contain"
                />
              </Box>

              <p className={styles.subtitle}>
                Đánh thức kỹ năng tại đấu trường NextGen Pickleball đỉnh cao tại Việt Nam. Trải nghiệm không gian thi đấu chuyên nghiệp bậc nhất.
              </p>

              <Group gap="md" wrap="wrap">
                <Button
                  component="a"
                  href="#tournament-info"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#tournament-info')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  size="lg"
                  rightSection={<ArrowRight size={18} />}
                  className={styles.ctaPrimary}
                >
                  ĐĂNG KÝ NGAY
                </Button>
                <Button
                  onClick={openTrack}
                  size="lg"
                  variant="outline"
                  className={`ghost-border ${styles.ctaSecondary}`}
                  leftSection={<Search size={18} />}
                >
                  XEM THÔNG TIN ĐĂNG KÝ
                </Button>
              </Group>
            </Stack>
          </GridCol>

          <GridCol span={{ base: 0, lg: 4 }} visibleFrom="lg">
            <Box className={styles.imageWrapper}>
              <Box className={styles.imageGlow} />
              <Image
                src="/hero.webp"
                alt="Pickleball Action"
                radius="md"
                className={`ghost-border ${styles.heroImage}`}
              />
            </Box>
          </GridCol>
        </Grid>
      </Container>
    </Box>
    <TrackStatusModal opened={trackOpened} onClose={closeTrack} />
    </>
  );
}