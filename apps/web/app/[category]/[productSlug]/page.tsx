import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/product-detail';
import { getStorefrontProduct } from '@/lib/storefront-catalog';

interface ProductPageProps {
  params: Promise<{
    category: string;
    productSlug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { category, productSlug } = await params;
  const product = await getStorefrontProduct(category, productSlug);

  return {
    title: product ? `${product.name} | Yoora Sarah` : 'Yoora Sarah',
    description: product?.description[0] ?? 'Yoora Sarah',
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, productSlug } = await params;
  const product = await getStorefrontProduct(category, productSlug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
