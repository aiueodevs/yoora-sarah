"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowRight,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

import { OutfitComposer } from "@/components/outfit-composer";
import { ProductToModelStudio } from "@/components/stylist/product-to-model-studio";

type StylistProduct = {
  id?: string;
  name: string;
  category: string;
  categoryLabel?: string;
  price: number;
  image: string;
  slug?: string;
  role?: string;
  reason?: string;
};

type StylistLook = {
  id: string;
  title: string;
  note: string;
  occasion?: string;
  totalPrice?: number;
  products: StylistProduct[];
};

type ImageAnalysis = {
  itemType?: string;
  dominantColors?: string[];
  styleDirection?: string;
  compatibilityNote?: string;
};

type StylistMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  products?: StylistProduct[];
  looks?: StylistLook[];
  analysis?: ImageAnalysis | null;
  followUpPrompts?: string[];
  activeMode?: "brief" | "outfit" | "match-item" | "product-to-model";
  sessionSummary?: string;
};

const STYLIST_WELCOME = `Selamat datang di AI Stylist Yoora Sarah.

Saya bisa menyusun outfit lengkap dari katalog, menyiapkan alternatif look, dan membaca item referensi yang Anda upload seperti tas atau sepatu. Ceritakan occasion, warna, atau item yang ingin Anda padukan.`;

const quickActions = [
  {
    label: "Wedding Guest",
    mode: "brief" as const,
    prompt: "Buatkan outfit kondangan warna nude yang anggun dan langsung siap pakai.",
  },
  {
    label: "Office Signature",
    mode: "outfit" as const,
    prompt: "Saya butuh outfit kantor yang formal, tenang, dan terlihat premium.",
  },
  {
    label: "Black Bag Match",
    mode: "match-item" as const,
    prompt: "Saya upload tas hitam. Cocokkan dengan outfit yang refined dan tidak terlalu ramai.",
  },
  {
    label: "Luxury on Budget",
    mode: "brief" as const,
    prompt: "Buatkan outfit yang tetap premium tetapi total budget-nya lebih hemat.",
  },
];

const productToModelPrompt =
  "Buatkan visual hero product yang premium lalu bantu saya teruskan ke styling lengkapnya.";

const defaultFollowUpPrompts = [
  "Buatkan versi yang lebih formal untuk malam hari.",
  "Sesuaikan dengan item hitam atau nude yang sudah saya punya.",
  "Cari alternatif yang lebih hemat tetapi tetap refined.",
];

const emptyRailChecklist = [
  "Mulai dari brief singkat tentang occasion, warna, atau budget.",
  "Tambahkan tas atau sepatu pribadi bila ingin arah look lebih presisi.",
  "Setelah look pertama keluar, rail ini berubah jadi area refine cepat.",
];

const studioSignals = [
  {
    title: "Personal Brief",
    copy: "Occasion, warna, budget.",
  },
  {
    title: "Curated Looks",
    copy: "1 hero look, 2 alternatif.",
  },
  {
    title: "Refinement Rail",
    copy: "Refine tanpa mulai ulang.",
  },
];

function FollowUpChips({
  prompts,
  onSelect,
}: {
  prompts: string[];
  onSelect: (prompt: string) => void;
}) {
  if (!prompts.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-[rgba(156,131,117,0.18)] bg-white/78 px-3.5 py-2 text-[0.72rem] font-medium text-[#3a2822] transition hover:border-[rgba(92,67,55,0.28)] hover:bg-white"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

function ProductTile({
  product,
  compact = false,
}: {
  product: StylistProduct;
  compact?: boolean;
}) {
  return (
    <Link
      href={product.slug ? `/${product.category}/${product.slug}` : "#"}
      className={`group overflow-hidden rounded-[1.2rem] border border-[rgba(156,131,117,0.14)] bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(92,67,55,0.22)] hover:shadow-[0_18px_36px_rgba(58,39,28,0.08)] ${
        compact ? "" : ""
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f3ece6]">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        {product.role ? (
          <span className="absolute left-3 top-3 rounded-full bg-[rgba(36,25,21,0.76)] px-2.5 py-1 text-[0.56rem] uppercase tracking-[0.18em] text-[#fff7f2] backdrop-blur-md">
            {product.role}
          </span>
        ) : null}
      </div>
      <div className={compact ? "p-3" : "p-3.5"}>
        <p className="text-[0.64rem] uppercase tracking-[0.18em] text-[#8a6c5f]">
          {product.categoryLabel ?? product.category}
        </p>
        <p className="mt-2 text-[0.88rem] font-medium leading-6 text-[#241915]">{product.name}</p>
        <p className="mt-2 text-sm text-[#6f5b52]">Rp {product.price.toLocaleString("id-ID")}</p>
        {product.reason ? (
          <p className="mt-2 text-[0.74rem] leading-6 text-[#6f5b52]">{product.reason}</p>
        ) : null}
      </div>
    </Link>
  );
}

function ResultBoardEmpty({
  onSelect,
}: {
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="premium-panel flex h-full flex-col rounded-[1.9rem] p-5 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="premium-kicker">Curated Result Board</p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-[0.98] tracking-[-0.05em] text-[#241915] md:text-[2.4rem]">
            Hasil styling muncul di sini.
          </h2>
        </div>
        <span className="premium-pill hidden px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.18em] md:inline-flex">
          Studio Mode
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[1.6rem] border border-[rgba(156,131,117,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,240,234,0.82))] p-5">
          <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">Hero Look</p>
          <h3 className="mt-3 font-display text-[1.55rem] leading-none tracking-[-0.04em] text-[#241915]">
            Hero look menunggu brief Anda.
          </h3>
        </div>

        <div className="space-y-3">
          {["Alternative A", "Alternative B"].map((label) => (
            <div
              key={label}
              className="rounded-[1.35rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.8)] px-4 py-4"
            >
              <p className="text-[0.62rem] uppercase tracking-[0.2em] text-[#8a6c5f]">{label}</p>
              <p className="mt-2 text-sm leading-6 text-[#6f5b52]">Alternatif ringkas.</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-[1.45rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.74)] p-4">
        <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">
          Start With
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={`board-${action.label}`}
              type="button"
              onClick={() => onSelect(action.prompt)}
              className="rounded-full border border-[rgba(156,131,117,0.16)] bg-white/82 px-3.5 py-2 text-[0.74rem] font-medium text-[#3a2822] transition hover:border-[rgba(92,67,55,0.24)] hover:bg-white"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatLoadingState() {
  return (
    <div
      aria-live="polite"
      className="rounded-[1.45rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.8)] p-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(58,40,34,0.08)]">
          <Loader2 className="h-4 w-4 animate-spin text-[#8a6c5f]" />
        </div>
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">
            Stylist At Work
          </p>
          <p className="mt-1 text-[0.9rem] text-[#241915]">
            Menyusun hero look.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        {[
          "Menarik anchor product dari katalog.",
          "Menjaga balance warna, coverage, dan aksen.",
          "Merapikan output agar siap direfine.",
        ].map((step) => (
          <div
            key={step}
            className="rounded-[1rem] border border-[rgba(156,131,117,0.1)] bg-white/80 px-3 py-2.5"
          >
            <p className="text-[0.76rem] leading-6 text-[#6f5b52]">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: StylistMessage }) {
  const isUser = message.role === "user";

  return (
    <article
      data-message-role={message.role}
      className={`rounded-[1.35rem] border px-4 py-4 ${
        isUser
          ? "border-[rgba(60,43,34,0.08)] bg-[linear-gradient(135deg,#3a2822,#241915)] text-[#fff7f2]"
          : "border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.78)] text-[#35241d]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-[0.62rem] uppercase tracking-[0.22em] ${
            isUser ? "text-[#f6ddd2]" : "text-[#8a6c5f]"
          }`}
        >
          {isUser ? "Your Brief" : "Stylist Note"}
        </p>
      </div>

      {message.image ? (
        <div className="mt-3 overflow-hidden rounded-[1rem] bg-white/10">
          <img
            src={message.image}
            alt="Referensi user"
            className="max-h-56 w-full object-cover"
          />
        </div>
      ) : null}

      <p
        className={`mt-3 whitespace-pre-wrap text-[0.9rem] leading-7 ${
          isUser ? "text-[#fff7f2]" : "text-[#35241d]"
        }`}
      >
        {message.content}
      </p>

      {message.analysis ? (
        <div className="mt-4 rounded-[1rem] border border-[rgba(156,131,117,0.12)] bg-white/82 p-3 text-[#241915]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-[#8a6c5f]">
              Image Reading
            </p>
            <ImageIcon className="h-3.5 w-3.5 text-[#c8a997]" />
          </div>
          <p className="mt-2 text-[0.8rem] leading-6 text-[#6f5b52]">
            {message.analysis.compatibilityNote ??
              "Item referensi sudah dibaca untuk menjaga arah styling tetap selaras."}
          </p>
        </div>
      ) : null}
    </article>
  );
}

export default function StylistPage() {
  const [messages, setMessages] = useState<StylistMessage[]>([
    { id: "welcome", role: "assistant", content: STYLIST_WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"brief" | "outfit" | "match-item" | "product-to-model">("brief");
  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const briefInputRef = useRef<HTMLTextAreaElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const isEmptyConversation = messages.length === 1 && messages[0]?.id === "welcome";

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const latestStylistMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant" && message.id !== "welcome");
  const recommendationLooks = latestStylistMessage?.looks ?? [];
  const fallbackProducts = latestStylistMessage?.products ?? [];
  const activeLook = recommendationLooks[activeLookIndex] ?? null;
  const activeProducts = activeLook?.products ?? fallbackProducts;
  const alternativeLooks = recommendationLooks.filter((_, index) => index !== activeLookIndex);
  const sessionSummary =
    latestStylistMessage?.sessionSummary ??
    (isEmptyConversation
      ? "Mulai dari brief pertama Anda. Setelah hasil keluar, area ini dipakai untuk refine formalitas, tone, dan budget."
      : latestUserMessage?.content ??
        "Kirim brief pertama Anda. Setelah itu rail ini akan dipakai untuk revisi, upgrade, dan penyesuaian look.");
  const followUpPrompts =
    latestStylistMessage?.followUpPrompts && latestStylistMessage.followUpPrompts.length > 0
      ? latestStylistMessage.followUpPrompts
      : defaultFollowUpPrompts;
  const visibleMessages = isEmptyConversation ? messages : messages.slice(-6);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setActiveLookIndex(0);
  }, [latestStylistMessage?.id]);

  function handleQuickAction(prompt: string, mode?: "brief" | "outfit" | "match-item" | "product-to-model") {
    if (mode) {
      setActiveMode(mode);
    }
    setInput(prompt);
    if (isEmptyConversation) {
      briefInputRef.current?.focus();
      return;
    }
    chatInputRef.current?.focus();
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFileError("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("Ukuran gambar maksimal 5MB.");
      return;
    }

    setFileError(null);
    setImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function readApiErrorMessage(payload: unknown, fallback: string) {
    if (payload && typeof payload === "object") {
      const detail = (payload as { detail?: unknown }).detail;
      if (typeof detail === "string" && detail.trim()) {
        return detail;
      }
      if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object") {
        const message = (detail[0] as { msg?: unknown }).msg;
        if (typeof message === "string" && message.trim()) {
          return message;
        }
      }

      const content = (payload as { content?: unknown }).content;
      if (typeof content === "string" && content.trim()) {
        return content;
      }

      const error = (payload as { error?: unknown }).error;
      if (typeof error === "string" && error.trim()) {
        return error;
      }
    }

    return fallback;
  }

  async function handleSend(overrideInput?: string) {
    const text = (overrideInput ?? input).trim();
    if ((!text && !imageFile) || isLoading) {
      return;
    }

    const userMessage: StylistMessage = {
      id: `${Date.now()}`,
      role: "user",
      content: text || "Tolong analisa item yang saya upload dan cocokkan dengan katalog Yoora Sarah.",
      image: imageFile ?? undefined,
    };

    const history = messages.map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setImageFile(null);
    setImageName(null);
    setFileError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/ai/stylist/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          image: userMessage.image,
          mode: activeMode,
          history,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            content?: string;
            products?: StylistProduct[];
            looks?: StylistLook[];
            analysis?: ImageAnalysis | null;
            followUpPrompts?: string[];
            detail?: unknown;
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(
          readApiErrorMessage(
            data,
            "Layanan stylist sedang sibuk. Silakan coba lagi beberapa saat lagi."
          )
        );
      }

      const assistantMessage: StylistMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content:
          data?.content ??
          "Saya belum bisa menyusun rekomendasi saat ini. Silakan coba lagi beberapa saat lagi.",
        products: data?.products ?? [],
        looks: data?.looks ?? [],
        analysis: data?.analysis ?? null,
        followUpPrompts:
          data?.followUpPrompts && data.followUpPrompts.length > 0
            ? data.followUpPrompts
            : defaultFollowUpPrompts,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Mohon maaf, layanan stylist sedang sibuk. Silakan coba lagi atau lanjutkan ke WhatsApp untuk bantuan manual.",
          followUpPrompts: defaultFollowUpPrompts,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="premium-page relative min-h-[calc(100dvh-72px)] overflow-hidden md:min-h-[calc(100dvh-85px)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,248,243,0.82),transparent_28%),radial-gradient(circle_at_top_right,rgba(178,150,132,0.12),transparent_22%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[96rem] flex-col px-3 py-3 md:px-6 md:py-6 xl:px-10 lg:py-10">
        <section className="page-reveal premium-shell rounded-[2rem] px-5 py-6 md:px-8 md:py-8">
          <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr] xl:items-end">
            <div className="max-w-4xl">
              <p className="premium-kicker tracking-[0.32em]">Private Styling Studio</p>
              <h1 className="mt-3 font-display text-[2.35rem] leading-[0.95] tracking-[-0.06em] text-[#241915] md:text-[4.1rem]">
                Personal styling yang terasa seperti studio.
              </h1>
              <p className="mt-4 max-w-2xl text-[0.94rem] leading-7 text-[#6f5b52]">
                Brief singkat, hasil kurasi jelas, refinement cepat.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              {studioSignals.map((signal) => (
                <div
                  key={signal.title}
                  className="rounded-[1.1rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.64)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
                >
                  <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#8a6c5f]">
                    {signal.title}
                  </p>
                  <p className="mt-1 text-[0.76rem] leading-6 text-[#6f5b52]">{signal.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-reveal-delay mt-4 grid gap-4 xl:grid-cols-[0.96fr_1.36fr_0.9fr] xl:items-start">
          <aside className="premium-panel order-1 self-start rounded-[1.9rem] p-4 md:p-5 lg:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="premium-kicker">Studio Brief</p>
                <h2 className="mt-3 font-display text-[1.75rem] leading-[0.98] tracking-[-0.05em] text-[#241915]">
                  Brief yang ringkas.
                </h2>
              </div>
              <span className="premium-pill hidden px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.18em] md:inline-flex">
                Concierge
              </span>
            </div>

            {isEmptyConversation ? (
              <div className="mt-5 rounded-[1.45rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.8)] p-4">
                <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">
                  Your Direction
                </p>
                <textarea
                  ref={briefInputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Contoh: outfit kondangan tone nude, refined, budget aman."
                  className="mt-3 min-h-[8.5rem] w-full resize-none rounded-[1.15rem] border border-[rgba(156,131,117,0.16)] bg-white/88 px-4 py-3 text-[0.94rem] leading-7 text-[#241915] placeholder:text-[#a2806e] focus:outline-none focus:ring-1 focus:ring-[rgba(92,67,55,0.2)]"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={(!input.trim() && !imageFile) || isLoading}
                  className="premium-button-primary mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 px-5 text-[0.72rem] uppercase tracking-[0.2em] transition hover:brightness-110 disabled:opacity-45"
                >
                  Mulai Styling
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.45rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.8)] p-4">
                <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">
                  Active Session
                </p>
                <p className="mt-3 text-[0.9rem] leading-7 text-[#35241d]">
                  {latestUserMessage?.content ??
                    "Brief aktif akan dirangkum di sini begitu sesi styling dimulai."}
                </p>
                <button
                  type="button"
                  onClick={() => chatInputRef.current?.focus()}
                  className="premium-button-secondary mt-4 inline-flex min-h-11 items-center gap-2 px-4 text-[0.68rem] uppercase tracking-[0.18em] transition hover:bg-white"
                >
                  Refine in Chat
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="mt-5">
              <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">
                Curated Starting Points
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => handleQuickAction(action.prompt, action.mode)}
                    className="group flex items-center justify-between rounded-[1.2rem] border border-[rgba(156,131,117,0.14)] bg-[rgba(255,252,248,0.74)] px-4 py-3 text-left transition hover:border-[rgba(92,67,55,0.24)] hover:bg-white hover:shadow-[0_12px_28px_rgba(58,39,28,0.06)]"
                  >
                    <p className="text-[0.84rem] font-medium text-[#241915]">{action.label}</p>
                    <Wand2 className="h-4 w-4 shrink-0 text-[#a2806e] transition group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[1.45rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.74)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">
                    Add Your Item
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6f5b52]">
                    Upload tas, sepatu, atau item pribadi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="premium-button-secondary inline-flex h-11 w-11 shrink-0 items-center justify-center transition hover:bg-white"
                  aria-label="Upload gambar item"
                >
                  <Paperclip className="h-4.5 w-4.5" />
                </button>
              </div>

              {imageFile ? (
                <div className="mt-4 flex items-center gap-3 rounded-[1rem] border border-[rgba(156,131,117,0.12)] bg-white/88 p-3">
                  <img
                    src={imageFile}
                    alt="Preview upload"
                    className="h-14 w-14 rounded-[0.9rem] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#8a6c5f]">
                      Active Reference
                    </p>
                    <p className="mt-1 truncate text-sm text-[#241915]">
                      {imageName ?? "Gambar item referensi"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImageName(null);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#3a2822] text-white transition hover:bg-[#8d5f56]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}

              {fileError ? <p className="mt-3 text-sm text-[#8d5f56]">{fileError}</p> : null}
            </div>

            <OutfitComposer onPromptSelect={handleQuickAction} className="mt-5" />
            <ProductToModelStudio className="mt-5" />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </aside>

          <section className="order-2 self-start">
            {!latestStylistMessage && !isLoading ? (
              <ResultBoardEmpty onSelect={handleQuickAction} />
            ) : (
              <div className="premium-shell h-full rounded-[1.9rem] p-4 md:p-5 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="premium-kicker">Curated Result Board</p>
                    <h2 className="mt-3 font-display text-[1.8rem] leading-[0.98] tracking-[-0.05em] text-[#241915] md:text-[2.45rem]">
                      {activeLook?.title ?? "Result Board"}
                    </h2>
                  </div>
                  {activeLook?.totalPrice ? (
                    <span className="premium-pill px-3.5 py-2 text-[0.68rem] uppercase tracking-[0.18em]">
                      Total Rp {activeLook.totalPrice.toLocaleString("id-ID")}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[1.28fr_0.72fr]">
                  <div className="premium-panel rounded-[1.7rem] p-5 md:p-6">
                    <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">
                      Hero Look
                    </p>
                    <p className="mt-3 text-[0.92rem] leading-7 text-[#35241d]">
                      {activeLook?.note ??
                        latestStylistMessage?.content ??
                        "Studio akan menyiapkan rekomendasi utama berdasarkan brief yang Anda kirim."}
                    </p>

                    {latestStylistMessage?.analysis ? (
                      <div className="mt-4 rounded-[1.2rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.74)] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#8a6c5f]">
                            Compatibility Lens
                          </p>
                          <ImageIcon className="h-3.5 w-3.5 text-[#c8a997]" />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#6f5b52]">
                          {latestStylistMessage.analysis.compatibilityNote ??
                            "Item referensi dibaca untuk menjaga arah warna dan proporsi look."}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {activeProducts.map((product) => (
                        <ProductTile
                          key={`${product.category}-${product.slug}-${product.name}`}
                          product={product}
                          compact
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-[1.45rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.76)] p-4">
                      <p className="text-[0.64rem] uppercase tracking-[0.2em] text-[#8a6c5f]">
                        Stylist Direction
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#6f5b52]">
                        {latestStylistMessage?.content ??
                          "Reasoning stylist akan muncul setelah brief dikirim."}
                      </p>
                    </div>

                    {alternativeLooks.map((look) => {
                      const originalIndex = recommendationLooks.findIndex((item) => item.id === look.id);
                      return (
                        <button
                          key={look.id}
                          type="button"
                          onClick={() => setActiveLookIndex(originalIndex)}
                          className="w-full rounded-[1.45rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.76)] p-4 text-left transition hover:border-[rgba(92,67,55,0.24)] hover:bg-white hover:shadow-[0_14px_32px_rgba(58,39,28,0.06)]"
                        >
                          <p className="text-[0.62rem] uppercase tracking-[0.2em] text-[#8a6c5f]">
                            Alternative Look
                          </p>
                          <h3 className="mt-2 font-display text-[1.2rem] leading-none tracking-[-0.04em] text-[#241915]">
                            {look.title}
                          </h3>
                          <p className="mt-2 text-[0.8rem] leading-6 text-[#6f5b52]">
                            {look.note}
                          </p>
                          {look.totalPrice ? (
                            <p className="mt-3 text-[0.72rem] uppercase tracking-[0.16em] text-[#8a6c5f]">
                              Total Rp {look.totalPrice.toLocaleString("id-ID")}
                            </p>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="premium-panel order-3 flex flex-col self-start rounded-[1.9rem] p-4 md:p-5 lg:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="premium-kicker">
                  {isEmptyConversation ? "AI Stylist" : "Refinement Rail"}
                </p>
                <h2 className="mt-3 font-display text-[1.75rem] leading-[0.98] tracking-[-0.05em] text-[#241915]">
                  {isEmptyConversation
                    ? "Arah styling yang langsung bisa dipakai."
                    : "Refinement yang padat."}
                </h2>
              </div>
              <span className="premium-pill hidden px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.18em] md:inline-flex">
                {isEmptyConversation ? "Ready" : "Live Session"}
              </span>
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-3">
              <p className="text-[0.62rem] uppercase tracking-[0.2em] text-[#8a6c5f]">
                {isEmptyConversation ? "How It Works" : "Session Tone"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6f5b52]">
                {sessionSummary}
              </p>
            </div>

            <div
              className={`mt-4 space-y-3 pr-1 ${
                isEmptyConversation ? "" : "max-h-[46rem] overflow-y-auto"
              }`}
            >
              {visibleMessages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {isLoading ? <ChatLoadingState /> : null}
              <div ref={messagesEndRef} />
            </div>

            {!isEmptyConversation ? (
              <div className="mt-4">
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-[#8a6c5f]">
                  Prompt to Refine
                </p>
                <div className="mt-3">
                  <FollowUpChips prompts={followUpPrompts} onSelect={handleQuickAction} />
                </div>
              </div>
            ) : null}

            {!isEmptyConversation ? (
              <div className="mt-4">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSend();
                  }}
                  className="rounded-[1.55rem] border border-[rgba(166,132,111,0.2)] bg-[rgba(255,253,250,0.9)] p-2 shadow-[inset_0_2px_6px_rgba(58,39,28,0.03)] transition-all focus-within:border-[rgba(92,67,55,0.28)] focus-within:ring-1 focus-within:ring-[rgba(92,67,55,0.2)]"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#a2806e] transition hover:bg-[#f4ede7] hover:text-[#3a2822]"
                        aria-label="Upload gambar item"
                      >
                        <Paperclip className="h-4.5 w-4.5" />
                      </button>
                      <p className="text-[0.66rem] uppercase tracking-[0.18em] text-[#8a6c5f]">
                        Refine this session
                      </p>
                    </div>

                    <input
                      ref={chatInputRef}
                      type="text"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Minta versi lebih formal, lebih hemat, atau sesuaikan dengan item pribadi..."
                      className="w-full bg-transparent px-2 py-2 text-[0.92rem] text-[#241915] placeholder:text-[#a2806e] focus:outline-none"
                      disabled={isLoading}
                    />

                    <div className="flex items-center justify-between gap-3 px-2 pb-1">
                      <p className="text-[0.72rem] text-[#8a6c5f]">Maksimal gambar 5MB.</p>
                      <button
                        type="submit"
                        disabled={(!input.trim() && !imageFile) || isLoading}
                        className="premium-button-primary inline-flex h-11 min-w-11 items-center justify-center transition hover:brightness-110 disabled:opacity-45"
                        aria-label="Kirim ke AI stylist"
                      >
                        <Send className="ml-0.5 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div className="mt-4 rounded-[1.35rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.74)] p-4">
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-[#8a6c5f]">
                  Ready Flow
                </p>
                <div className="mt-3 grid gap-2">
                  {emptyRailChecklist.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1rem] border border-[rgba(156,131,117,0.1)] bg-white/78 px-3 py-2.5"
                    >
                      <p className="text-[0.78rem] leading-6 text-[#6f5b52]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
