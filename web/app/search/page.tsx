import type { Metadata } from 'next';
import { StorefrontSearchPage } from '@/components/storefront/search-page';
import { getStorefrontSearchData } from '@/lib/storefront-catalog';

export const metadata: Metadata = {
  title: 'Pencarian | Yoora Sarah',
  description: 'Cari produk Yoora Sarah berdasarkan kategori, tone, atau nama koleksi.',
};

export default async function SearchPage() {
  const data = await getStorefrontSearchData();

  return <StorefrontSearchPage {...data} />;
}
