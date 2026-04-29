import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { RouteShell } from '@/components/layout/route-shell';
import { BuyerAssistant } from '@/components/buyer-assistant';
import { getStorefrontShellData } from '@/lib/storefront-catalog';

export const metadata: Metadata = {
  title: 'Beranda | Yoora Sarah',
  description: 'Yoora Sarah',
  keywords: ['fashion', 'muslimah', 'dress', 'abaya', 'khimar', 'e-commerce'],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { featuredStories, footer } = await getStorefrontShellData();

  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          <RouteShell
            header={<Header featuredStories={featuredStories} />}
            main={children}
            footer={<Footer footerData={footer} />}
            overlays={<BuyerAssistant />}
          />
        </Providers>
      </body>
    </html>
  );
}
