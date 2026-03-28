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
    "Đánh thức kỹ năng tại đấu trường NextGen Pickleball đỉnh cao tại Việt Nam. Trải nghiệm không gian thi đấu chuyên nghiệp bậc nhất.",
  keywords: ['pickleball', 'tournament', 'Vietnam', 'NextGen', 'Season 1'],
  icons: {
    icon: '/favicon.webp',
  },
  openGraph: {
    title: 'NEXTGEN PICKLEBALL SERIES',
    description: "Đánh thức kỹ năng tại đấu trường NextGen Pickleball đỉnh cao tại Việt Nam. Trải nghiệm không gian thi đấu chuyên nghiệp bậc nhất.",
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${epilogue.variable} ${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
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
