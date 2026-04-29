'use client';

import { ProductCard } from '@/components/product/product-card';

interface Product {
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

interface ProductGridProps {
  title?: string;
  products: Product[];
}

export function ProductGrid({ title, products }: ProductGridProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl font-bold mb-8">{title}</h2>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
