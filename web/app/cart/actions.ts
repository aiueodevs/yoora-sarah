'use server';

import { revalidatePath } from 'next/cache';
import type { AddCartItemPayload, StorefrontCartPayload } from '@yoora/database/commerce';
import { recordStorefrontTelemetryEvent } from '@/lib/storefront-telemetry';

const storefrontApiBaseUrl =
  process.env.YOORA_STOREFRONT_API_BASE_URL?.replace(/\/$/, '') ??
  process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, '');

async function mutateCart(path: string, init: RequestInit): Promise<StorefrontCartPayload | null> {
  if (!storefrontApiBaseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${storefrontApiBaseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    revalidatePath('/cart');
    revalidatePath('/checkout');
    return (await response.json()) as StorefrontCartPayload;
  } catch {
    return null;
  }
}

export async function updateStorefrontCartItemQuantity(itemId: string, quantity: number) {
  const response = await mutateCart(`/orders/me/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });

  await recordStorefrontTelemetryEvent({
    eventName: 'buyer_cart_item_quantity_updated',
    outcome: response ? 'success' : 'failure',
    route: '/cart',
    referenceType: 'cart_item',
    referenceId: itemId,
    details: { quantity },
  });

  return response;
}

export async function removeStorefrontCartItem(itemId: string) {
  const response = await mutateCart(`/orders/me/cart/items/${itemId}`, {
    method: 'DELETE',
  });

  await recordStorefrontTelemetryEvent({
    eventName: 'buyer_cart_item_removed',
    outcome: response ? 'success' : 'failure',
    route: '/cart',
    referenceType: 'cart_item',
    referenceId: itemId,
  });

  return response;
}

export async function addStorefrontCartItem(payload: AddCartItemPayload) {
  const response = await mutateCart('/orders/me/cart/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  await recordStorefrontTelemetryEvent({
    eventName: 'buyer_add_to_cart',
    outcome: response ? 'success' : 'failure',
    route: `/${payload.categorySlug}/${payload.productSlug}`,
    referenceType: 'product',
    referenceId: `${payload.categorySlug}/${payload.productSlug}`,
    details: {
      color: payload.color,
      size: payload.size,
      quantity: payload.quantity,
    },
  });

  return response;
}
