'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronDown, Heart, Menu, Search, ShoppingBag, Sparkles, User2,
  Star, Wind, Layers, Sun, Shield, Coffee, PartyPopper, Users,
  Footprints, Gem, Package, Briefcase, Home, TrendingUp, Zap, Palette
} from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MobileMenu } from './mobile-menu';
import { BrandMark } from './brand-mark';
import type { CatalogFeaturedStory } from '@yoora/database/catalog';

const motionClass =
  'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';

const navFontPreset: 'sentient-satoshi' | 'gambetta-cabinet' = 'gambetta-cabinet';

const promoMessages = [
  'Gratis Ongkir Pilihan | Temukan produk dengan promo kirim gratis minggu ini',
  'Produk Promo Hari Ini | Cek best seller dengan harga yang lebih hemat',
  'Paket Hemat One Set | Ambil look lengkap dengan penawaran set pilihan',
  'Belanja Lebih Ringan | Jelajahi koleksi favorit dan nikmati promo spesial hari ini',
  'Stok Terbatas | Simpan produk incaran ke favorit sebelum ukuran habis',
] as const;

const utilityLinks = [
  { href: '/search', icon: Search, label: 'Cari' },
  { href: '/wishlist', icon: Heart, label: 'Wishlist' },
  { href: '/cart', icon: ShoppingBag, label: 'Keranjang' },
  { href: '/profile', icon: User2, label: 'Akun' },
] as const;

interface HeaderProps {
  featuredStories: CatalogFeaturedStory[];
}

function buildPrimaryNavItems(featuredStories: CatalogFeaturedStory[]) {
  return [
    { kind: 'link', href: '/terbaru', label: 'Terbaru' },
    { kind: 'menu', key: 'women', label: 'Perempuan' },
    { kind: 'link', href: '/kids-9967', label: 'Kids' },
    { kind: 'menu', key: 'collections', label: 'Koleksi' },
    { kind: 'link', href: '/tentang-kami', label: 'Tentang Kami' },
  ] as const;
}

function buildMegaMenus(featuredStories: CatalogFeaturedStory[]) {
  return {
    women: {
      featured: {
        eyebrow: 'Edit Pilihan',
        href: featuredStories[0]?.href ?? '/dress',
        image: featuredStories[0]?.thumbnail ?? '',
        imageClassName: 'object-[center_18%]',
        title: 'Pilihan modestwear dengan siluet lembut dan terasa lebih dewasa.',
        description: 'Temukan dress, hijab, dan set pilihan yang dikurasi untuk tampilan rapi di berbagai momen.',
      },
      columns: [
        {
          title: 'Busana',
          links: [
            { href: '/dress', label: 'Dress', note: 'Pilihan dress anggun untuk momen spesial', icon: Star },
            { href: '/abaya-2481', label: 'Abaya', note: 'Layer formal dengan jatuh kain yang tenang', icon: Wind },
            { href: '/one-set-5182', label: 'One Set', note: 'Set lengkap yang memudahkan styling', icon: Layers },
          ],
        },
        {
          title: 'Hijab & Headwear',
          links: [
            { href: '/hijab-1544', label: 'Hijab', note: 'Pilihan hijab rapi untuk dipakai setiap hari', icon: Sun },
            { href: '/khimar-5295', label: 'Khimar', note: 'Coverage panjang dengan tampilan lebih anggun', icon: Shield },
            { href: '/pashmina-2310', label: 'Pashmina', note: 'Pashmina ringan yang mudah dipadukan', icon: Sparkles },
          ],
        },
        {
          title: 'Belanja per Edit',
          links: [
            { href: '/essentials-7002', label: 'Daily Ease', note: 'Produk dasar untuk layering yang rapi', icon: Coffee },
            { href: '/dress', label: 'Event Dressing', note: 'Pilihan formal yang tetap lembut dan sopan', icon: PartyPopper },
            { href: '/kids-9967', label: 'Family Moments', note: 'Pilihan serasi bernuansa lembut untuk keluarga', icon: Users },
          ],
        },
      ],
    },
    collections: {
      featured: {
        eyebrow: 'Sorotan Pilihan',
        href: featuredStories[4]?.href ?? '/one-set-5182',
        image: featuredStories[4]?.thumbnail ?? featuredStories[0]?.thumbnail ?? '',
        imageClassName: 'object-[center_24%]',
        title: 'Koleksi yang disusun berdasarkan mood, momen, dan kebutuhan styling.',
        description: 'Masuk ke edit pilihan, jalur styling, dan best seller tanpa harus membuka produk satu per satu.',
      },
      columns: [
        {
          title: 'Belanja per Kategori',
          links: [
            { href: '/footwear-8675', label: 'Sepatu', note: 'Pelengkap tampilan yang tetap nyaman dipakai', icon: Footprints },
            { href: '/accessories-4472', label: 'Aksesori', note: 'Detail kecil yang membuat tampilan terasa selesai', icon: Gem },
            { href: '/essentials-7002', label: 'Essentials', note: 'Dasar layering untuk dipakai berulang kali', icon: Package },
          ],
        },
        {
          title: 'Belanja per Momen',
          links: [
            { href: '/dress', label: 'Celebration', note: 'Pilihan untuk acara, undangan, dan momen spesial', icon: PartyPopper },
            { href: '/abaya-2481', label: 'Formal Day', note: 'Layer formal dengan garis yang lebih tegas', icon: Briefcase },
            { href: '/kids-9967', label: 'Family Edit', note: 'Pilihan serasi untuk momen keluarga', icon: Home },
          ],
        },
        {
          title: 'Highlight',
          links: [
            { href: featuredStories[3]?.href ?? '/dress', label: 'Best Seller', note: 'Produk yang paling sering dipilih saat ini', icon: TrendingUp },
            { href: featuredStories[1]?.href ?? '/dress', label: 'New Arrival', note: 'Koleksi baru dengan tone studio yang lembut', icon: Zap },
            { href: '/one-set-5182', label: 'Styling Edit', note: 'Pilihan praktis untuk look yang langsung rapi', icon: Palette },
          ],
        },
      ],
    },
  } as const;
}

type MegaMenuKey = keyof ReturnType<typeof buildMegaMenus>;

function AnimatedLabel({
  active = false,
  label,
  toneClass,
}: {
  active?: boolean;
  label: string;
  toneClass: string;
}) {
  return (
    <span className="relative block overflow-hidden">
      <span
        className={`block transition-transform ${motionClass} ${toneClass} ${
          active ? '-translate-y-full' : 'group-hover:-translate-y-full group-focus-visible:-translate-y-full'
        }`}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 block transition-transform ${motionClass} ${toneClass} ${
          active ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0'
        }`}
      >
        {label}
      </span>
    </span>
  );
}

function TopbarLink({
  href,
  isActive,
  label,
  lineClass,
  lineBaseClass,
  textClass,
  labelClass,
}: {
  href: string;
  isActive: boolean;
  label: string;
  lineClass: string;
  lineBaseClass: string;
  textClass: string;
  labelClass: string;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`group relative inline-flex items-center py-2.5 focus-visible:outline-none ${labelClass} ${motionClass}`}
    >
      <span
        className={`absolute origin-left transition-transform ${motionClass} ${lineBaseClass} ${lineClass} ${
          isActive
            ? 'scale-x-100 opacity-100'
            : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100 group-focus-visible:scale-x-100 group-focus-visible:opacity-100'
        }`}
      />
      <AnimatedLabel active={isActive} label={label} toneClass={textClass} />
    </Link>
  );
}

function UtilityIconLink({
  href,
  icon: Icon,
  isActive,
  activeClass,
  toneClass,
}: {
  href: string;
  icon: typeof Search;
  isActive: boolean;
  activeClass: string;
  toneClass: string;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`group inline-flex h-12 w-12 items-center justify-center rounded-full border transition ${motionClass} ${
        isActive
          ? activeClass
          : `${toneClass} border-transparent hover:border-white/18 hover:bg-white/10`
      }`}
    >
      <Icon className={`h-[1.18rem] w-[1.18rem] transition-transform ${motionClass} group-hover:scale-110`} />
    </Link>
  );
}

function PromoMarquee({ isHome }: { isHome: boolean }) {
  if (!isHome) {
    return null;
  }

  const marqueeItems = [...promoMessages, ...promoMessages];

  return (
    <div className="mb-0 overflow-hidden rounded-sm bg-[linear-gradient(135deg,rgba(255,248,244,0.32),rgba(255,240,232,0.14))] shadow-[0_18px_45px_rgba(10,8,7,0.12)] backdrop-blur-[18px]">
      <div className="flex whitespace-nowrap py-2 text-[0.62rem] uppercase tracking-[0.24em] text-[#fff8f3]/88">
        <div className="flex min-w-max items-center animate-marquee motion-reduce:animate-none">
          {marqueeItems.map((message, index) => (
            <span key={`${message}-${index}`} className="inline-flex items-center">
              <span className="px-4">{message}</span>
              <span aria-hidden="true" className="text-[#fff8f3]/44">
                +
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header({ featuredStories }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const primaryNavItems = buildPrimaryNavItems(featuredStories);
  const megaMenus = buildMegaMenus(featuredStories);
  const [openMenu, setOpenMenu] = useState<MegaMenuKey | null>(null);
  const pathname = usePathname();
  const isHome = pathname === '/';

  const textClass = isHome
    ? 'text-[#4f3f38] group-hover:text-[#231915] group-focus-visible:text-[#231915]'
    : 'text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] group-focus-visible:text-[hsl(var(--foreground))]';
  const activeTextClass = isHome
    ? 'text-[#241915]'
    : 'text-[hsl(var(--foreground))]';
  const lineClass = isHome ? 'bg-[#3a2b25]' : 'bg-[hsl(var(--foreground))]';
  const topbarBackgroundClass = isHome ? 'bg-transparent' : 'bg-[hsla(var(--background),0.92)]';
  const iconToneClass = isHome
    ? 'text-[#4f3f38] hover:text-[#231915]'
    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]';
  const megaPanelClass =
    'border-[rgba(166,132,111,0.2)] bg-[linear-gradient(180deg,rgba(255,252,248,0.97),rgba(242,233,224,0.95))] text-[#241915] shadow-[0_42px_120px_rgba(52,34,24,0.18)] backdrop-blur-[22px]';
  const megaColumnShellClass =
    'rounded-[1.7rem] border border-[rgba(166,132,111,0.16)] bg-[linear-gradient(180deg,rgba(255,250,246,0.95),rgba(247,239,232,0.9))] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]';
  const megaLinkClass =
    'group relative isolate block overflow-hidden rounded-[1.1rem] border border-transparent px-3.5 py-3 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[rgba(125,92,76,0.2)] hover:bg-[rgba(255,255,255,0.78)] hover:shadow-[0_14px_28px_rgba(58,39,28,0.08)] focus-visible:-translate-y-0.5 focus-visible:border-[rgba(125,92,76,0.22)] focus-visible:bg-[rgba(255,255,255,0.8)] focus-visible:shadow-[0_14px_28px_rgba(58,39,28,0.08)] focus-visible:outline-none motion-reduce:transform-none';
  const megaSubtleTextClass = 'text-[#725d54]';
  const megaEyebrowClass = 'text-[0.62rem] uppercase tracking-[0.28em] text-[#9a7b6b]';
  const megaFeaturedClass =
    'group overflow-hidden rounded-[2rem] border border-[rgba(166,132,111,0.18)] bg-[linear-gradient(180deg,rgba(255,251,247,0.98),rgba(246,238,230,0.94))] shadow-[0_24px_60px_rgba(58,39,28,0.1)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[rgba(112,81,65,0.24)] hover:shadow-[0_30px_75px_rgba(58,39,28,0.14)] focus-visible:-translate-y-0.5 focus-visible:border-[rgba(112,81,65,0.24)] focus-visible:shadow-[0_30px_75px_rgba(58,39,28,0.14)] focus-visible:outline-none motion-reduce:transform-none';
  const navDisplayFontClass = navFontPreset === 'sentient-satoshi' ? 'font-nav-sentient' : 'font-nav-gambetta';
  const navLineBaseClass = 'inset-x-[0.14rem] bottom-[0.1rem] h-[1.5px] rounded-full';
  const navLabelClass =
    `${navDisplayFontClass} text-[0.98rem] font-bold uppercase leading-none tracking-[0.065em] xl:text-[1.04rem]`;
  const navButtonClass = `group relative inline-flex items-center gap-1.5 py-2.5 focus-visible:outline-none ${navLabelClass} ${motionClass}`;
  const navUtilityButtonClass =
    `${navDisplayFontClass} text-[0.94rem] font-bold uppercase tracking-[0.05em]`;
  const navInlineIconClass = 'mt-[0.06em] h-[1.08em] w-[1.08em] shrink-0';

  const currentMenu = openMenu ? megaMenus[openMenu] : null;

  const utilityActiveClass = isHome
    ? 'border-[#9f8a7e]/38 bg-[rgba(255,248,243,0.22)] text-[#231915] shadow-[0_10px_24px_rgba(10,8,7,0.12)]'
    : 'border-[hsl(var(--line-strong))] bg-white text-[hsl(var(--foreground))]';

  return (
    <header
      className={`top-0 z-50 transition-all duration-300 ${
        isHome ? 'fixed inset-x-0' : 'sticky backdrop-blur-xl'
      }`}
    >
      <PromoMarquee isHome={isHome} />
      <div className="mx-auto max-w-[92rem] px-4 md:px-6 xl:px-10">
        <div
          className={`relative flex items-center gap-4 py-1 md:gap-6 md:py-1.5 ${topbarBackgroundClass}`}
          onMouseLeave={() => setOpenMenu(null)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setOpenMenu(null);
            }
          }}
        >
          <BrandMark className="shrink-0" />

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-6 xl:flex 2xl:gap-7">
            {primaryNavItems.map((item) => {
              if (item.kind === 'link') {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <TopbarLink
                    key={item.label}
                    href={item.href}
                    isActive={isActive}
                    label={item.label}
                    lineClass={lineClass}
                    lineBaseClass={navLineBaseClass}
                    labelClass={navLabelClass}
                    textClass={isActive ? activeTextClass : textClass}
                  />
                );
              }

              const isMenuActive = openMenu === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  aria-expanded={isMenuActive}
                  aria-haspopup="dialog"
                  onMouseEnter={() => setOpenMenu(item.key)}
                  onFocus={() => setOpenMenu(item.key)}
                  className={navButtonClass}
                >
                  <span
                    className={`absolute origin-left transition-transform ${motionClass} ${navLineBaseClass} ${lineClass} ${
                      isMenuActive
                        ? 'scale-x-100 opacity-100'
                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100 group-focus-visible:scale-x-100 group-focus-visible:opacity-100'
                    }`}
                  />
                  <AnimatedLabel
                    active={isMenuActive}
                    label={item.label}
                    toneClass={isMenuActive ? activeTextClass : textClass}
                  />
                  <ChevronDown
                    className={`${navInlineIconClass} opacity-80 transition-transform ${motionClass} ${
                      isMenuActive ? 'rotate-180 text-current' : ''
                    } ${isHome ? 'text-[#5e4d45]' : 'text-[hsl(var(--muted-foreground))]'}`}
                  />
                </button>
              );
            })}

            <div className="flex items-center gap-6">
              <TopbarLink
                href="/stylist"
                isActive={pathname === '/stylist'}
                label="STYLIST"
                lineClass={lineClass}
                lineBaseClass={navLineBaseClass}
                labelClass={navLabelClass}
                textClass={pathname === '/stylist' ? activeTextClass : textClass}
              />

              <Link
                href="/one-set-5182"
                className={`inline-flex items-center rounded-full border px-[1.35rem] py-[0.72rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.52)] backdrop-blur-md ${navUtilityButtonClass} transition-all ${motionClass} ${
                  isHome
                    ? 'border-[#a88f83]/42 bg-[linear-gradient(180deg,rgba(255,250,246,0.26),rgba(255,241,233,0.18))] text-[#231915] hover:border-[#7d665d]/52 hover:bg-[linear-gradient(180deg,rgba(255,250,246,0.34),rgba(255,241,233,0.24))] hover:text-[#160f0d]'
                    : 'border-[hsl(var(--line-strong))] bg-white/88 text-[hsl(var(--foreground))] hover:border-[hsl(var(--foreground))]'
                }`}
              >
                One Set
              </Link>
            </div>
          </nav>

          <button
            type="button"
            aria-label="Buka daftar kategori"
            onClick={() => setIsMenuOpen(true)}
            className={`group relative hidden items-center py-2.5 focus-visible:outline-none ${navLabelClass} ${motionClass} lg:inline-flex xl:hidden`}
          >
            <span
              className={`absolute origin-left transition-transform ${motionClass} ${navLineBaseClass} ${lineClass} scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100 group-focus-visible:scale-x-100 group-focus-visible:opacity-100`}
              aria-hidden="true"
            />
            <AnimatedLabel label="Collections" toneClass={textClass} />
          </button>

          <div className="ml-auto hidden items-center gap-2 lg:flex xl:ml-0">
            {utilityLinks.map((item) => (
              <UtilityIconLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                activeClass={utilityActiveClass}
                toneClass={iconToneClass}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setIsMenuOpen(true)}
            className={`group ml-auto inline-flex items-center gap-2.5 py-2.5 ${navDisplayFontClass} text-[0.94rem] font-bold uppercase tracking-[0.065em] focus-visible:outline-none ${motionClass} lg:hidden`}
          >
            <span
              className={
                isHome
                  ? 'text-[#241915]'
                  : 'text-[hsl(var(--foreground))]'
              }
            >
              Menu
            </span>
            <Menu
              className={`${navInlineIconClass} transition-transform ${motionClass} ${
                isHome ? 'text-[#241915]' : 'text-[hsl(var(--foreground))]'
              } group-hover:rotate-[-12deg] group-hover:scale-105`}
            />
          </button>

          <div
            className={`pointer-events-none absolute left-0 right-0 top-full z-[100] hidden pt-4 opacity-0 transition-opacity duration-200 xl:block ${
              currentMenu ? 'pointer-events-auto opacity-100' : ''
            }`}
          >
            {currentMenu ? (
              <section className={`relative overflow-hidden rounded-[2rem] border ${megaPanelClass}`}>
                <div className="absolute inset-x-12 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(173,136,112,0.58),transparent)]" />
                <div className="grid gap-6 p-6 xl:grid-cols-[1.55fr_0.95fr] 2xl:p-7">
                  <div className="grid gap-4 md:grid-cols-3">
                    {currentMenu.columns.map((column) => (
                      <div key={column.title} className={`${megaColumnShellClass} p-3.5`}>
                        <p className={megaEyebrowClass}>{column.title}</p>
                        <div className="mt-3.5 space-y-1.5">
                          {column.links.map((link) => (
                            <Link
                              key={link.label}
                              href={link.href}
                              className={megaLinkClass}
                            >
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_62%)] opacity-0 transition duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                              />
                              <div className="flex items-start gap-3.5">
                                {'icon' in link && (
                                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,252,248,0.8)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_8px_rgba(58,39,28,0.04)] border border-[rgba(166,132,111,0.12)] transition-all duration-500 ease-out group-hover:bg-white group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_12px_rgba(58,39,28,0.08)] group-hover:scale-105 group-hover:-translate-y-0.5">
                                    <link.icon className="h-[1.1rem] w-[1.1rem] text-[#8a6c5f] transition-colors duration-500 group-hover:text-[#5e4d45]" strokeWidth={1.75} />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-[0.98rem] font-medium tracking-[0.01em] text-[#2f211c] transition duration-300 group-hover:translate-x-0.5 group-hover:text-[#211511] group-focus-visible:translate-x-0.5 group-focus-visible:text-[#211511] motion-reduce:transform-none">
                                      {link.label}
                                    </p>
                                    <span className="inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-[#a2806e] transition duration-300 group-hover:translate-x-0.5 group-hover:text-[#735247] group-focus-visible:translate-x-0.5 group-focus-visible:text-[#735247] motion-reduce:transform-none">
                                      <span
                                        aria-hidden="true"
                                        className="h-px w-2 bg-current opacity-45 transition-all duration-300 group-hover:w-3.5 group-hover:opacity-100 group-focus-visible:w-3.5 group-focus-visible:opacity-100"
                                      />
                                      Lihat
                                    </span>
                                  </div>
                                  <p
                                    className={`mt-1 text-[0.8rem] leading-[1.5] transition-colors duration-300 group-hover:text-[#5f4a41] group-focus-visible:text-[#5f4a41] ${megaSubtleTextClass}`}
                                  >
                                    {link.note}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={currentMenu.featured.href}
                    className={megaFeaturedClass}
                  >
                    <div className="relative isolate h-[11.5rem] overflow-hidden bg-[#eadfd5]">
                      {currentMenu.featured.image ? (
                        <Image
                          src={currentMenu.featured.image}
                          alt={currentMenu.featured.title}
                          fill
                          sizes="(min-width: 1536px) 24rem, (min-width: 1280px) 20rem, 100vw"
                          className={`object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transform-none ${currentMenu.featured.imageClassName} group-hover:scale-[1.045] group-hover:-translate-y-1`}
                        />
                      ) : null}
                      <div className="absolute inset-x-4 top-4 h-16 rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.2),transparent)] opacity-90 blur-xl" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(35,23,18,0.52)] via-[rgba(35,23,18,0.08)] to-[rgba(255,255,255,0.08)]" />
                      <div className="absolute inset-x-5 bottom-5 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0.58),rgba(255,255,255,0.12))]" />
                      <div className="absolute left-5 top-5 rounded-full border border-white/34 bg-[rgba(255,251,247,0.18)] px-2.5 py-1 text-[0.52rem] uppercase tracking-[0.24em] text-white backdrop-blur-xl">
                        Signature Edit
                      </div>
                    </div>
                    <div className="p-5">
                      <div className={`inline-flex items-center gap-2 ${megaEyebrowClass}`}>
                        <Sparkles className="h-3 w-3 text-[#a2806e]" />
                        {currentMenu.featured.eyebrow}
                      </div>
                      <h2 className="mt-3 font-display text-[1.65rem] leading-[1.05] tracking-[-0.04em] text-[#241915]">
                        {currentMenu.featured.title}
                      </h2>
                      <p className={`mt-3 max-w-sm text-[0.85rem] leading-[1.6] ${megaSubtleTextClass}`}>
                        {currentMenu.featured.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[rgba(166,132,111,0.14)] pt-4">
                        <span className="text-[0.78rem] leading-[1.5] text-[#6e574d]">
                          Kurasi produk, momen, dan styling.
                        </span>
                        <span className="inline-flex shrink-0 rounded-full border border-[rgba(166,132,111,0.16)] bg-[rgba(255,250,245,0.88)] px-3.5 py-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-[#3a2822]">
                        Lihat Koleksi
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        featuredStories={featuredStories}
      />
    </header>
  );
}
