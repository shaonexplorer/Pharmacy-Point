import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/providers/providers';
import { Navigation } from '@/components/navigation';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

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
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
        style={{
          fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        <Providers>
          <Navigation>{children}</Navigation>
        </Providers>
      </body>
    </html>
  );
}
