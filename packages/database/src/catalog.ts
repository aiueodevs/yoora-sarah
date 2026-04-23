export type CatalogStockState = 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder';

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  heroImage: string;
  eyebrow?: string;
}

export interface CatalogFeaturedStory {
  title: string;
  subtitle: string;
  thumbnail: string;
  href: string;
}

export interface CatalogProductColor {
  name: string;
  hex: string;
  gallery: string[];
}

export interface CatalogProductSummary {
  id: string;
  categorySlug: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  image: string;
  swatchCount: number;
  sizes: string[];
  badge?: string;
  stock: number;
  stockState?: CatalogStockState;
  isFeatured?: boolean;
  tags?: string[];
}

export interface CatalogProductDetail extends CatalogProductSummary {
  colors: CatalogProductColor[];
  description: string[];
  materials: string[];
  care: string[];
  trustBadges?: string[];
}

export interface CatalogLink {
  label: string;
  href: string;
}

export interface StorefrontFooterData {
  company: string;
  address: string;
  phone: string;
  shoppingHelp: CatalogLink[];
  about: CatalogLink[];
  policy: CatalogLink[];
  social: CatalogLink[];
}

export interface StorefrontQuickLink {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
}

export interface StorefrontAccountHighlight {
  label: string;
  value: string;
  description: string;
}

export interface StorefrontCartItem {
  id: string;
  categorySlug: string;
  productSlug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color: string;
  size: string;
}

export interface StorefrontCatalogPayload {
  categories: CatalogCategory[];
  featuredStories: CatalogFeaturedStory[];
  products: CatalogProductDetail[];
  searchPrompts: string[];
  utilityQuickLinks: StorefrontQuickLink[];
  accountHighlights: StorefrontAccountHighlight[];
  checkoutSteps: string[];
  trustSignals: string[];
  footer: StorefrontFooterData;
}
