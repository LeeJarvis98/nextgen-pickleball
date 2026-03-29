'use client';

import Link from 'next/link';
import { Box, Container, Group, Stack, Anchor } from '@mantine/core';
import { Globe, Share2, Mail } from 'lucide-react';
import styles from './Footer.module.css';

const footerLinks = [
  { label: 'THÔNG TIN CHUYỂN KHOẢN', href: '/payment-info' },
  { label: 'ĐIỀU KHOẢN', href: '#' },
  { label: 'LIÊN HỆ', href: '#' },
];

const socialIcons = [
  { icon: Globe, href: '#', label: 'Website' },
  { icon: Share2, href: '#', label: 'Share' },
  { icon: Mail, href: '#', label: 'Email' },
];

export default function Footer() {
  return (
    <Box component="footer" className={styles.footer}>
      <Container size="xl">
        <Group justify="space-between" align="center" wrap="wrap" gap="xl">
          <Stack gap="xs">
            <span className={styles.brand}>NEXTGEN PICKLEBALL SERIES</span>
            <p className={styles.copyright}>
              © 2026 NEXTGEN PICKLEBALL SERIES. ALL RIGHTS RESERVED.
              <br />
              TP. HCM, VIỆT NAM
            </p>
          </Stack>

          <Group gap="xl" wrap="wrap" visibleFrom="md">
            {footerLinks.map((link) => (
              <Anchor key={link.label} href={link.href} className={styles.footerLink}>
                {link.label}
              </Anchor>
            ))}
          </Group>

          <Group gap="md" align="center">
            {socialIcons.map(({ icon: Icon, href, label }) => (
              <Anchor key={label} href={href} aria-label={label} className={styles.socialIcon} visibleFrom="md">
                <Icon size={20} />
              </Anchor>
            ))}
            <Link href="/admin/login" className={styles.adminLink} aria-label="Admin">
              ADMIN
            </Link>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}