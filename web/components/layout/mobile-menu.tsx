'use client';

import Link from 'next/link';
import { Globe, Heart, Search, ShoppingBag, Sparkles, User2, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { BrandMark } from './brand-mark';
import type { CatalogFeaturedStory } from '@yoora/database/catalog';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  featuredStories: CatalogFeaturedStory[];
}

const utilityLinks = [
  { href: '/search', label: 'Cari', icon: Search },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/stylist', label: 'Stylist', icon: Sparkles },
  { href: '/cart', label: 'Keranjang', icon: ShoppingBag },
  { href: '/profile', label: 'Akun', icon: User2 },
];

function buildCuratedSections(featuredStories: CatalogFeaturedStory[]) {
  return [
    {
      title: 'Temukan',
      items: [
        {
          href: featuredStories[0]?.href ?? '/dress',
          label: 'Terbaru',
          description: 'Produk terbaru dengan tone lembut dan tampilan yang lebih rapi.',
        },
        {
          href: '/#clearance',
          label: 'Promo',
          description: 'Lihat produk promo yang sedang aktif di halaman utama.',
        },
        {
          href: '/one-set-5182',
          label: 'One Set',
          description: 'Pilih set lengkap untuk styling yang lebih cepat dan praktis.',
        },
      ],
    },
    {
      title: 'Perempuan',
      items: [
        { href: '/dress', label: 'Dress', description: 'Pilihan dress untuk harian dan acara spesial.' },
        { href: '/abaya-2481', label: 'Abaya', description: 'Layer formal dengan jatuh kain yang tenang.' },
        { href: '/hijab-1544', label: 'Hijab', description: 'Pilihan hijab yang rapi untuk setiap hari.' },
        { href: '/khimar-5295', label: 'Khimar', description: 'Coverage panjang dengan tampilan yang anggun.' },
        { href: '/pashmina-2310', label: 'Pashmina', description: 'Pashmina ringan yang mudah dipadukan.' },
      ],
    },
    {
      title: 'Koleksi',
      items: [
        { href: '/footwear-8675', label: 'Sepatu', description: 'Pelengkap tampilan yang tetap nyaman dipakai.' },
        { href: '/accessories-4472', label: 'Aksesori', description: 'Detail kecil yang membuat look terasa selesai.' },
        { href: '/essentials-7002', label: 'Essentials', description: 'Produk dasar untuk layering sehari-hari.' },
        { href: '/kids-9967', label: 'Kids', description: 'Pilihan lembut untuk momen bersama keluarga.' },
      ],
    },
  ] as const;
}

export function MobileMenu({ isOpen, onClose, featuredStories }: MobileMenuProps) {
  const pathname = usePathname();
  const curatedSections = buildCuratedSections(featuredStories);

  return (
    <div
      className={`fixed inset-0 z-[60] transition duration-300 ${
        isOpen ? 'pointer-events-auto bg-black/55 backdrop-blur-sm' : 'pointer-events-none bg-black/0'
      }`}
      aria-hidden={!isOpen}
      onClick={onClose}
    >
      <div
        className={`ml-auto flex h-full w-full max-w-sm flex-col border-l border-[rgba(141,115,99,0.12)] bg-[linear-gradient(180deg,rgba(255,252,248,0.96),rgba(242,234,226,0.94))] shadow-[-20px_0_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition duration-300 md:max-w-md ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[rgba(141,115,99,0.14)] px-5 py-4">
          <div className="premium-button-secondary px-2 py-1.5 shadow-[0_10px_24px_rgba(64,48,48,0.06)]">
            <BrandMark />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="premium-button-secondary inline-flex h-11 w-11 items-center justify-center text-[#241915] transition hover:scale-105 hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-[rgba(141,115,99,0.14)] px-5 py-4">
          <Link
            href="/search"
            onClick={onClose}
            className="premium-input block rounded-full px-4 py-3 text-sm text-[#7c665b] transition hover:-translate-y-0.5 hover:border-[rgba(77,55,46,0.24)]"
          >
            Cari produk atau kategori
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6">
          <div className="space-y-7">
            {curatedSections.map((section, sectionIndex) => (
              <section key={section.title}>
                <p className="premium-kicker">
                  {section.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {section.items.map((item, itemIndex) => {
                    const isActive =
                      item.href !== '/#clearance' &&
                      (pathname === item.href || pathname.startsWith(`${item.href}/`));

                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className={`block rounded-[1.6rem] border px-4 py-4 transition duration-300 ${
                            isActive
                              ? 'premium-panel text-[#241915] shadow-[0_18px_35px_rgba(64,48,48,0.08)]'
                              : 'premium-panel-soft text-[#241915] hover:-translate-y-0.5 hover:bg-white/90'
                          }`}
                          onClick={onClose}
                          style={{
                            transitionDelay: isOpen ? `${sectionIndex * 60 + itemIndex * 28}ms` : '0ms',
                          }}
                        >
                          <span className="text-lg font-medium">{item.label}</span>
                          <span className="mt-1 block text-sm leading-6 text-[#6f5b52]">
                            {item.description}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-[rgba(141,115,99,0.14)] px-5 py-4">
          <div className="grid grid-cols-4 gap-2">
            {utilityLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={label}
                  href={href}
                  onClick={onClose}
                  className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 transition duration-300 ${
                    isActive
                      ? 'premium-panel text-[#241915]'
                      : 'border-transparent text-[#241915] hover:border-[rgba(141,115,99,0.14)] hover:bg-white/80'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[11px] uppercase tracking-[0.18em] text-[#7c665b]">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="premium-panel mt-3 flex items-center justify-between gap-4 rounded-[1.6rem] px-4 py-3">
            <div>
              <p className="premium-kicker">
                Bahasa situs
              </p>
              <p className="mt-1 text-sm text-[#241915]">
                Konten saat ini tersedia dalam Bahasa Indonesia.
              </p>
            </div>
            <span className="premium-button-secondary inline-flex h-10 min-w-10 items-center justify-center px-3 text-xs uppercase tracking-[0.22em]">
              <Globe className="mr-1.5 h-3.5 w-3.5" />
              ID
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
