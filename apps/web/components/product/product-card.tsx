import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Heart } from 'lucide-react';
import { formatRupiah, getCategoryLabel } from '@/lib/storefront-data';

interface ProductCardProps {
  id: string;
  categorySlug: string;
  name: string;
  price: number;
  image: string;
  swatchCount: number;
  sizes: string[];
  badge?: string;
  slug: string;
}

export function ProductCard({
  categorySlug,
  name,
  price,
  image,
  swatchCount,
  sizes,
  badge,
  slug,
}: ProductCardProps) {
  return (
    <Link
      href={`/${categorySlug}/${slug}`}
      className="premium-panel group relative block rounded-[2rem] transform-gpu transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(58,39,28,0.12)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[2rem] bg-[rgba(240,230,221,0.72)]">
        <Image
          src={image}
          alt={name}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,20,17,0.52)] via-[rgba(28,20,17,0.08)] to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.4)] to-transparent opacity-0 transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-[150%] group-hover:opacity-100" />

        {badge ? (
          <span className="premium-pill absolute left-4 top-4 px-3 py-1 text-[11px] uppercase tracking-[0.18em] backdrop-blur transition-transform duration-300 group-hover:-translate-y-1">
            {badge}
          </span>
        ) : null}

        {/* Wishlist Quick Action */}
        <button className="absolute right-4 top-4 flex h-10 w-10 translate-y-4 items-center justify-center rounded-full bg-white/20 text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 ease-out hover:bg-white/40 hover:scale-110 group-hover:translate-y-0 group-hover:opacity-100">
          <Heart className="h-4 w-4" />
        </button>

        <span className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-4 items-center justify-center rounded-full border border-white/24 bg-[rgba(36,25,21,0.2)] text-white opacity-0 backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="space-y-4 p-5 sm:p-6 relative bg-white rounded-b-[2rem] transition-colors duration-300 group-hover:bg-[#fffaf7]">
        <div className="flex items-center justify-between gap-4 text-[0.7rem] uppercase tracking-[0.22em] text-[#8a6c5f]">
          <span>{name}</span>
          <span>{getCategoryLabel(categorySlug)}</span>
        </div>
        <div>
          <h3 className="font-display text-[1.75rem] leading-[1.02] tracking-[-0.04em] text-[#261a16] transition-colors duration-300 group-hover:text-[#110b08]">
            {name}
          </h3>
          <p className="mt-3 text-lg font-medium text-[#35241d]">{formatRupiah(price)}</p>
        </div>

        <div className="premium-row flex items-center justify-between gap-4 pb-4 text-sm text-[#6d564c]">
          <span>{swatchCount} pilihan warna</span>
          <span>{sizes.join(' / ')}</span>
        </div>

        <div className="flex items-center justify-between gap-3 overflow-hidden">
          <p className="text-sm leading-7 text-[#6f5b52] transition-transform duration-300 group-hover:-translate-y-12">
            Lihat detail ukuran, warna, dan stok terbaru.
          </p>
          <span className="premium-button-secondary absolute bottom-5 right-5 inline-flex shrink-0 items-center px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] opacity-0 translate-y-8 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-hover:border-[rgba(77,55,46,0.24)] group-hover:text-[#241915]">
            Detail Produk
          </span>
        </div>
      </div>
    </Link>
  );
}
