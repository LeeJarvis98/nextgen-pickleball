import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'neonLime',
  fontFamily: 'var(--font-inter), sans-serif',
  fontFamilyMonospace: 'monospace',
  headings: {
    fontFamily: 'var(--font-epilogue), sans-serif',
    fontWeight: '900',
  },
  colors: {
    neonLime: [
      '#f5ffdc',
      '#e9ffbc',
      '#d4ff80',
      '#bfff44',
      '#b8ff00',  // index 4 - primary
      '#acee00',  // index 5 - primary dim
      '#96d400',
      '#80ba00',
      '#6b9f00',
      '#415e00',  // index 9 - on-primary
    ],
    dark: [
      '#ffffff',   // 0 - on-surface
      '#adaaaa',   // 1 - on-surface-variant
      '#767575',   // 2 - outline
      '#484847',   // 3 - outline-variant
      '#262626',   // 4 - surface-container-highest
      '#201f1f',   // 5 - surface-container-high
      '#1a1919',   // 6 - surface-container
      '#131313',   // 7 - surface-container-low
      '#0e0e0e',   // 8 - surface / background
      '#000000',   // 9 - surface-container-lowest
    ],
  },
  defaultRadius: 'sm',
  radius: {
    xs: rem(2),
    sm: rem(4),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },
  defaultGradient: {
    from: 'neonLime.5',
    to: 'neonLime.4',
    deg: 135,
  },
});
