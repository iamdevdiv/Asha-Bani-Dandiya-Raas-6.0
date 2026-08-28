import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { Cinzel, Cinzel_Decorative, Outfit } from 'next/font/google';
import { theme } from '@/theme';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-cinzel-decorative',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://ashabani.com'),
  title: 'Asha Bani Dandiya Raas 2026 | 6th Grand Dandiya Celebration',
  description:
    'Experience the 6th Grand Dandiya Celebration of Asha Bani Dandiya Raas in Saharanpur. Book your exclusive shopping & food stall or passes for an auspicious evening of joy, music, and festivities.',
  keywords: 'Dandiya Raas, Garba 2026, Asha Bani, Saharanpur Dandiya, Stall Booking, Festival of Lights',
  openGraph: {
    title: 'Asha Bani Dandiya Raas 2026',
    description: '6th Grand Dandiya Celebration | 6 Years of Joy, Music & Togetherness',
    images: ['/images/hero.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      {...mantineHtmlProps}
      data-mantine-color-scheme="dark"
      className={`${cinzel.variable} ${cinzelDecorative.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="ABDR 6.0" />
      </head>
      <body suppressHydrationWarning>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <ModalsProvider>
            <Notifications position="top-right" zIndex={2000} />
            {children}
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
