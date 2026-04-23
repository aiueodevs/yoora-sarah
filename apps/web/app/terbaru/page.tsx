import { getStorefrontCatalog } from '@/lib/storefront-catalog';
import { ProductCard } from '@/components/product/product-card';

export default async function NewArrivalsPage() {
  const catalog = await getStorefrontCatalog();
  const products = catalog.products; // Assuming we use catalog products for demo

  return (
    <main className="premium-page min-h-[100dvh] pt-24 pb-20">
      <div className="mx-auto max-w-[92rem] px-4 md:px-6 xl:px-10">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16 mt-10">
          <p className="premium-kicker tracking-[0.3em] text-[#8a6c5f]">Koleksi Terbaru</p>
          <h1 className="mt-6 font-display text-4xl leading-[1.1] tracking-[-0.04em] text-[#241915] md:text-5xl lg:text-6xl">
            Baru datang, siap dimiliki.
          </h1>
          <p className="premium-copy mx-auto mt-6 max-w-xl text-[1.1rem] leading-[1.8] text-[#5f4a41]">
            Produk terbaru dengan tone studio yang lembut dan potongan yang sudah dikurasi. Pilihan segar untuk menyempurnakan koleksi Anda.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

      </div>
    </main>
  );
}
