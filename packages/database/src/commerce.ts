import type {
  CatalogProductDetail,
  StorefrontAccountHighlight,
  StorefrontCartItem,
  StorefrontQuickLink,
} from './catalog';

export type CustomerMemberState = 'guest' | 'member_active' | 'member_priority';

export type OrderStatus =
  | 'awaiting_payment'
  | 'processing'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered';

export type SupportTopic =
  | 'payment'
  | 'shipping'
  | 'preorder'
  | 'size'
  | 'returns'
  | 'order_status';

export type SupportSource = 'checkout' | 'order_tracking' | 'buyer_ai' | 'profile';
export type CartStatus = 'active' | 'converted' | 'abandoned';

export interface CustomerAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  city: string;
  province: string;
  postalCode: string;
  isPrimary: boolean;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  total: number;
  itemCount: number;
  placedAt: string;
}

export interface CustomerProfilePayload {
  customerId: string;
  fullName: string;
  phone: string;
  memberState: CustomerMemberState;
  accountHighlights: StorefrontAccountHighlight[];
  utilityQuickLinks: StorefrontQuickLink[];
  wishlistPreview: CatalogProductDetail[];
  addresses: CustomerAddress[];
  recentOrders: OrderSummary[];
}

export interface CustomerWishlistPayload {
  customerId: string;
  utilityQuickLinks: StorefrontQuickLink[];
  wishlistProducts: CatalogProductDetail[];
  updatedAt: string;
}

export interface StorefrontCartPayload {
  customerId: string;
  cartId: string;
  status: CartStatus;
  trustSignals: string[];
  cartItems: StorefrontCartItem[];
  updatedAt: string;
}

export interface CartItemQuantityUpdatePayload {
  quantity: number;
}

export interface AddCartItemPayload {
  productId?: string | null;
  categorySlug: string;
  productSlug: string;
  color?: string | null;
  size?: string | null;
  quantity: number;
}

export interface CheckoutRecipient {
  recipientName: string;
  phone: string;
  addressLine: string;
}

export interface CheckoutPaymentSummary {
  methodCode: string;
  methodLabel: string;
  confirmationInstruction: string;
  dueLabel: string;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  serviceFee: number;
  total: number;
}

export interface SupportContact {
  whatsappNumber: string;
  whatsappHref: string;
  defaultMessage: string;
  confirmationMessage: string;
  businessHours: string;
  responseWindow: string;
}

export interface CheckoutSummaryPayload {
  order: OrderSummary;
  checkoutSteps: string[];
  cartItems: StorefrontCartItem[];
  recipient: CheckoutRecipient;
  payment: CheckoutPaymentSummary;
  totals: OrderTotals;
  support: SupportContact;
}

export interface SupportPolicyArticle {
  id: string;
  title: string;
  summary: string;
  href: string;
  topics: SupportTopic[];
}

export interface SupportHandoffRequest {
  customerId?: string | null;
  orderId?: string | null;
  reason: string;
  contextSummary: string;
  requestedChannel: 'whatsapp' | 'human_cs';
  source: SupportSource;
}

export interface SupportHandoffRecord {
  id: string;
  status: 'draft' | 'ready';
  nextAction: string;
  summary: string;
  contact: SupportContact;
  policyArticles: SupportPolicyArticle[];
}
