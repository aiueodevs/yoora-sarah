import { cache } from 'react';
import type { CatalogProductDetail, StorefrontCartItem } from '@yoora/database/catalog';
import type {
  StorefrontCartPayload,
  CheckoutSummaryPayload,
  CustomerProfilePayload,
  CustomerWishlistPayload,
  OrderSummary,
  SupportContact,
} from '@yoora/database/commerce';
import { getStorefrontCatalog } from './storefront-catalog';

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

function createFallbackSupportContact(): SupportContact {
  const defaultMessage = 'Halo Yoora Sarah, saya ingin bantuan terkait pesanan saya.';
  return {
    whatsappNumber: '6282315866088',
    whatsappHref: `https://wa.me/6282315866088?text=${encodeURIComponent(defaultMessage)}`,
    defaultMessage,
    confirmationMessage:
      'Setelah transfer selesai, kirim bukti pembayaran melalui WhatsApp agar pesanan dapat diproses lebih cepat.',
    businessHours: 'Senin - Sabtu, 08.00 - 17.00 WIB',
    responseWindow: 'Respon awal biasanya kurang dari 15 menit pada jam kerja.',
  };
}

async function fetchStorefrontJson<T>(path: string): Promise<T | null> {
  if (!storefrontApiBaseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${storefrontApiBaseUrl}${path}`, {
      headers: {
        Accept: 'application/json',
      },
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export const getStorefrontSupportContact = cache(async (): Promise<SupportContact> => {
  const response = await fetchStorefrontJson<SupportContact>('/support/contact');
  return response ?? createFallbackSupportContact();
});

export const getStorefrontCartData = cache(async (): Promise<StorefrontCartPayload> => {
  const response = await fetchStorefrontJson<StorefrontCartPayload>('/orders/me/cart');
  if (response) {
    return response;
  }

  const catalog = await getStorefrontCatalog();

  return {
    customerId: 'customer_sarah_rahmawati',
    cartId: 'cart_preview_sarah',
    status: 'active',
    trustSignals: catalog.trustSignals,
    cartItems: createFallbackCartItems(catalog.products),
    updatedAt: '2026-04-22T09:16:00+07:00',
  };
});

export async function getStorefrontOrders(): Promise<OrderSummary[]> {
  const response = await fetchStorefrontJson<OrderSummary[]>('/orders/me');
  if (response) {
    return response;
  }

  const catalog = await getStorefrontCatalog();
  const cartItems = createFallbackCartItems(catalog.products);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return [
    {
      id: 'order_ys_20260419_182',
      orderNumber: 'YS-2026-0419-182',
      status: 'awaiting_payment',
      statusLabel: 'Menunggu konfirmasi pembayaran',
      total: subtotal + 18000 + 2000,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      placedAt: '2026-04-19T09:45:00+07:00',
    },
  ];
}

export async function getStorefrontProfileData(): Promise<CustomerProfilePayload> {
  const response = await fetchStorefrontJson<CustomerProfilePayload>('/customers/me/profile');
  if (response) {
    return response;
  }

  const catalog = await getStorefrontCatalog();
  const orders = await getStorefrontOrders();

  return {
    customerId: 'customer_sarah_rahmawati',
    fullName: 'Sarah Rahmawati',
    phone: '+62 823-1586-6088',
    memberState: 'member_active',
    accountHighlights: catalog.accountHighlights,
    utilityQuickLinks: catalog.utilityQuickLinks,
    wishlistPreview: catalog.products.filter(Boolean).slice(0, 2),
    addresses: [
      {
        id: 'address_subang_home',
        label: 'Rumah Subang',
        recipientName: 'Sarah Rahmawati',
        phone: '+62 823-1586-6088',
        line1: 'Jl. Otto Iskandardinata No.271, Karanganyar',
        city: 'Subang',
        province: 'Jawa Barat',
        postalCode: '41211',
        isPrimary: true,
      },
      {
        id: 'address_bandung_office',
        label: 'Studio Bandung',
        recipientName: 'Sarah Rahmawati',
        phone: '+62 823-1586-6088',
        line1: 'Jl. Ciumbuleuit No.112, Hegarmanah',
        city: 'Bandung',
        province: 'Jawa Barat',
        postalCode: '40141',
        isPrimary: false,
      },
    ],
    recentOrders: orders,
  };
}

export async function getStorefrontWishlistData(): Promise<CustomerWishlistPayload> {
  const response = await fetchStorefrontJson<CustomerWishlistPayload>('/customers/me/wishlist');
  if (response) {
    return response;
  }

  const catalog = await getStorefrontCatalog();

  return {
    customerId: 'customer_sarah_rahmawati',
    utilityQuickLinks: catalog.utilityQuickLinks,
    wishlistProducts: catalog.products.filter(Boolean).slice(0, 4),
    updatedAt: '2026-04-22T09:00:00+07:00',
  };
}

export async function getStorefrontCheckoutData(): Promise<CheckoutSummaryPayload> {
  const response = await fetchStorefrontJson<CheckoutSummaryPayload>('/orders/me/checkout-summary');
  if (response) {
    return response;
  }

  const catalog = await getStorefrontCatalog();
  const cart = await getStorefrontCartData();
  const cartItems = cart.cartItems;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const support = createFallbackSupportContact();

  return {
    order: {
      id: 'order_ys_20260419_182',
      orderNumber: 'YS-2026-0419-182',
      status: 'awaiting_payment',
      statusLabel: 'Menunggu konfirmasi pembayaran',
      total: subtotal + 18000 + 2000,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      placedAt: '2026-04-19T09:45:00+07:00',
    },
    checkoutSteps: catalog.checkoutSteps,
    cartItems,
    recipient: {
      recipientName: 'Sarah Rahmawati',
      phone: '+62 823-1586-6088',
      addressLine: 'Jl. Otto Iskandardinata No.271, Karanganyar, Subang, Jawa Barat 41211',
    },
    payment: {
      methodCode: 'virtual_account_bca',
      methodLabel: 'Virtual Account BCA',
      confirmationInstruction: support.confirmationMessage,
      dueLabel: 'Bayar maksimal 24 jam setelah checkout dikonfirmasi.',
    },
    totals: {
      subtotal,
      shipping: 18000,
      serviceFee: 2000,
      total: subtotal + 18000 + 2000,
    },
    support,
  };
}
