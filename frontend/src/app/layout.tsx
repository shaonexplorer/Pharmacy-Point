import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/providers/providers';
import { Navigation } from '@/components/navigation';

import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Theme flicker-prevention script: runs before React hydration to read the
// saved theme preference (or system default) and apply the .dark class on <html>.
// Dark mode variables are defined ONLY in the .dark class block in globals.css,
// NOT via @media (prefers-color-scheme) — this allows explicit Light mode even
// when the OS/browser is set to dark.
function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var stored = localStorage.getItem('theme');
            var isDark;
            if (stored === 'dark') {
              isDark = true;
            } else if (stored === 'light') {
              isDark = false;
            } else {
              isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            document.documentElement.classList[isDark ? 'add' : 'remove']('dark');
          })();
        `,
      }}
    />
  );
}

export const metadata: Metadata = {
  title: 'Pharmacy Point',
  description: 'Pharmacy Management System',
  keywords: 'pharmacy, medication, POS, inventory, healthcare',
  authors: [{ name: 'Pharmacy Point' }],
  openGraph: {
    title: 'Pharmacy Point — Clinical Precision',
    description: 'Pharmacy Management System',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
        style={{
          fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        <Providers>
          <ThemeProvider>
            <Navigation>{children}</Navigation>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
