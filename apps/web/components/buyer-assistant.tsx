"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import {
  getAssistantResponse,
} from "@/lib/buyer-ai-api";
import { recordBuyerEventAction } from "@/telemetry/actions";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; href: string }>;
  actions?: Array<{ key: string; label: string; href?: string | null; kind: string }>;
}

interface BuyerAssistantProps {
  className?: string;
}

export function BuyerAssistant({ className = "" }: BuyerAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Halo! Saya asisten Yoora Sarah. Saya bisa membantu Anda menemukan produk, cek ketersediaan, Lacak pesanan, atau jawab pertanyaan tentang kebijakan toko. Apa yang bisa saya bantu hari ini?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversation = [...messages, userMessage].map(({ role, content }) => ({ role, content }));
      await recordBuyerEventAction("buyer_assistant_query_submitted", {
        queryLength: userMessage.content.length,
      });
      const response = await getAssistantResponse(userMessage.content, conversation);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          response?.content ??
          "Mohon maaf, saya belum bisa mengambil jawaban saat ini. Silakan coba lagi atau hubungi support kami.",
        sources: response?.sources ?? undefined,
        actions: response?.actions ?? undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Mohon maaf, ada sedikit gangguan. Silakan coba lagi atau hubungi kami langsung melalui WhatsApp.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          void recordBuyerEventAction("buyer_assistant_open");
        }}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2822] to-[#241915] text-[#fff7f2] shadow-[0_20px_40px_rgba(36,25,21,0.32)] transition-all duration-300 hover:scale-105 hover:shadow-[0_24px_48px_rgba(36,25,21,0.4)] ${className}`}
        aria-label="Buka asisten belanja"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-[1.6rem] border border-[rgba(141,115,99,0.14)] bg-[rgba(255,253,250,0.98)] shadow-[0_30px_80px_rgba(36,25,21,0.22)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-[rgba(141,115,99,0.14)] bg-gradient-to-r from-[rgba(255,252,248,0.95)] to-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2822] to-[#241915]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-[#241915]">Yoora Assistant</h3>
                <p className="text-xs text-[#8a6c5f]">Selalu siap membantu</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a6c5f] transition hover:bg-[#f4ede7] hover:text-[#3a2822]"
              aria-label="Tutup asisten"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-[400px] overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-[#3a2822] to-[#241915] text-[#fff7f2] shadow-[0_8px_20px_rgba(36,25,21,0.14)]"
                        : "premium-panel-soft text-[#35241d]"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-200 pt-3">
                        {message.actions.map((action) => (
                          <a
                            key={action.key}
                            href={action.href ?? '/pages/hubungi-kami'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold transition ${action.kind === 'whatsapp' ? 'bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-[0_8px_20px_rgba(18,140,126,0.24)] hover:scale-[1.02]' : 'bg-[#f4ede7] text-[#241915] hover:bg-[#eadfd7]'}`}
                          >
                            {action.label}
                          </a>
                        ))}
                      </div>
                    )}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 border-t border-neutral-200 pt-2">
                        <p className="mb-1 text-xs font-medium text-[#8a6c5f]">Lihat juga:</p>
                        <ul className="space-y-1">
                          {message.sources.slice(0, 3).map((source, idx) => (
                            <li key={idx}>
                              <a
                                href={source.href}
                                className="text-xs text-[#6f5b52] underline hover:text-[#241915]"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {source.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] items-center gap-2 rounded-2xl bg-neutral-50 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                    <span className="text-sm text-neutral-500">Mengetik...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-[rgba(141,115,99,0.14)] px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pesan Anda..."
                className="premium-input flex-1 rounded-full px-4 py-2.5 text-sm text-[#241915] placeholder:text-[#8d776c] focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="premium-button-primary flex h-10 w-10 items-center justify-center rounded-full transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Kirim pesan"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
