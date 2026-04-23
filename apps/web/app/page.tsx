import { Hero } from '@/components/home/hero';
import { StylistMarquee } from '@/components/home/stylist-marquee';
import { getStorefrontCatalog, getStorefrontClearanceProducts } from '@/lib/storefront-catalog';

export default async function HomePage() {
  const catalog = await getStorefrontCatalog();
  const primaryCategory = catalog.categories[0];
  const clearanceProducts = await getStorefrontClearanceProducts(6);

  if (!primaryCategory) {
    return null;
  }

  return (
    <main className="relative h-[100dvh] overflow-hidden">
      <Hero category={primaryCategory} clearanceProducts={clearanceProducts} />
      <StylistMarquee />
    </main>
  );
}
