'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Heart, Minus, Plus, Ruler, ArrowDown } from 'lucide-react';
import { addStorefrontCartItem } from '@/cart/actions';
import { ProductAiPanels } from '@/components/product/product-ai-panels';
import { SizeGuideModal } from '@/components/product/size-guide-modal';
import {
  ProductDetail as ProductDetailType,
  formatRupiah,
  getCategoryLabel,
} from '@/lib/storefront-data';

interface ProductDetailProps {
  product: ProductDetailType;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const [mainImage, setMainImage] = useState(product.image || product.colors[0].gallery[0]);
  const gallery = selectedColor.gallery;
  const total = product.price * quantity;
  const categoryLabel = getCategoryLabel(product.categorySlug);

  // Sync main image when color changes
  useMemo(() => {
    setMainImage(selectedColor.gallery[0] || product.image);
  }, [selectedColor]);

  const handleAddToCart = () => {
    setCartFeedback(null);
    startTransition(() => {
      void addStorefrontCartItem({
        productId: product.id,
        categorySlug: product.categorySlug,
        productSlug: product.slug,
        color: selectedColor.name,
        size: selectedSize,
        quantity,
      }).then((response) => {
        setCartFeedback(response ? 'Produk berhasil ditambahkan.' : 'Mohon maaf, sistem sedang sibuk.');
      });
    });
  };

  return (
    <div className="min-h-screen bg-[#faf8f6] pb-16 pt-20 md:pt-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8 xl:px-12">
        
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.2em] text-[#a2806e]">
          <Link href="/" className="transition hover:text-[#241915]">Beranda</Link>
          <span className="mx-0.5 opacity-40">/</span>
          <Link href={`/${product.categorySlug}`} className="transition hover:text-[#241915]">{categoryLabel}</Link>
          <span className="mx-0.5 opacity-40">/</span>
          <span className="text-[#241915]">{product.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] xl:gap-10">
          
          {/* Left: Gallery with Thumbnails */}
          <div className="flex flex-col-reverse gap-3 md:flex-row">
            {/* Thumbnails */}
            <div className="flex flex-row gap-2 overflow-x-auto pb-2 md:w-[68px] md:flex-shrink-0 md:flex-col md:gap-2.5 md:overflow-visible md:pb-0">
              {gallery.map((image, index) => (
                <button
                  key={`${selectedColor.name}-${image}-${index}`}
                  onClick={() => setMainImage(image)}
                  className={`relative aspect-[3/4] w-[68px] flex-shrink-0 overflow-hidden bg-[#f4ede7] transition-all duration-300 ${
                    mainImage === image ? 'ring-1 ring-[#241915] opacity-100' : 'opacity-50 hover:opacity-90'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Look ${index + 1}`}
                    fill
                    sizes="68px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative flex-1 overflow-hidden bg-[#f4ede7] aspect-[3/4] max-h-[85vh]">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover object-center"
                unoptimized
              />
            </div>
          </div>

          {/* Right: Product Info Panel */}
          <div className="relative">
            <div className="sticky top-28 flex flex-col">
              
              {/* Name & Price */}
              <div className="border-b border-[#e6dfd8] pb-5">
                <h1 className="font-display text-3xl leading-[1.1] tracking-[-0.02em] text-[#1a110e] md:text-[2.5rem]">
                  {product.name}
                </h1>
                <p className="mt-3 text-[1.05rem] font-light tracking-wide text-[#5f4a41]">
                  {formatRupiah(product.price)}
                </p>
              </div>

              {/* Color & Size Selections */}
              <div className="py-5 border-b border-[#e6dfd8]">
                {/* Colors */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#241915]">
                      Warna
                    </p>
                    <span className="text-[0.7rem] text-[#8a6c5f]">{selectedColor.name}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {product.colors.map((color) => {
                      const isActive = color.name === selectedColor.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          aria-label={`Pilih warna ${color.name}`}
                          aria-pressed={isActive}
                          onClick={() => setSelectedColor(color)}
                          className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                            isActive ? 'ring-1 ring-[#241915] ring-offset-2 ring-offset-[#faf8f6]' : 'hover:scale-110'
                          }`}
                        >
                          <span
                            className="absolute inset-0 rounded-full border border-black/5"
                            style={{ backgroundColor: color.hex }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sizes */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#241915]">
                      Ukuran
                    </p>
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-[0.65rem] uppercase tracking-[0.1em] text-[#a2806e] underline underline-offset-2 transition hover:text-[#241915]"
                    >
                      Panduan
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-5">
                    {product.sizes.map((size) => {
                      const isActive = size === selectedSize;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`relative py-0.5 text-[0.8rem] transition-colors duration-300 ${
                            isActive
                              ? 'font-medium text-[#241915]'
                              : 'text-[#8a6c5f] hover:text-[#241915]'
                          }`}
                        >
                          {size}
                          {isActive && (
                            <span className="absolute bottom-0 left-0 h-px w-full bg-[#241915]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions — Qty + ATC + Wishlist */}
              <div className="py-5">
                <div className="flex items-center gap-3">
                  {/* Qty */}
                  <div className="flex h-12 w-28 items-center justify-between border border-[#e6dfd8] px-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="text-[#8a6c5f] transition hover:text-[#241915]"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[0.85rem] font-medium text-[#241915]">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => current + 1)}
                      className="text-[#8a6c5f] transition hover:text-[#241915]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* ATC */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isPending}
                    className="flex h-12 flex-1 items-center justify-center bg-[#1a110e] text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white transition-all hover:bg-[#3a2822] disabled:opacity-70"
                  >
                    {isPending ? 'Memproses...' : 'Tambahkan'}
                  </button>
                </div>

                <button
                  type="button"
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 border border-[#e6dfd8] text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[#241915] transition-all hover:border-[#241915]"
                >
                  <Heart className="h-3.5 w-3.5" />
                  Wishlist
                </button>

                {cartFeedback && (
                  <p className="mt-3 text-center text-[0.8rem] text-[#8a6c5f]">{cartFeedback}</p>
                )}
              </div>

              {/* Product Details — compact accordion-style */}
              <div className="border-t border-[#e6dfd8]">
                <div className="py-4 border-b border-[#e6dfd8]">
                  <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#241915] mb-2.5">
                    Tentang Produk
                  </h3>
                  <div className="space-y-2.5 text-[0.82rem] leading-[1.65] text-[#5f4a41]">
                    {product.description.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="py-4 border-b border-[#e6dfd8]">
                  <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#241915] mb-2.5">
                    Bahan & Perawatan
                  </h3>
                  <div className="text-[0.82rem] leading-[1.65] text-[#5f4a41]">
                    <p className="font-medium text-[#241915] mb-1.5">Material</p>
                    <ul className="list-disc pl-5 space-y-0.5 mb-3">
                      {product.materials.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    <p className="font-medium text-[#241915] mb-1.5">Perawatan</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {product.care.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* AI Panels */}
        <div className="mt-14">
          <ProductAiPanels
            categorySlug={product.categorySlug}
            productSlug={product.slug}
            productName={product.name}
            selectedSize={selectedSize}
          />
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        open={sizeGuideOpen}
        onOpenChange={setSizeGuideOpen}
        productSlug={product.slug}
        productName={product.name}
        sizes={product.sizes}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
      />
    </div>
  );
}
