'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Group, Button, Burger, Drawer, Stack, Anchor } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import TrackStatusModal from './TrackStatusModal';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [opened, { toggle, close }] = useDisclosure(false);
  const [trackOpened, { open: openTrack, close: closeTrack }] = useDisclosure(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    close();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Box
        component="nav"
        className={`${styles.nav} ${scrolled ? styles.navScrolled : styles.navTop}`}
      >
        <Container size="xl" py="md">
          <Group justify="space-between" align="center">
            <span
              className={styles.logo}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              NEXTGEN PICKLEBALL SERIES
            </span>

            <Group gap="sm">
              <Button
                visibleFrom="md"
                variant="outline"
                className={styles.trackButton}
                onClick={openTrack}
              >
                XEM ĐĂNG KÝ
              </Button>
              <Button
                visibleFrom="md"
                className={styles.ctaButton}
                onClick={() => handleNavClick('#tournament-info')}
              >
                ĐĂNG KÝ NGAY
              </Button>
              <Burger opened={opened} onClick={toggle} hiddenFrom="md" color="#B8FF00" size="sm" />
            </Group>
          </Group>
        </Container>
      </Box>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xs"
        classNames={{
          content: styles.drawerContent,
          header: styles.drawerHeader,
          title: styles.drawerTitle,
        }}
        title="NEXTGEN"
      >
        <Stack gap="lg" mt="md">
          <Button
            variant="outline"
            className={styles.drawerTrackButton}
            onClick={() => { close(); openTrack(); }}
            fullWidth
          >
            XEM THÔNG TIN ĐĂNG KÝ
          </Button>
          <Button
            className={styles.drawerCtaButton}
            onClick={() => handleNavClick('#registration')}
            fullWidth
          >
            ĐĂNG KÝ NGAY
          </Button>
        </Stack>
      </Drawer>

      <TrackStatusModal opened={trackOpened} onClose={closeTrack} />
    </>
  );
}