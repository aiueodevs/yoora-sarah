'use client';

import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { BrandMark } from './brand-mark';
import type { StorefrontFooterData } from '@yoora/database/catalog';

interface FooterProps {
  footerData: StorefrontFooterData;
}

export function Footer({ footerData }: FooterProps) {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/stylist') {
    return null;
  }

  return (
    <footer className="border-t border-[rgba(141,115,99,0.16)] bg-[linear-gradient(180deg,rgba(247,241,235,0.96),rgba(236,227,218,0.98))]">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 xl:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <BrandMark className="mb-6" />
            <p className="max-w-md text-sm leading-7 text-[#6f5b52]">
              {footerData.company}
            </p>
            <div className="mt-6 space-y-4 text-sm text-[#6f5b52]">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0" />
                <span>{footerData.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${footerData.phone}`} className="transition hover:text-[#241915]">
                  {footerData.phone}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="premium-kicker">
              Bantuan Belanja
            </h4>
            <ul className="mt-6 space-y-3 text-sm text-[#241915]">
              {footerData.shoppingHelp.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-[#73463b]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="premium-kicker">
              Tentang Kami
            </h4>
            <ul className="mt-6 space-y-3 text-sm text-[#241915]">
              {footerData.about.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-[#73463b]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="premium-kicker">
              Kebijakan
            </h4>
            <ul className="mt-6 space-y-3 text-sm text-[#241915]">
              {footerData.policy.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-[#73463b]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-[rgba(141,115,99,0.16)] pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[#6f5b52]">&copy; 2026 Yoora Sarah. Semua hak dilindungi.</p>
          <div className="flex flex-wrap gap-4">
            {footerData.social.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#241915] transition hover:text-[#73463b]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
