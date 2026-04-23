import type { Metadata } from 'next';
import { StorefrontCartPage } from '@/components/storefront/cart-page';
import { getStorefrontCartData } from '@/lib/storefront-commerce';

export const metadata: Metadata = {
  title: 'Keranjang | Yoora Sarah',
  description: 'Ringkasan koleksi yang siap dilanjutkan ke checkout.',
};

export default async function CartPage() {
  const { cartItems, trustSignals } = await getStorefrontCartData();

  return <StorefrontCartPage initialCartItems={cartItems} trustSignals={trustSignals} />;
}
