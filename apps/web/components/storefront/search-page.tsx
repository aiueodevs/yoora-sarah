'use client';

import Link from 'next/link';
import { Search, Sparkles } from 'lucide-react';
import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { ProductCard } from '@/components/product/product-card';
import type {
  CatalogCategory,
  CatalogProductDetail,
  StorefrontQuickLink,
} from '@yoora/database/catalog';

interface StorefrontSearchPageProps {
  featuredCategories: CatalogCategory[];
  products: CatalogProductDetail[];
  searchPrompts: string[];
  utilityQuickLinks: StorefrontQuickLink[];
}

export function StorefrontSearchPage({
  featuredCategories,
  products,
  searchPrompts,
  utilityQuickLinks,
}: StorefrontSearchPageProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const deferredQuery = useDeferredValue(query);
  const categoryLabelBySlug = useMemo(
    () =>
      Object.fromEntries(
        featuredCategories.map((category) => [category.slug, category.name])
      ) as Record<string, string>,
    [featuredCategories]
  );

  const results = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.categorySlug,
        categoryLabelBySlug[product.categorySlug] ?? product.categorySlug,
        ...product.colors.map((color) => color.name),
      ]
        .join(' ')
        .toLowerCase();

      const matchesQuery = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      const matchesCategory =
        activeCategory === 'all' ? true : product.categorySlug === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, categoryLabelBySlug, deferredQuery, products]);

  return (
    <div className="premium-page px-4 pb-20 pt-24 md:px-6 md:pt-32 xl:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="premium-shell page-reveal grid gap-8 rounded-[2.5rem] p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div>
            <p className="premium-kicker">Pencarian koleksi</p>
            <h1 className="premium-title-xl mt-4">Temukan produk yang paling sesuai dengan kebutuhan Anda.</h1>
            <p className="premium-copy mt-5 max-w-2xl">
              Cari berdasarkan nama produk, kategori, atau warna. Hasil akan langsung menyesuaikan agar Anda bisa membandingkan pilihan dengan cepat.
            </p>

            <label className="premium-input mt-8 flex items-center gap-3 rounded-full px-5 py-4 focus-within:border-[rgba(77,55,46,0.24)] focus-within:bg-white">
              <Search className="h-5 w-5 text-[#7c665b]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari dress, khimar, warna moka, atau nama produk"
                className="w-full bg-transparent text-sm text-[#241915] outline-none placeholder:text-[#8d776c]"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              {searchPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuery(prompt)}
                  className="premium-button-secondary px-4 py-2 text-xs uppercase tracking-[0.16em] transition hover:border-[rgba(77,55,46,0.24)]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="premium-panel-soft rounded-[2rem] p-5 md:p-6">
            <div className="flex items-center gap-3 text-[#8a6c5f]">
              <Sparkles className="h-5 w-5" />
              <p className="text-xs uppercase tracking-[0.3em]">Akses cepat</p>
            </div>
            <div className="mt-5 space-y-4">
              {utilityQuickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="premium-panel block rounded-[1.5rem] p-5 transition hover:border-[rgba(77,55,46,0.2)]"
                >
                  <p className="premium-kicker">
                    {link.eyebrow}
                  </p>
                  <h2 className="mt-3 font-display text-[2rem] leading-none text-[#261a16]">
                    {link.title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[#6f5b52]">
                    {link.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="page-reveal-delay mt-10">
          <div className="flex flex-col gap-4 border-b border-[rgba(141,115,99,0.16)] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-[#6f5b52]">
                {results.length} hasil {deferredQuery ? `untuk "${deferredQuery}"` : 'siap Anda jelajahi'}
              </p>
              <h2 className="premium-title-lg mt-3">Hasil pencarian</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => startTransition(() => setActiveCategory('all'))}
                className={`px-4 py-2 text-xs uppercase tracking-[0.16em] transition ${
                  activeCategory === 'all'
                    ? 'premium-button-primary'
                    : 'premium-button-secondary'
                }`}
              >
                Semua
              </button>
              {featuredCategories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => startTransition(() => setActiveCategory(category.slug))}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.16em] transition ${
                    activeCategory === category.slug
                      ? 'premium-button-primary'
                      : 'premium-button-secondary'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {results.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {results.slice(0, 12).map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="premium-panel mt-8 rounded-[2rem] px-6 py-16 text-center">
              <p className="premium-kicker">
                Tidak ditemukan
              </p>
              <h3 className="premium-title-md mt-4">Coba kata kunci lain.</h3>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6f5b52]">
                Ubah kata kunci atau pilih kategori lain agar hasil yang tampil lebih sesuai.
              </p>
              <Link
                href="/"
                className="premium-button-primary mt-8 inline-flex px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] transition hover:brightness-110"
              >
                Kembali ke beranda
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
