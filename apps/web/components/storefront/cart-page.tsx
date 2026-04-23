'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useState, useTransition } from 'react';
import { CartItem } from '@/components/cart/cart-item';
import type { StorefrontCartItem } from '@yoora/database/catalog';
import type { StorefrontCartPayload } from '@yoora/database/commerce';
import { removeStorefrontCartItem, updateStorefrontCartItemQuantity } from '@/cart/actions';
import { formatRupiah } from '@/lib/storefront-data';
import { recordBuyerEventAction } from '@/telemetry/actions';

interface StorefrontCartPageProps {
  initialCartItems: StorefrontCartItem[];
  trustSignals: string[];
}

export function StorefrontCartPage({ initialCartItems, trustSignals }: StorefrontCartPageProps) {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [, startTransition] = useTransition();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 18000 : 0;
  const serviceFee = cartItems.length > 0 ? 2000 : 0;
  const total = subtotal + shipping + serviceFee;

  const handleUpdateQuantity = (id: string, quantity: number) => {
    const nextQuantity = Math.max(1, quantity);
    const nextItems = cartItems.map((item) => (item.id === id ? { ...item, quantity: nextQuantity } : item));
    setCartItems(nextItems);

    startTransition(() => {
      void updateStorefrontCartItemQuantity(id, nextQuantity).then((response: StorefrontCartPayload | null) => {
        if (response?.cartItems) {
          setCartItems(response.cartItems);
        }
      });
    });
  };

  const handleRemove = (id: string) => {
    const nextItems = cartItems.filter((item) => item.id !== id);
    setCartItems(nextItems);

    startTransition(() => {
      void removeStorefrontCartItem(id).then((response: StorefrontCartPayload | null) => {
        if (response?.cartItems) {
          setCartItems(response.cartItems);
        }
      });
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="premium-page px-4 pb-20 pt-24 md:px-6 md:pt-32 xl:px-10">
        <div className="premium-shell page-reveal mx-auto max-w-4xl rounded-[2.5rem] px-6 py-14 text-center md:px-10">
          <div className="premium-panel-soft mx-auto flex h-20 w-20 items-center justify-center rounded-full text-[#8a6c5f]">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <p className="premium-kicker mt-8">
            Keranjang kosong
          </p>
          <h1 className="premium-title-xl mt-4">Keranjang Anda masih kosong.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#6f5b52] md:text-base">
            Simpan produk dari wishlist atau jelajahi kategori pilihan untuk mulai menyusun pesanan.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/dress"
              className="premium-button-primary px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] transition hover:brightness-110"
            >
              Jelajahi dress
            </Link>
            <Link
              href="/wishlist"
              className="premium-button-secondary px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] transition hover:border-[rgba(77,55,46,0.24)]"
            >
              Buka wishlist
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-page px-4 pb-20 pt-24 md:px-6 md:pt-32 xl:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="premium-shell page-reveal grid gap-8 rounded-[2.5rem] p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <p className="premium-kicker">Keranjang belanja</p>
            <h1 className="premium-title-xl mt-4">Ringkasan belanja yang rapi sebelum checkout.</h1>
            <p className="premium-copy mt-5 max-w-2xl">
              Cek kembali warna, ukuran, dan total pembayaran sebelum melanjutkan ke langkah akhir.
            </p>
          </div>

          <div className="premium-panel-soft rounded-[2rem] p-5 md:p-6">
            <p className="premium-kicker">
              Nilai pesanan
            </p>
            <p className="mt-4 text-4xl font-medium text-[#261a16]">
              {formatRupiah(total)}
            </p>
            <div className="mt-6 space-y-3 text-sm leading-7 text-[#6f5b52]">
              {trustSignals.map((signal) => (
                <p key={signal}>{signal}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="page-reveal-delay mt-10 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                {...item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
            <div className="premium-panel rounded-[2rem] p-6 md:p-8">
              <p className="premium-kicker">
                Ringkasan
              </p>
              <div className="mt-6 space-y-4 text-sm text-[#6f5b52]">
                <div className="premium-row flex items-center justify-between gap-4 pb-4">
                  <span>Subtotal {cartItems.length} item</span>
                  <span className="text-[#241915]">{formatRupiah(subtotal)}</span>
                </div>
                <div className="premium-row flex items-center justify-between gap-4 pb-4">
                  <span>Pengiriman reguler</span>
                  <span className="text-[#241915]">{formatRupiah(shipping)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Layanan packing</span>
                  <span className="text-[#241915]">{formatRupiah(serviceFee)}</span>
                </div>
              </div>
              <div className="mt-6 border-t border-[rgba(141,115,99,0.14)] pt-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm uppercase tracking-[0.18em] text-[#8a6c5f]">
                    Total
                  </span>
                  <span className="text-3xl font-medium text-[#241915]">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/checkout"
                  onClick={() => {
                    void recordBuyerEventAction('buyer_checkout_started', {
                      cartItemCount: cartItems.length,
                      total,
                    }, '/cart');
                  }}
                  className="premium-button-primary px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.16em] transition hover:brightness-110"
                >
                  Lanjut ke checkout
                </Link>
                <Link
                  href="/wishlist"
                  className="premium-button-secondary px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.16em] transition hover:border-[rgba(77,55,46,0.24)]"
                >
                  Simpan untuk nanti
                </Link>
              </div>
            </div>

            <div className="premium-panel-soft rounded-[2rem] p-6 md:p-8">
              <p className="premium-kicker">
                Catatan belanja
              </p>
              <p className="mt-4 text-sm leading-7 text-[#6f5b52]">
                Di halaman checkout, Anda masih dapat meninjau ulang warna, ukuran, dan total pembayaran sebelum pesanan dikonfirmasi.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
