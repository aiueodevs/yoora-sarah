export { createClient } from './supabase/client';
export { createServerClient } from './supabase/server';
export type {
  CatalogCategory,
  CatalogFeaturedStory,
  CatalogLink,
  CatalogProductColor,
  CatalogProductDetail,
  CatalogProductSummary,
  CatalogStockState,
  StorefrontAccountHighlight,
  StorefrontCartItem,
  StorefrontCatalogPayload,
  StorefrontFooterData,
  StorefrontQuickLink,
} from './catalog';
export type {
  AddCartItemPayload,
  CartItemQuantityUpdatePayload,
  CartStatus,
  CheckoutPaymentSummary,
  CheckoutRecipient,
  CheckoutSummaryPayload,
  CustomerAddress,
  CustomerMemberState,
  CustomerProfilePayload,
  CustomerWishlistPayload,
  OrderStatus,
  OrderSummary,
  OrderTotals,
  StorefrontCartPayload,
  SupportContact,
  SupportHandoffRecord,
  SupportHandoffRequest,
  SupportPolicyArticle,
  SupportSource,
  SupportTopic,
} from './commerce';
export type { Database } from './supabase/types';
