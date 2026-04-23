'use client';

import type { ProductDetail } from '@/lib/storefront-data';
import { CategoryFeature } from '@/lib/storefront-data';
import { ClearanceRail } from './clearance-rail';
import { HeroSequence } from './hero-sequence';

interface HeroProps {
  category: CategoryFeature;
  clearanceProducts: ProductDetail[];
}

export function Hero({ category, clearanceProducts }: HeroProps) {
  return (
    <section id="clearance" className="relative h-[100dvh] overflow-hidden">
      <HeroSequence
        alt={category.name}
        mediaClassName="object-[58%_18%] sm:object-[56%_16%] md:object-[50%_4%] xl:object-[52%_8%] 2xl:object-[52%_10%]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,15,15,0.16)_0%,rgba(17,15,15,0.04)_28%,rgba(17,15,15,0.12)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,244,236,0.08),transparent_22%),radial-gradient(circle_at_82%_20%,rgba(255,226,209,0.1),transparent_18%)]" />

      <div className="absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-[rgba(7,6,6,0.28)] to-transparent" />
      <ClearanceRail products={clearanceProducts} />
    </section>
  );
}
