import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/product/product-card';
import { getStorefrontWishlistData } from '@/lib/storefront-commerce';

export const metadata: Metadata = {
  title: 'Wishlist | Yoora Sarah',
  description: 'Simpan look favorit dan bandingkan pilihan sebelum checkout.',
};

export default async function WishlistPage() {
  const { utilityQuickLinks, wishlistProducts } = await getStorefrontWishlistData();

  return (
    <div className="premium-page px-4 pb-20 pt-24 md:px-6 md:pt-32 xl:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="premium-shell page-reveal grid gap-8 rounded-[2.5rem] p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div>
            <p className="premium-kicker">Wishlist</p>
            <h1 className="premium-title-xl mt-4">Simpan pilihan terbaik sebelum Anda memutuskan membeli.</h1>
            <p className="premium-copy mt-5 max-w-2xl">
              Gunakan halaman ini untuk membandingkan beberapa produk sekaligus sebelum memindahkannya ke keranjang.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/cart"
                className="premium-button-primary px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] transition hover:brightness-110"
              >
                Buka keranjang
              </Link>
              <Link
                href="/search"
                className="premium-button-secondary px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] transition hover:border-[rgba(77,55,46,0.24)]"
              >
                Cari koleksi lain
              </Link>
            </div>
          </div>

          <div className="premium-panel-soft rounded-[2rem] p-5 md:p-6">
            <p className="premium-kicker">Langkah berikutnya</p>
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
              <p className="text-sm text-[#6f5b52]">{wishlistProducts.length} produk tersimpan untuk dibandingkan</p>
              <h2 className="premium-title-lg mt-3">Edit pilihan Anda</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
