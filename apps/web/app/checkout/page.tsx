import type { Metadata } from 'next';
import Link from 'next/link';
import { getStorefrontCheckoutData } from '@/lib/storefront-commerce';
import { formatRupiah } from '@/lib/storefront-data';

export const metadata: Metadata = {
  title: 'Checkout | Yoora Sarah',
  description: 'Konfirmasi alamat, pengiriman, dan ringkasan pembayaran untuk pesanan Yoora Sarah.',
};

export default async function CheckoutPage() {
  const { checkoutSteps, cartItems, recipient, payment, totals, support } =
    await getStorefrontCheckoutData();

  return (
    <div className="premium-page px-4 pb-20 pt-24 md:px-6 md:pt-32 xl:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="premium-shell page-reveal grid gap-8 rounded-[2.5rem] p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
          <div>
            <p className="premium-kicker">Checkout</p>
            <h1 className="premium-title-xl mt-4">
              Langkah akhir yang lebih jelas, cepat, dan tetap terasa premium.
            </h1>
            <p className="premium-copy mt-5 max-w-2xl">
              Tinjau alamat, pengiriman, dan metode pembayaran tanpa harus membaca form yang terlalu panjang.
            </p>
            <div className="mt-8 space-y-3">
              {checkoutSteps.map((step, index) => (
                <div
                  key={step}
                  className="premium-panel-soft rounded-[1.5rem] px-5 py-4 text-sm leading-7 text-[#6f5b52]"
                >
                  <span className="mr-3 text-[#241915]">{index + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="premium-panel-soft rounded-[2rem] p-6">
              <p className="premium-kicker">Informasi penerima</p>
              <div className="mt-5 space-y-3 text-sm leading-7 text-[#6f5b52]">
                <p>{recipient.recipientName}</p>
                <p>{recipient.phone}</p>
                <p>{recipient.addressLine}</p>
              </div>
            </div>

            <div className="premium-panel-soft rounded-[2rem] p-6">
              <p className="premium-kicker">Pembayaran</p>
              <p className="mt-5 text-2xl font-medium text-[#241915]">{payment.methodLabel}</p>
              <p className="mt-3 text-sm leading-7 text-[#6f5b52]">
                {payment.confirmationInstruction}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#6f5b52]">
                {payment.dueLabel}
              </p>
            </div>
          </div>
        </section>

        <section className="page-reveal-delay mt-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="premium-panel rounded-[2rem] p-6 md:p-8">
            <p className="premium-kicker">Pesanan</p>
            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="premium-panel-soft flex items-center justify-between gap-4 rounded-[1.5rem] px-5 py-4"
                >
                  <div>
                    <p className="text-lg font-medium text-[#241915]">{item.name}</p>
                    <p className="mt-1 text-sm text-[#6f5b52]">
                      {item.color} / {item.size} / {item.quantity} item
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[#241915]">
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="premium-panel rounded-[2rem] p-6 md:p-8">
            <p className="premium-kicker">Total pembayaran</p>
            <div className="mt-6 space-y-4 text-sm text-[#6f5b52]">
              <div className="premium-row flex items-center justify-between gap-4 pb-4">
                <span>Subtotal</span>
                <span className="text-[#241915]">{formatRupiah(totals.subtotal)}</span>
              </div>
              <div className="premium-row flex items-center justify-between gap-4 pb-4">
                <span>Pengiriman</span>
                <span className="text-[#241915]">{formatRupiah(totals.shipping)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Layanan</span>
                <span className="text-[#241915]">{formatRupiah(totals.serviceFee)}</span>
              </div>
            </div>
            <div className="mt-6 border-t border-[rgba(141,115,99,0.14)] pt-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm uppercase tracking-[0.18em] text-[#8a6c5f]">Total</span>
                <span className="text-3xl font-medium text-[#241915]">{formatRupiah(totals.total)}</span>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-[#6f5b52]">
              {support.responseWindow} {support.businessHours}
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/profile"
                className="premium-button-primary px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.16em] transition hover:brightness-110"
              >
                Konfirmasi via akun
              </Link>
              <Link
                href="/cart"
                className="premium-button-secondary px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.16em] transition hover:border-[rgba(77,55,46,0.24)]"
              >
                Kembali ke keranjang
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
