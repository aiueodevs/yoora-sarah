'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  Send,
  Loader2,
  ShieldCheck,
  Truck,
  Heart,
} from 'lucide-react';
import type { ProductDetail, CategoryFeature } from '@/lib/storefront-data';
import { formatRupiah } from '@/lib/storefront-data';
import { ProductCard } from '@/components/product/product-card';

/* ─── Featured Categories ─── */

function FeaturedCategories({ categories }: { categories: CategoryFeature[] }) {
  const showcaseCategories = categories.slice(0, 6);

  return (
    <section className="px-4 py-20 md:px-6 xl:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="premium-kicker">Kategori Pilihan</p>
          <h2 className="premium-title-lg mt-4">
            Temukan koleksi yang sesuai dengan gaya Anda
          </h2>
          <p className="premium-copy mx-auto mt-4 max-w-2xl">
            Jelajahi kategori busana muslimah yang dikurasi dengan tone lembut,
            siluet rapi, dan perhatian pada detail yang membuat setiap look
            terasa selesai.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {showcaseCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className={`group premium-panel hover-lift relative overflow-hidden rounded-[2rem] ${
                index < 2 ? 'lg:col-span-1 lg:row-span-1' : ''
              }`}
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              <div className="relative h-64 overflow-hidden sm:h-72 lg:h-80">
                <Image
                  src={category.heroImage}
                  alt={category.name}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.15]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(24,16,12,0.8)] via-[rgba(24,16,12,0.2)] to-transparent transition-opacity duration-700 group-hover:opacity-90" />
                <div className="absolute inset-x-5 bottom-5 translate-y-8 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
                  <p className="text-[0.62rem] uppercase tracking-[0.28em] text-white/70">
                    {category.eyebrow ?? 'Koleksi'}
                  </p>
                  <h3 className="mt-2 font-display text-2xl tracking-[-0.04em] text-white">
                    {category.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80 opacity-0 transition-opacity duration-700 delay-100 group-hover:opacity-100">
                    {category.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/90 opacity-0 translate-y-4 transition-all duration-500 delay-200 group-hover:translate-y-0 group-hover:opacity-100">
                    Lihat Koleksi
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── AI Stylist Section ─── */

interface StylistMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Array<{
    name: string;
    category: string;
    price: number;
    image: string;
  }>;
}

const STYLIST_WELCOME = `Hai! Saya AI Stylist Premium Yoora Sarah. 🎨

Saya bisa bantu Anda:
• Mix & Match — Pilih dress, saya cari hijab & aksesoris yang cocok
• Style Advice — Rekomendasi berdasarkan occasion
• Outfit Templates — Template outfit siap pakai

Mau mulai? Pilih dress favorit Anda atau ceritakan gaya yang Anda mau!`;

const quickActions = [
  {
    label: 'Mix & Match',
    prompt: 'Bantu saya mix & match untuk acara formal',
    icon: '🎨',
  },
  {
    label: 'Style Advice',
    prompt: 'Rekomendasikan outfit untuk acara pengajian',
    icon: '✨',
  },
  {
    label: 'Casual Look',
    prompt: 'Saya butuh outfit kasual yang tetap rapi',
    icon: '👗',
  },
  {
    label: 'Set Lengkap',
    prompt: 'Carikan saya set lengkap dengan dress dan khimar',
    icon: '💎',
  },
];

function AiStylistSection() {
  const [messages, setMessages] = useState<StylistMessage[]>([
    { id: 'welcome', role: 'assistant', content: STYLIST_WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: StylistMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/ai/stylist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await response.json();

      const assistantMessage: StylistMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          data.content || 'Maaf, ada sedikit gangguan. Coba lagi ya.',
        products: data.products,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            'Maaf, AI Stylist sedang tidak bisa diakses. Silakan coba lagi nanti atau hubungi kami langsung melalui WhatsApp!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="stylist" className="scroll-mt-20 px-4 py-20 md:px-6 xl:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="premium-shell overflow-hidden rounded-[2.5rem]">
          {/* Decorative top line */}
          <div className="absolute inset-x-12 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(173,136,112,0.58),transparent)]" />

          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left: Info Panel */}
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-[#3a2822] to-[#241915] shadow-[0_18px_36px_rgba(36,25,21,0.2)]">
                <Sparkles className="h-7 w-7 text-[#fff7f2]" />
              </div>

              <p className="premium-kicker mt-6">AI Stylist Premium</p>
              <h2 className="premium-title-xl mt-4">
                Personal stylist yang mengerti gaya Anda.
              </h2>
              <p className="premium-copy mt-5 max-w-lg">
                Dapatkan rekomendasi outfit yang dipersonalisasi berdasarkan
                preferensi Anda. Mix & match dress, hijab, dan aksesoris
                dengan bantuan AI yang memahami koleksi Yoora Sarah.
              </p>

              {/* Quick Actions */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => void handleSend(action.prompt)}
                    className="premium-panel-soft group rounded-[1.4rem] px-4 py-4 text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:bg-white/90 hover:shadow-[0_24px_48px_rgba(58,39,28,0.1)]"
                  >
                    <span className="inline-block text-xl transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125 group-hover:-rotate-6">{action.icon}</span>
                    <p className="mt-2 text-sm font-medium text-[#241915]">
                      {action.label}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span className="premium-pill px-4 py-2 text-[0.68rem] uppercase tracking-[0.18em]">
                  Gratis untuk semua member
                </span>
                <span className="premium-pill px-4 py-2 text-[0.68rem] uppercase tracking-[0.18em]">
                  Rekomendasi real-time
                </span>
              </div>
            </div>

            {/* Right: Chat Panel */}
            <div className="border-t border-[rgba(141,115,99,0.14)] lg:border-l lg:border-t-0">
              <div className="flex h-full flex-col">
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b border-[rgba(141,115,99,0.12)] px-6 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2822] to-[#241915]">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#241915]">
                      AI Stylist
                    </p>
                    <p className="text-[0.68rem] text-[#7c665b]">
                      Siap membantu styling Anda
                    </p>
                  </div>
                  <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-5" style={{ maxHeight: '420px', minHeight: '360px' }}>
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-[#3a2822] to-[#241915] text-[#fff7f2] shadow-[0_8px_20px_rgba(36,25,21,0.14)]'
                              : 'premium-panel-soft text-[#35241d]'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                          {msg.products && msg.products.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {msg.products.map((product, i) => (
                                <div
                                  key={i}
                                  className="overflow-hidden rounded-xl border border-[rgba(141,115,99,0.14)] bg-white"
                                >
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-24 w-full object-cover"
                                  />
                                  <div className="p-2">
                                    <p className="truncate text-xs font-medium text-[#241915]">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-[#7c665b]">
                                      Rp {product.price.toLocaleString('id-ID')}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="premium-panel-soft flex items-center gap-2 rounded-[1.25rem] px-4 py-3">
                          <Loader2 className="h-4 w-4 animate-spin text-[#7c665b]" />
                          <span className="text-sm text-[#7c665b]">
                            Menyiapkan rekomendasi...
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input */}
                <div className="border-t border-[rgba(141,115,99,0.12)] px-4 py-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSend();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ceritakan gaya yang Anda inginkan..."
                      className="premium-input flex-1 rounded-full px-4 py-2.5 text-sm text-[#241915] placeholder:text-[#8d776c] focus:outline-none"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="premium-button-primary flex h-10 w-10 items-center justify-center rounded-full transition hover:brightness-110 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── New Arrivals ─── */

function NewArrivals({ products }: { products: ProductDetail[] }) {
  const displayProducts = products.slice(0, 8);

  return (
    <section className="px-4 py-20 md:px-6 xl:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 border-b border-[rgba(141,115,99,0.16)] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="premium-kicker">Koleksi Terbaru</p>
            <h2 className="premium-title-lg mt-3">Baru datang, siap dimiliki.</h2>
            <p className="mt-4 text-sm text-[#6f5b52]">
              Produk terbaru dengan tone studio yang lembut dan potongan yang
              sudah dikurasi.
            </p>
          </div>
          <Link
            href="/dress"
            className="premium-button-secondary inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition hover:border-[rgba(77,55,46,0.24)]"
          >
            Lihat Semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Brand Story ─── */

function BrandStory() {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: 'Kualitas Terjaga',
      description:
        'Setiap produk dipilih dan dikurasi dengan standar yang tinggi untuk memastikan kenyamanan dan keanggunan.',
    },
    {
      icon: Truck,
      title: 'Pengiriman Aman',
      description:
        'Diproses dari Jawa Barat dengan pembaruan status langsung ke WhatsApp Anda.',
    },
    {
      icon: Heart,
      title: 'Layanan Personal',
      description:
        'Tim support yang siap membantu, dari pemilihan ukuran hingga styling advice.',
    },
  ];

  return (
    <section className="px-4 py-20 md:px-6 xl:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="premium-shell overflow-hidden rounded-[2.5rem] p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="premium-kicker">Tentang Yoora Sarah</p>
            <h2 className="premium-title-lg mt-4">
              Busana muslimah yang berbicara lewat kehalusan.
            </h2>
            <p className="premium-copy mx-auto mt-5 max-w-2xl">
              Yoora Sarah hadir untuk perempuan yang menghargai detail. Setiap
              koleksi dirancang dengan perhatian penuh pada kenyamanan bahan,
              keindahan warna, dan siluet yang membuat Anda tampil percaya diri
              di setiap momen.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {trustItems.map((item, index) => (
              <div
                key={item.title}
                className="premium-panel-soft group rounded-[1.8rem] p-6 text-center transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(58,39,28,0.08)] opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2822] to-[#241915] shadow-[0_12px_24px_rgba(36,25,21,0.14)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-3 group-hover:scale-110 group-hover:shadow-[0_20px_40px_rgba(36,25,21,0.3)]">
                  <item.icon className="h-5 w-5 text-[#fff7f2]" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#241915] transition-colors duration-300 group-hover:text-[#3a2822]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#6f5b52]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Export ─── */

interface HomeSectionsProps {
  categories: CategoryFeature[];
  products: ProductDetail[];
}

export function HomeSections({ categories, products }: HomeSectionsProps) {
  return (
    <div className="premium-page">
      <FeaturedCategories categories={categories} />
      <AiStylistSection />
      <NewArrivals products={products} />
      <BrandStory />
    </div>
  );
}
