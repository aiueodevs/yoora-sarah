import { getStorefrontCatalog } from "@/lib/storefront-catalog";
import { StylistPageClient } from "@/components/stylist/stylist-page-client";

export default async function StylistPage() {
  const catalog = await getStorefrontCatalog();

  const railProducts = catalog.products
    .filter((product) => Boolean(product.slug) && Boolean(product.categorySlug))
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      categorySlug: product.categorySlug,
      price: product.price,
      image: product.colors[0]?.gallery[0] ?? product.image,
    }));

  return <StylistPageClient railProducts={railProducts} />;
}
