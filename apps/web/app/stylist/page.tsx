'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Paperclip, X } from 'lucide-react';

interface StylistMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Array<{
    name: string;
    category: string;
    price: number;
    image: string;
    slug?: string;
  }>;
  image?: string;
}

const STYLIST_WELCOME = `Selamat datang di layanan Stylist eksklusif Yoora Sarah.

Bagaimana saya bisa menyempurnakan penampilan Anda hari ini? Ceritakan acara yang akan dihadiri atau nuansa yang ingin Anda tampilkan.`;

const quickActions = [
  { label: 'Mix & Match', prompt: 'Bantu saya membuat padu padan outfit. Saya sedang mencari gaya yang ' },
  { label: 'Cari by Acara', prompt: 'Saya akan menghadiri acara [sebutkan acara], tolong rekomendasikan pakaian yang cocok.' },
  { label: 'Eksplorasi Warna', prompt: 'Carikan saya produk Yoora Sarah yang berwarna ' },
  { label: 'Gaya Kasual', prompt: 'Berikan ide gaya kasual yang santai namun tetap terlihat rapi untuk ' },
];

export default function StylistPage() {
  const [messages, setMessages] = useState<StylistMessage[]>([
    { id: 'welcome', role: 'assistant', content: STYLIST_WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim();
    if ((!text && !imageFile) || isLoading) return;

    const userMessage: StylistMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      image: imageFile || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setImageFile(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/ai/stylist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          image: userMessage.image,
          history: messages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await response.json();

      const assistantMessage: StylistMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Mohon maaf, layanan sedang sibuk. Silakan coba beberapa saat lagi.',
        products: data.products,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Mohon maaf, layanan sedang tidak tersedia. Silakan hubungi kami via WhatsApp untuk bantuan langsung.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="premium-page relative flex h-[calc(100dvh-72px)] md:h-[calc(100dvh-85px)] flex-col overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,248,243,0.8),transparent_70%)]" />
      
      <div className="relative z-10 flex flex-1 flex-col min-h-0 mx-auto w-full max-w-[92rem] px-3 md:px-6 xl:px-10 py-3 md:py-6 lg:py-10">
        
        <div className="mb-3 md:mb-6 text-center">
          <p className="premium-kicker tracking-[0.3em] hidden md:block">Bespoke Styling</p>
          <h1 className="mt-1 md:mt-3 font-display text-2xl leading-none tracking-[-0.04em] text-[#241915] md:text-5xl lg:text-6xl">
            AI Stylist
          </h1>
        </div>

        <div className="premium-shell flex flex-1 flex-col min-h-0 overflow-hidden rounded-[1.5rem] md:rounded-[2rem] lg:flex-row shadow-[0_40px_100px_rgba(58,39,28,0.08)]">
          
          {/* Mobile Quick Actions — horizontal scroll chips */}
          <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-[rgba(166,132,111,0.15)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                className="shrink-0 rounded-full border border-[rgba(166,132,111,0.2)] bg-white/60 px-4 py-2 text-[0.78rem] font-medium text-[#3a2822] transition active:scale-95 hover:bg-white hover:border-[rgba(166,132,111,0.4)]"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Left Panel: Introduction & Prompts */}
          <div className="hidden flex-col justify-between border-r border-[rgba(166,132,111,0.15)] bg-[rgba(255,253,250,0.4)] p-10 lg:flex lg:w-5/12 xl:w-1/3">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2822] to-[#241915] shadow-[0_12px_24px_rgba(36,25,21,0.15)]">
                <Sparkles className="h-5 w-5 text-[#fff7f2]" />
              </div>
              <h2 className="mt-8 font-display text-3xl tracking-[-0.03em] text-[#241915]">
                Sentuhan personal untuk setiap koleksi.
              </h2>
              <p className="mt-4 text-[0.95rem] leading-8 text-[#6f5b52]">
                Asisten virtual kami dilatih khusus untuk memahami proporsi, padu padan warna, dan etiket berbusana muslimah. Kami merangkai setiap potong koleksi Yoora Sarah menjadi kesatuan yang elegan khusus untuk Anda.
              </p>
            </div>

            <div className="mt-12">
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-[#9a7b6b]">Saran Interaksi</p>
              <div className="mt-4 space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="group flex w-full items-center justify-between rounded-full border border-[rgba(166,132,111,0.2)] bg-white/60 px-5 py-3 text-left transition hover:border-[rgba(166,132,111,0.4)] hover:bg-white hover:shadow-[0_12px_30px_rgba(58,39,28,0.06)]"
                  >
                    <span className="text-[0.85rem] font-medium text-[#3a2822]">{action.label}</span>
                    <span className="text-[#a2806e] transition-transform group-hover:translate-x-1">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Chat Interface */}
          <div className="flex flex-1 flex-col min-h-0 bg-white/80">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 space-y-4 md:space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] lg:max-w-[80%] rounded-[1.5rem] px-6 py-5 text-[0.95rem] leading-[1.8] shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-[#3a2822] to-[#241915] text-[#fff7f2] rounded-tr-sm'
                        : 'premium-panel-soft text-[#35241d] rounded-tl-sm border border-[rgba(166,132,111,0.1)]'
                    }`}
                  >
                    {msg.image && (
                      <div className="mb-4 overflow-hidden rounded-xl bg-white/10">
                        <img src={msg.image} alt="Uploaded" className="max-h-60 w-auto object-contain" />
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-8 rounded-2xl bg-[#fffcfaf0] p-5 shadow-[0_10px_40px_rgba(58,39,28,0.05)] border border-[rgba(166,132,111,0.15)]">
                        <div className="mb-5 flex items-center justify-between">
                          <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[#8a6c5f]">Curated Lookbook</p>
                          <Sparkles className="h-3 w-3 text-[#d4b9a8]" />
                        </div>
                        
                        {/* Layout: 1 Product */}
                        {msg.products.length === 1 && (
                          <div className="max-w-[220px]">
                            <a href={`/${msg.products[0].category}/${msg.products[0].slug}`} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl bg-white border border-[rgba(166,132,111,0.1)] transition hover:border-[#8a6c5f] hover:shadow-lg">
                              <div className="relative aspect-[3/4] overflow-hidden bg-[#f4ede7]">
                                <img src={msg.products[0].image} alt={msg.products[0].name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                              </div>
                              <div className="p-4 text-center">
                                <p className="truncate text-[0.85rem] font-medium text-[#241915]">{msg.products[0].name}</p>
                                <p className="mt-1 text-[0.75rem] text-[#8a6c5f]">Rp {msg.products[0].price.toLocaleString('id-ID')}</p>
                              </div>
                            </a>
                          </div>
                        )}

                        {/* Layout: 2 Products (Staggered) */}
                        {msg.products.length === 2 && (
                          <div className="flex gap-4 max-w-[400px]">
                            <div className="w-1/2 pt-6">
                              <a href={`/${msg.products[0].category}/${msg.products[0].slug}`} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl bg-white border border-[rgba(166,132,111,0.1)] transition hover:border-[#8a6c5f] hover:shadow-lg">
                                <div className="relative aspect-[3/4] overflow-hidden bg-[#f4ede7]">
                                  <img src={msg.products[0].image} alt={msg.products[0].name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                                </div>
                                <div className="p-3 text-center">
                                  <p className="truncate text-[0.75rem] font-medium text-[#241915]">{msg.products[0].name}</p>
                                </div>
                              </a>
                            </div>
                            <div className="w-1/2">
                              <a href={`/${msg.products[1].category}/${msg.products[1].slug}`} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl bg-white border border-[rgba(166,132,111,0.1)] transition hover:border-[#8a6c5f] hover:shadow-lg">
                                <div className="relative aspect-[3/4] overflow-hidden bg-[#f4ede7]">
                                  <img src={msg.products[1].image} alt={msg.products[1].name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                                </div>
                                <div className="p-3 text-center">
                                  <p className="truncate text-[0.75rem] font-medium text-[#241915]">{msg.products[1].name}</p>
                                </div>
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Layout: 3 or more Products (Magazine Style) */}
                        {msg.products.length >= 3 && (
                          <div className="grid grid-cols-12 gap-3 max-w-[480px]">
                            {/* Main Featured Item */}
                            <div className="col-span-7">
                              <a href={`/${msg.products[0].category}/${msg.products[0].slug}`} target="_blank" rel="noreferrer" className="group block h-full overflow-hidden rounded-xl bg-white border border-[rgba(166,132,111,0.1)] transition hover:border-[#8a6c5f] hover:shadow-lg">
                                <div className="relative h-full min-h-[200px] w-full overflow-hidden bg-[#f4ede7]">
                                  <img src={msg.products[0].image} alt={msg.products[0].name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
                                    <p className="truncate text-[0.8rem] font-medium shadow-sm">{msg.products[0].name}</p>
                                  </div>
                                </div>
                              </a>
                            </div>
                            {/* Side Items */}
                            <div className="col-span-5 flex flex-col gap-3">
                              {msg.products.slice(1, 3).map((product, idx) => (
                                <a href={`/${product.category}/${product.slug}`} target="_blank" rel="noreferrer" key={idx} className="group block overflow-hidden rounded-xl bg-white border border-[rgba(166,132,111,0.1)] transition hover:border-[#8a6c5f] hover:shadow-lg">
                                  <div className="relative aspect-square overflow-hidden bg-[#f4ede7]">
                                    <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                                  </div>
                                  <div className="p-2 text-center bg-white">
                                    <p className="truncate text-[0.65rem] font-medium text-[#241915]">{product.name}</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 border-t border-[rgba(166,132,111,0.1)] pt-3 text-center">
                          <p className="text-[0.65rem] text-[#8a6c5f]">Klik foto untuk melihat detail produk</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="premium-panel-soft flex items-center gap-3 rounded-[1.5rem] rounded-tl-sm px-6 py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-[#8a6c5f]" />
                    <span className="text-[0.9rem] text-[#8a6c5f]">Menyusun rekomendasi...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-[rgba(166,132,111,0.15)] bg-white/90 p-3 md:p-5 md:px-10 md:py-6 relative">
              {imageFile && (
                <div className="absolute bottom-[105%] left-10 mb-2">
                  <div className="relative inline-block rounded-xl border border-[rgba(166,132,111,0.2)] bg-white p-2 shadow-lg">
                    <img src={imageFile} alt="Preview" className="h-20 w-auto rounded-lg object-contain" />
                    <button
                      onClick={() => setImageFile(null)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#3a2822] text-white shadow hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
                className="relative flex items-center rounded-full border border-[rgba(166,132,111,0.25)] bg-[rgba(255,253,250,0.8)] shadow-[inset_0_2px_6px_rgba(58,39,28,0.02)] focus-within:border-[#8a6c5f] focus-within:ring-1 focus-within:ring-[#8a6c5f] transition-all"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="ml-2 flex h-[2.6rem] w-[2.6rem] items-center justify-center rounded-full text-[#a2806e] transition hover:bg-[#f4ede7] hover:text-[#3a2822]"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ceritakan preferensi gaya atau lampirkan foto barang Anda..."
                  className="w-full bg-transparent px-4 py-4 text-[0.95rem] text-[#241915] placeholder:text-[#a2806e] focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={(!input.trim() && !imageFile) || isLoading}
                  className="mr-2 flex h-[2.6rem] w-[2.6rem] items-center justify-center rounded-full bg-gradient-to-br from-[#3a2822] to-[#241915] text-white transition hover:brightness-110 disabled:opacity-50 shadow-[0_4px_12px_rgba(36,25,21,0.2)]"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}