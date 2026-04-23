import type { Metadata } from 'next';
import Link from 'next/link';
import { getStorefrontProfileData } from '@/lib/storefront-commerce';

export const metadata: Metadata = {
  title: 'Profil | Yoora Sarah',
  description: 'Ringkasan akun, pesanan aktif, dan akses cepat ke wishlist serta checkout.',
};

export default async function ProfilePage() {
  const { accountHighlights, utilityQuickLinks, wishlistPreview } =
    await getStorefrontProfileData();

  return (
    <div className="premium-page px-4 pb-20 pt-24 md:px-6 md:pt-32 xl:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="premium-shell page-reveal grid gap-8 rounded-[2.5rem] p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div>
            <p className="premium-kicker">Profil akun</p>
            <h1 className="premium-title-xl mt-4">Semua aktivitas belanja Anda dalam satu ruang yang lebih tenang.</h1>
            <p className="premium-copy mt-5 max-w-2xl">
              Pantau status akun, buka wishlist, dan lanjutkan checkout tanpa berpindah-pindah halaman secara berlebihan.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="premium-button-primary px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] transition hover:brightness-110"
              >
                Masuk akun
              </Link>
              <Link
                href="/register"
                className="premium-button-secondary px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] transition hover:border-[rgba(77,55,46,0.24)]"
              >
                Buat akun
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {accountHighlights.map((item) => (
              <div
                key={item.label}
                className="premium-panel-soft rounded-[1.75rem] p-5"
              >
                <p className="premium-kicker">
                  {item.label}
                </p>
                <p className="mt-4 text-3xl font-medium text-[#241915]">
                  {item.value}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#6f5b52]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="page-reveal-delay mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="premium-panel-soft rounded-[2rem] p-6 md:p-8">
            <p className="premium-kicker">
              Akses cepat
            </p>
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

          <div className="premium-panel rounded-[2rem] p-6 md:p-8">
            <p className="premium-kicker">Ringkasan wishlist</p>
            <h2 className="premium-title-md mt-4">Produk yang terakhir Anda simpan.</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {wishlistPreview.slice(0, 2).map((product) => (
                <Link
                  key={product.id}
                  href={`/${product.categorySlug}/${product.slug}`}
                  className="premium-panel-soft hover-lift rounded-[1.5rem] p-5"
                >
                  <p className="premium-kicker">
                    {product.categorySlug}
                  </p>
                  <h3 className="mt-3 font-display text-[2rem] leading-none text-[#261a16]">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#6f5b52]">
                    Buka detail produk untuk mengecek stok, ukuran, dan pilihan warna terbaru.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
