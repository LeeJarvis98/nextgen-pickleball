'use client';

import { Box, Container, Grid, GridCol, Button, Group, Stack, Image } from '@mantine/core';
import { ArrowRight, Info } from 'lucide-react';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <Box component="section" className={`diagonal-texture ${styles.section}`}>
      <Box className={styles.gradientOverlay} />

      <Container size="xl" className={styles.content} py={80}>
        <Grid gutter="xl" align="center">
          <GridCol span={{ base: 12, lg: 8 }}>
            <Stack gap="xl">
              <Box className={styles.seasonBadge}>
                <span className={styles.seasonLabel}>SEASON 1 · 2026</span>
              </Box>

              <Box>
                <h1 className={styles.headlineWhite}>NEXTGEN</h1>
                <span className={styles.headlineLime}>PICKLEBALL SERIES</span>
              </Box>

              <p className={styles.subtitle}>
                Vietnam&apos;s Premier Pickleball Tournament. Experience the high-velocity precision
                of the pro-circuit in a high-performance environment.
              </p>

              <Group gap="md" wrap="wrap">
                <Button
                  component="a"
                  href="#registration"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#registration')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  size="lg"
                  rightSection={<ArrowRight size={18} />}
                  className={styles.ctaPrimary}
                >
                  ĐĂNG KÝ NGAY
                </Button>
                <Button
                  component="a"
                  href="#tournament-info"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#tournament-info')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  size="lg"
                  variant="outline"
                  className={`ghost-border ${styles.ctaSecondary}`}
                  leftSection={<Info size={18} />}
                >
                  XEM THÔNG TIN
                </Button>
              </Group>
            </Stack>
          </GridCol>

          <GridCol span={{ base: 0, lg: 4 }} visibleFrom="lg">
            <Box className={styles.imageWrapper}>
              <Box className={styles.imageGlow} />
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2wV7EYRRs4Hd5hlvF6QNau1-hZn9Dwo_QjoeWKKW8LyltcmkjtgMNdLRMoxpZ_-E0GgndkHeozcxesTu6N86HSteNSDNtsJ9wmcsOUbhVyUUjNYOAJDD5gtqWxzufd3tiffrLqptBL45BwOZhyKC0Gilr7eno4T9k-ulpijqisaHoBJf8MVGdpszXWy_GHn1nPdK6cDe8lO5VGvHt2NCnJas84Rnnbmt_cWqQAnaxH5u6jX6LGayQd1dzjNhNTuHhylBNu3XVUs0w"
                alt="Pickleball Action"
                radius="md"
                className={`ghost-border ${styles.heroImage}`}
              />
            </Box>
          </GridCol>
        </Grid>
      </Container>
    </Box>
  );
}