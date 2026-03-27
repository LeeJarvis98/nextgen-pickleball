'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Group, Button, Burger, Drawer, Stack, Anchor } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import styles from './Navbar.module.css';

const navLinks = [
  { label: 'TOURNAMENT', href: '#tournament-info' },
  { label: 'PRIZES', href: '#prizes' },
  { label: 'REGISTRATION', href: '#registration' },
  { label: 'SCHEDULE', href: '#tournament-info' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [opened, { toggle, close }] = useDisclosure(false);

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

            <Group gap="xl" visibleFrom="md">
              {navLinks.map((link) => (
                <Anchor
                  key={link.label}
                  className={styles.navLink}
                  onClick={() => handleNavClick(link.href)}
                >
                  {link.label}
                </Anchor>
              ))}
            </Group>

            <Group gap="sm">
              <Button
                visibleFrom="md"
                className={styles.ctaButton}
                onClick={() => handleNavClick('#registration')}
              >
                REGISTER NOW
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
          {navLinks.map((link) => (
            <Anchor
              key={link.label}
              className={styles.drawerNavLink}
              onClick={() => handleNavClick(link.href)}
            >
              {link.label}
            </Anchor>
          ))}
          <Button
            className={styles.drawerCtaButton}
            onClick={() => handleNavClick('#registration')}
            fullWidth
          >
            REGISTER NOW
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}