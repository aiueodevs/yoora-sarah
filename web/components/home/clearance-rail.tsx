'use client';

import Image from 'next/image';
import type { ProductDetail } from '@/lib/storefront-data';
import { formatRupiah } from '@/lib/storefront-data';
import { ArrowUpRight } from 'lucide-react';

function getClearancePrice(price: number) {
  return Math.round((price * 0.78) / 1000) * 1000;
}

function ClearanceCard({
  image,
  index,
  name,
  price,
  stock,
}: {
  image: string;
  index: number;
  name: string;
  price: number;
  stock: number;
}) {
  const salePrice = getClearancePrice(price);

  return (
    <article className="group relative overflow-hidden rounded-[1.2rem] border border-white/60 bg-[rgba(255,255,255,0.9)] p-3 shadow-[0_8px_30px_rgba(40,25,18,0.04)] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:bg-[#ffffff] hover:shadow-[0_20px_40px_rgba(40,25,18,0.08)] xl:rounded-[1.4rem] xl:p-4">
      {/* Dynamic Glint / Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.8)] to-transparent opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-[150%] group-hover:opacity-100 z-10 pointer-events-none" />
      
      <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      <div className="flex items-start gap-4">
        <div className="relative h-28 w-[5.5rem] shrink-0 overflow-hidden rounded-xl border border-[rgba(166,132,111,0.15)] bg-[#fdfaf7] xl:h-[7.5rem] xl:w-[6rem]">
          <Image src={image} alt={name} fill sizes="96px" className="object-cover transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-black/5" />
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.25em] text-[#a68a7c] font-medium transition-colors duration-300 group-hover:text-[#8a6c5f] group-hover:animate-pulse">
                Lot {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-1.5 line-clamp-2 text-[0.95rem] font-medium leading-[1.4] text-[#2c1d16] group-hover:text-[#110b08] transition-colors">{name}</h3>
            </div>
          </div>
          
          <div className="mt-4 xl:mt-5 flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-[0.65rem] text-[#9b7b6c] line-through decoration-[#c8b1a5] transition-opacity duration-300 group-hover:opacity-60">{formatRupiah(price)}</p>
              <p className="font-display text-[1.1rem] xl:text-[1.2rem] tracking-[-0.02em] text-[#1a110e] transition-transform duration-300 origin-left group-hover:scale-[1.02]">
                {formatRupiah(salePrice)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden xl:inline-block text-[0.55rem] uppercase tracking-[0.25em] text-[#8f7265] transition-all duration-300 group-hover:text-[#5e4538] group-hover:tracking-[0.3em]">
                {stock} Left
              </span>
              <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#f4ede7] text-[#5e4538] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-45 group-hover:bg-[#3a2822] group-hover:text-[#fdfaf7] group-hover:shadow-[0_8px_16px_rgba(58,39,28,0.2)]">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ClearanceRail({
  products,
}: {
  products: ProductDetail[];
}) {
  return (
    <>
      <aside
        aria-label="Produk clearance"
        className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden items-center pr-4 pt-16 lg:flex xl:pr-10"
      >
        <section className="pointer-events-auto relative w-[22rem] overflow-hidden rounded-[2.5rem] border border-[rgba(255,255,255,0.8)] bg-[linear-gradient(180deg,rgba(255,252,248,0.96),rgba(246,241,237,0.95))] shadow-[0_40px_100px_rgba(30,20,15,0.15),inset_0_1px_1px_rgba(255,255,255,1)] xl:w-[25rem] 2xl:w-[26rem]">
          
          <div className="border-b border-[rgba(166,132,111,0.15)] px-6 py-6 xl:px-8 xl:py-7 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),transparent)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#8a6c5f] font-semibold mb-1">
                  Yoora Archive
                </p>
                <h2 className="font-display text-[1.8rem] xl:text-[2.1rem] tracking-[-0.04em] text-[#1a110e] leading-none">
                  Clearance
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(166,132,111,0.2)] bg-[rgba(255,255,255,0.9)] shadow-sm">
                <span className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#5e4538] text-center leading-tight">
                  Last<br/>Items
                </span>
              </div>
            </div>
          </div>

          <div className="relative h-[calc(100dvh-18rem)] min-h-[38rem] max-h-[48rem] overflow-hidden p-4 xl:p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-[rgba(255,252,248,0.96)] via-[rgba(255,252,248,0.4)] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[rgba(246,241,237,0.98)] via-[rgba(246,241,237,0.7)] to-transparent" />

            <div className="hidden flex-col gap-3 motion-reduce:flex xl:gap-4">
              {products.map((product, index) => (
                <ClearanceCard
                  key={product.id}
                  index={index}
                  image={product.colors[0]?.gallery[0] ?? product.image}
                  name={product.name}
                  price={product.price}
                  stock={product.stock}
                />
              ))}
            </div>

            <div className="motion-safe:flex hidden [will-change:transform] transform-gpu flex-col gap-3 xl:gap-4 animate-clearance-track">
              {[0, 1].map((groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-3 xl:gap-4">
                  {products.map((product, index) => (
                    <ClearanceCard
                      key={`${groupIndex}-${product.id}`}
                      index={index}
                      image={product.colors[0]?.gallery[0] ?? product.image}
                      name={product.name}
                      price={product.price}
                      stock={product.stock}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </aside>

      <section aria-label="Produk clearance" className="absolute inset-x-4 bottom-14 z-20 lg:hidden">
        <div className="overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.8)] bg-[linear-gradient(180deg,rgba(255,252,248,0.96),rgba(246,241,237,0.95))] shadow-[0_30px_80px_rgba(30,20,15,0.15)]">
          <div className="border-b border-[rgba(166,132,111,0.15)] px-5 py-4 flex justify-between items-center">
            <p className="font-display text-[1.4rem] tracking-[-0.04em] text-[#1a110e]">Clearance</p>
            <span className="text-[0.6rem] uppercase tracking-[0.25em] text-[#8a6c5f] font-semibold">Last Items</span>
          </div>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.slice(0, 4).map((product) => {
              const salePrice = getClearancePrice(product.price);

              return (
                <article
                  key={product.id}
                  className="group relative overflow-hidden min-w-[15rem] snap-start rounded-[1.3rem] border border-white/60 bg-[rgba(255,255,255,0.9)] p-3.5 shadow-[0_8px_24px_rgba(40,25,18,0.06)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(40,25,18,0.08)]"
                >
                  <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.8)] to-transparent opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-[150%] group-hover:opacity-100 z-10 pointer-events-none" />
                  
                  <div className="flex gap-3.5">
                    <div className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-xl border border-[rgba(166,132,111,0.12)] bg-[#fdfaf7]">
                      <Image
                        src={product.colors[0]?.gallery[0] ?? product.image}
                        alt={product.name}
                        fill
                        sizes="72px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[0.55rem] uppercase tracking-[0.25em] text-[#8a6c5f] font-medium transition-colors duration-300 group-hover:animate-pulse">
                        {product.stock} left
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-[0.9rem] font-medium leading-[1.3] text-[#2c1d16]">
                        {product.name}
                      </h3>
                      <div className="mt-3">
                        <p className="text-[0.65rem] text-[#9b7b6c] line-through transition-opacity duration-300 group-hover:opacity-60">{formatRupiah(product.price)}</p>
                        <p className="font-display text-[1.1rem] tracking-[-0.02em] text-[#1a110e] transition-transform duration-300 origin-left group-hover:scale-105">{formatRupiah(salePrice)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
