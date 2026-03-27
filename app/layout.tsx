import type { Metadata } from 'next';
import { Epilogue, Inter, Space_Grotesk } from 'next/font/google';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { theme } from '@/theme';
import './globals.css';

const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-epilogue',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NEXTGEN PICKLEBALL SERIES | Season 1 - 2026',
  description:
    "Vietnam's Premier Pickleball Tournament. Experience the high-velocity precision of the pro-circuit in a high-performance environment.",
  keywords: ['pickleball', 'tournament', 'Vietnam', 'NextGen', 'Season 1'],
  openGraph: {
    title: 'NEXTGEN PICKLEBALL SERIES',
    description: "Vietnam's Premier Pickleball Tournament",
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${epilogue.variable} ${inter.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications position="top-right" />
          <ModalsProvider>{children}</ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
