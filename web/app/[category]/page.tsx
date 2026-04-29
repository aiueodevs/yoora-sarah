import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ArrowDownUp } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import { getStorefrontCategory, getStorefrontProductsByCategory } from '@/lib/storefront-catalog';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getStorefrontCategory(categorySlug);

  return {
    title: category ? `Kategori ${category.name.toLowerCase()} | Yoora Sarah` : 'Yoora Sarah',
    description: category?.description ?? 'Yoora Sarah',
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = await getStorefrontCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const categoryProducts = await getStorefrontProductsByCategory(category.slug);

  return (
    <div className="premium-page bg-[#faf6f3]">
      <section className="px-4 pt-24 pb-12 md:px-6 md:pt-44 md:pb-16 xl:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-[rgba(141,115,99,0.16)] pb-10">
            <div className="max-w-2xl">
              <h1 className="font-display text-5xl md:text-6xl tracking-[-0.04em] text-[#241915]">
                {category.name}
              </h1>
              <p className="mt-5 text-lg text-[#6f5b52] leading-relaxed">
                {category.eyebrow ?? category.description}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="premium-pill px-4 py-2 text-[0.68rem] uppercase tracking-[0.2em] bg-[rgba(255,255,255,0.6)]">
                  {categoryProducts.length} Produk
                </span>
              </div>
            </div>
            <div className="premium-panel-soft flex w-full items-center justify-center gap-3 rounded-full px-5 py-3.5 text-sm font-medium text-[#35241d] cursor-pointer hover:bg-white hover:shadow-[0_12px_24px_rgba(58,39,28,0.08)] transition-all duration-300 md:inline-flex md:w-auto">
              <ArrowDownUp className="h-4 w-4 text-[#8a6c5f]" />
              <span>Urutkan: Koleksi Terbaru</span>
            </div>
          </div>

          {categoryProducts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="premium-panel-soft p-6 rounded-full mb-6 inline-flex">
                <span className="text-2xl opacity-60">✨</span>
              </div>
              <h3 className="text-xl font-medium text-[#35241d]">Koleksi Sedang Disiapkan</h3>
              <p className="mt-3 text-[#6f5b52] max-w-md mx-auto">
                Koleksi untuk kategori {category.name} saat ini sedang dalam tahap kurasi. Silakan periksa kembali nanti.
              </p>
            </div>
          )}

          {categoryProducts.length > 0 && (
            <div className="mt-16 flex items-center justify-center">
              <div className="premium-panel-soft inline-flex rounded-full px-8 py-4 text-sm text-[#6f5b52]">
                Semua {categoryProducts.length} produk sudah ditampilkan.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
