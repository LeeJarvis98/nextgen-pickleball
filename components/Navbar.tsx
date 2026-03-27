'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Group, Text, Button, Burger, Drawer, Stack, Anchor } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

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
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: scrolled ? 'rgba(14,14,14,0.95)' : 'rgba(14,14,14,0.80)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(184,255,0,0.15)',
          boxShadow: '0 0 20px rgba(184,255,0,0.05)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <Container size="xl" py="md">
          <Group justify="space-between" align="center">
            {/* Logo */}
            <Text
              style={{
                fontFamily: 'var(--font-epilogue)',
                fontSize: '1.2rem',
                fontWeight: 900,
                fontStyle: 'italic',
                letterSpacing: '-0.03em',
                color: '#B8FF00',
                cursor: 'pointer',
              }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              NEXTGEN PICKLEBALL SERIES
            </Text>

            {/* Desktop nav */}
            <Group gap="xl" visibleFrom="md">
              {navLinks.map((link) => (
                <Anchor
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  style={{
                    fontFamily: 'var(--font-space-grotesk)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: '#ADAAAA',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#B8FF00')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#ADAAAA')}
                >
                  {link.label}
                </Anchor>
              ))}
            </Group>

            {/* CTA + Burger */}
            <Group gap="sm">
              <Button
                visibleFrom="md"
                onClick={() => handleNavClick('#registration')}
                style={{
                  backgroundColor: '#B8FF00',
                  color: '#486700',
                  fontFamily: 'var(--font-space-grotesk)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                }}
              >
                REGISTER NOW
              </Button>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="md"
                color="#B8FF00"
                size="sm"
              />
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xs"
        styles={{
          content: { backgroundColor: '#0E0E0E', border: '1px solid rgba(184,255,0,0.15)' },
          header: { backgroundColor: '#0E0E0E' },
          title: { color: '#B8FF00', fontFamily: 'var(--font-epilogue)', fontWeight: 900 },
        }}
        title="NEXTGEN"
      >
        <Stack gap="lg" mt="md">
          {navLinks.map((link) => (
            <Anchor
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#ADAAAA',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              {link.label}
            </Anchor>
          ))}
          <Button
            onClick={() => handleNavClick('#registration')}
            fullWidth
            style={{
              backgroundColor: '#B8FF00',
              color: '#486700',
              fontFamily: 'var(--font-space-grotesk)',
              fontWeight: 700,
            }}
          >
            REGISTER NOW
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
