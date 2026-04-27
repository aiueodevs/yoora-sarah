import Link from "next/link";

export type StylistRailProduct = {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  price: number;
  image: string;
};

type StylistProductRailProps = {
  products: StylistRailProduct[];
};

export function StylistProductRail({ products }: StylistProductRailProps) {
  if (!products?.length) {
    return null;
  }

  const marqueeProducts = [...products, ...products];

  return (
    <div className="shrink-0 overflow-hidden rounded-2xl border border-[rgba(156,131,117,0.12)] bg-[linear-gradient(90deg,rgba(247,236,227,0.95),rgba(233,217,206,0.9),rgba(247,236,227,0.95))] shadow-[0_10px_24px_rgba(58,39,28,0.06)]">
      <div className="overflow-hidden py-3 shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)]">
        {/* animated marquee — desktop */}
        <div className="hidden min-w-max items-center gap-4 motion-safe:flex motion-safe:animate-stylist-product-rail motion-reduce:hidden">
          {marqueeProducts.map((product, index) => (
            <Link
              key={`${product.id}-${index}`}
              href={`/${product.categorySlug}/${product.slug}`}
              className="group flex min-w-[15rem] items-center gap-3 rounded-full border border-[rgba(156,131,117,0.1)] bg-[rgba(255,255,255,0.8)] px-3 py-2 transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(92,67,55,0.2)] hover:bg-white hover:shadow-[0_12px_24px_rgba(58,39,28,0.06)]"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-11 w-10 rounded-xl object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="min-w-0">
                <p className="truncate text-[0.78rem] font-medium text-[#241915]">{product.name}</p>
                <p className="mt-0.5 text-[0.68rem] text-[#8a6c5f]">
                  Rp {product.price.toLocaleString("id-ID")}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* scroll fallback — reduced motion / mobile */}
        <div className="flex gap-4 overflow-hidden px-5 pb-1 motion-safe:hidden motion-reduce:flex">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/${product.categorySlug}/${product.slug}`}
              className="flex min-w-[15rem] items-center gap-3 rounded-full border border-[rgba(156,131,117,0.1)] bg-[rgba(255,255,255,0.8)] px-3 py-2"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-11 w-10 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-[0.78rem] font-medium text-[#241915]">{product.name}</p>
                <p className="mt-0.5 text-[0.68rem] text-[#8a6c5f]">
                  Rp {product.price.toLocaleString("id-ID")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
