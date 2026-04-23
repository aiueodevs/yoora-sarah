import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { BuyerAssistant } from '@/components/buyer-assistant';
import { getStorefrontShellData } from '@/lib/storefront-catalog';
import { getStorefrontSupportContact } from '@/lib/storefront-commerce';

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
  const [{ featuredStories, footer }, supportContact] = await Promise.all([
    getStorefrontShellData(),
    getStorefrontSupportContact(),
  ]);

  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header featuredStories={featuredStories} />
            <main className="flex-1">{children}</main>
            <Footer footerData={footer} />
            <WhatsAppButton href={supportContact.whatsappHref} />
            <BuyerAssistant />
          </div>
        </Providers>
      </body>
    </html>
  );
}
