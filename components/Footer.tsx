'use client';

import { Box, Container, Group, Text, Anchor, Stack } from '@mantine/core';
import { Globe, Share2, Mail } from 'lucide-react';

const footerLinks = [
  { label: 'PRIVACY POLICY', href: '#' },
  { label: 'TERMS OF SERVICE', href: '#' },
  { label: 'CONTACT', href: '#' },
];

const socialIcons = [
  { icon: Globe, href: '#', label: 'Website' },
  { icon: Share2, href: '#', label: 'Share' },
  { icon: Mail, href: '#', label: 'Email' },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      style={{
        backgroundColor: '#0E0E0E',
        paddingTop: '3rem',
        paddingBottom: '3rem',
        borderTop: '1px solid rgba(184,255,0,0.15)',
      }}
    >
      <Container size="xl">
        <Group justify="space-between" align="center" wrap="wrap" gap="xl">
          {/* Brand */}
          <Stack gap="xs">
            <Text
              style={{
                fontFamily: 'var(--font-epilogue)',
                fontSize: '1rem',
                fontWeight: 900,
                fontStyle: 'italic',
                color: '#B8FF00',
                letterSpacing: '-0.02em',
              }}
            >
              NEXTGEN PICKLEBALL SERIES
            </Text>
            <Text
              style={{
                color: '#ADAAAA',
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                lineHeight: 1.6,
              }}
            >
              © 2026 NEXTGEN PICKLEBALL SERIES. ALL RIGHTS RESERVED.
              <br />
              TP. HCM, VIỆT NAM
            </Text>
          </Stack>

          {/* Links */}
          <Group gap="xl" wrap="wrap">
            {footerLinks.map((link) => (
              <Anchor
                key={link.label}
                href={link.href}
                style={{
                  color: '#ADAAAA',
                  fontFamily: 'var(--font-space-grotesk)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#B8FF00')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#ADAAAA')}
              >
                {link.label}
              </Anchor>
            ))}
          </Group>

          {/* Social icons */}
          <Group gap="md">
            {socialIcons.map(({ icon: Icon, href, label }) => (
              <Anchor
                key={label}
                href={href}
                aria-label={label}
                style={{
                  color: '#ADAAAA',
                  opacity: 0.8,
                  transition: 'color 0.2s, opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#B8FF00';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#ADAAAA';
                  e.currentTarget.style.opacity = '0.8';
                }}
              >
                <Icon size={20} />
              </Anchor>
            ))}
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
