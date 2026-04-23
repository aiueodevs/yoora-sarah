import { cache } from 'react';
import type {
  CatalogCategory,
  CatalogFeaturedStory,
  CatalogProductDetail,
  StorefrontAccountHighlight,
  StorefrontCartItem,
  StorefrontCatalogPayload,
  StorefrontFooterData,
  StorefrontQuickLink,
} from '@yoora/database/catalog';
import { storefrontCatalogFixture } from './storefront-data';

const storefrontApiBaseUrl =
  process.env.YOORA_STOREFRONT_API_BASE_URL?.replace(/\/$/, '') ??
  process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, '');

function createFallbackCartItems(products: CatalogProductDetail[]): StorefrontCartItem[] {
  const first = products[0];
  const third = products[2];

  return [first, third]
    .filter((product): product is CatalogProductDetail => Boolean(product))
    .map((product, index) => ({
      id: `cart-${product.slug}`,
      categorySlug: product.categorySlug,
      productSlug: product.slug,
      name: product.name,
      price: product.price,
      image: product.colors[0]?.gallery[0] ?? product.image,
      quantity: 1,
      color: product.colors[0]?.name ?? 'Signature Tone',
      size: product.sizes[Math.min(index + 1, product.sizes.length - 1)] ?? product.sizes[0] ?? 'M',
    }));
}

function createFallbackWishlistProducts(products: CatalogProductDetail[]) {
  return [products[0], products[2], products[4], products[5]].filter(
    (product): product is CatalogProductDetail => Boolean(product)
  );
}

export const getStorefrontCatalog = cache(async (): Promise<StorefrontCatalogPayload> => {
  if (!storefrontApiBaseUrl) {
    return storefrontCatalogFixture;
  }

  try {
    const response = await fetch(`${storefrontApiBaseUrl}/catalog/storefront`, {
      headers: {
        Accept: 'application/json',
      },
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      return storefrontCatalogFixture;
    }

    return (await response.json()) as StorefrontCatalogPayload;
  } catch {
    return storefrontCatalogFixture;
  }
});

export async function getStorefrontShellData(): Promise<{
  featuredStories: CatalogFeaturedStory[];
  footer: StorefrontFooterData;
}> {
  const catalog = await getStorefrontCatalog();

  return {
    featuredStories: catalog.featuredStories,
    footer: catalog.footer,
  };
}

export async function getStorefrontCategory(slug: string): Promise<CatalogCategory | undefined> {
  const catalog = await getStorefrontCatalog();
  return catalog.categories.find((category) => category.slug === slug);
}

export async function getStorefrontProductsByCategory(slug: string): Promise<CatalogProductDetail[]> {
  const catalog = await getStorefrontCatalog();
  return catalog.products.filter((product) => product.categorySlug === slug);
}

export async function getStorefrontProduct(
  categorySlug: string,
  productSlug: string
): Promise<CatalogProductDetail | undefined> {
  const catalog = await getStorefrontCatalog();
  return catalog.products.find(
    (product) => product.categorySlug === categorySlug && product.slug === productSlug
  );
}

export async function getStorefrontClearanceProducts(limit = 6): Promise<CatalogProductDetail[]> {
  const catalog = await getStorefrontCatalog();

  return [...catalog.products]
    .sort((left, right) => {
      if (left.stock !== right.stock) {
        return left.stock - right.stock;
      }

      return right.price - left.price;
    })
    .slice(0, limit);
}

export async function getStorefrontSearchData(): Promise<{
  featuredCategories: CatalogCategory[];
  products: CatalogProductDetail[];
  searchPrompts: string[];
  utilityQuickLinks: StorefrontQuickLink[];
}> {
  const catalog = await getStorefrontCatalog();

  return {
    featuredCategories: catalog.categories,
    products: catalog.products,
    searchPrompts: catalog.searchPrompts,
    utilityQuickLinks: catalog.utilityQuickLinks,
  };
}

export async function getStorefrontProfileData(): Promise<{
  accountHighlights: StorefrontAccountHighlight[];
  utilityQuickLinks: StorefrontQuickLink[];
  wishlistProducts: CatalogProductDetail[];
}> {
  const catalog = await getStorefrontCatalog();

  return {
    accountHighlights: catalog.accountHighlights,
    utilityQuickLinks: catalog.utilityQuickLinks,
    wishlistProducts: createFallbackWishlistProducts(catalog.products),
  };
}

export async function getStorefrontWishlistData(): Promise<{
  utilityQuickLinks: StorefrontQuickLink[];
  wishlistProducts: CatalogProductDetail[];
}> {
  const catalog = await getStorefrontCatalog();

  return {
    utilityQuickLinks: catalog.utilityQuickLinks,
    wishlistProducts: createFallbackWishlistProducts(catalog.products),
  };
}

export async function getStorefrontCartData(): Promise<{
  initialCartItems: StorefrontCartItem[];
  trustSignals: string[];
}> {
  const catalog = await getStorefrontCatalog();

  return {
    initialCartItems: createFallbackCartItems(catalog.products),
    trustSignals: catalog.trustSignals,
  };
}

export async function getStorefrontCheckoutData(): Promise<{
  checkoutSteps: string[];
  cartItems: StorefrontCartItem[];
}> {
  const catalog = await getStorefrontCatalog();

  return {
    checkoutSteps: catalog.checkoutSteps,
    cartItems: createFallbackCartItems(catalog.products),
  };
}
