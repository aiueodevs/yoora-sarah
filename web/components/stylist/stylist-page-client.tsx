"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
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
import { StylistProductRail, type StylistRailProduct } from "@/components/stylist/stylist-product-rail";
import { PremiumLoader } from "@/components/ui/premium-loader";

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

type StylistPageClientProps = {
  railProducts: StylistRailProduct[];
};

const STYLIST_WELCOME = `Selamat datang di AI Stylist Yoora Sarah.

Ceritakan acara, nuansa, warna, atau item andalan Anda. Saya akan menyiapkan satu look utama beserta pilihan alternatif yang selaras.`;

const quickActions = [
  {
    label: "Tamu Undangan",
    mode: "brief" as const,
    prompt: "Susunkan look kondangan bernuansa netral lembut yang anggun dan langsung siap dipakai.",
  },
  {
    label: "Tampil di Kantor",
    mode: "outfit" as const,
    prompt: "Susunkan look kantor yang terlihat premium, rapi, dan tetap nyaman sepanjang hari.",
  },
  {
    label: "Padukan Tas Saya",
    mode: "match-item" as const,
    prompt: "Saya upload tas hitam. Padukan dengan outfit yang serasi, tenang, dan seimbang proporsinya.",
  },
  {
    label: "Mewah Tanpa Berlebihan",
    mode: "brief" as const,
    prompt: "Susunkan outfit bernuansa mewah yang tetap minimal, elegan, dan tidak berlebihan.",
  },
];

const productToModelPrompt =
  "Buat preview produk yang premium, lalu lanjutkan ke arahan styling lengkapnya.";

const defaultFollowUpPrompts = [
  "Buat lebih tegas untuk acara malam.",
  "Selaraskan dengan aksesori hitam saya.",
  "Siapkan versi yang lebih hemat budget.",
];

const emptyRailChecklist = [
  "Mulai dari acara, warna, atau budget.",
  "Tambahkan satu item pribadi agar hasil lebih presisi.",
  "Perhalus hasil pertama tanpa mengulang dari awal.",
];

const studioSignals = [
  { title: "Brief", copy: "Acara, nuansa, budget" },
  { title: "Kurasi", copy: "Look utama + pilihan" },
  { title: "Revisi", copy: "Ubah tanpa mulai ulang" },
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
  if (compact) {
    return (
      <Link
        href={product.slug ? `/${product.category}/${product.slug}` : "#"}
        className="group flex items-center gap-3 overflow-hidden rounded-xl border border-[rgba(156,131,117,0.1)] bg-white/80 p-2 transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(92,67,55,0.18)] hover:bg-white hover:shadow-[0_10px_20px_rgba(58,39,28,0.05)]"
      >
        <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f3ece6]">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {product.role ? (
            <span className="absolute left-1 top-1 rounded-full bg-[rgba(36,25,21,0.76)] px-1.5 py-0.5 text-[0.46rem] uppercase tracking-[0.14em] text-[#fff7f2] backdrop-blur-md">
              {product.role}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.76rem] font-medium leading-5 text-[#241915]">{product.name}</p>
          <p className="mt-0.5 text-[0.68rem] text-[#8a6c5f]">Rp {product.price.toLocaleString("id-ID")}</p>
          {product.reason ? (
            <p className="mt-1 line-clamp-1 text-[0.66rem] leading-4 text-[#6f5b52]">{product.reason}</p>
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={product.slug ? `/${product.category}/${product.slug}` : "#"}
      className="group overflow-hidden rounded-[1.35rem] border border-[rgba(156,131,117,0.12)] bg-white/92 transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(92,67,55,0.22)] hover:shadow-[0_18px_36px_rgba(58,39,28,0.08)]"
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
      <div className="p-3.5">
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
    <div className="premium-panel flex h-full flex-col rounded-[2rem] p-5 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="premium-kicker">Hasil Kurasi</p>
          <h2 className="mt-3 font-display text-[2rem] leading-[0.95] tracking-[-0.05em] text-[#241915] md:text-[2.7rem]">
            Look Anda akan tampil di sini.
          </h2>
        </div>
        <span className="premium-pill hidden px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.18em] md:inline-flex">
          Mode Studio
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[1.7rem] border border-[rgba(156,131,117,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,240,234,0.82))] p-5">
          <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">Look Utama</p>
          <h3 className="mt-3 font-display text-[1.65rem] leading-none tracking-[-0.04em] text-[#241915]">
            Menunggu brief Anda.
          </h3>
        </div>

        <div className="space-y-3">
          {["Alternatif A", "Alternatif B"].map((label) => (
            <div
              key={label}
              className="rounded-[1.35rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.8)] px-4 py-4"
            >
              <p className="text-[0.62rem] uppercase tracking-[0.2em] text-[#8a6c5f]">{label}</p>
              <p className="mt-2 text-sm leading-6 text-[#6f5b52]">Pilihan pelengkap akan tampil di sini.</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-[1.45rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.74)] p-4">
        <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">
          Mulai Cepat
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
    <div aria-live="polite" className="flex items-end gap-3 py-1.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3a2822,#241915)] shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-[#c8a997]" />
      </div>
      <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-sm border border-[rgba(156,131,117,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(252,247,242,0.9))] px-4 py-3 shadow-[0_4px_16px_rgba(58,39,28,0.03)] backdrop-blur-sm">
        <PremiumLoader className="h-4 w-10 shrink-0 text-[#a98774]" />
        <p className="text-[0.76rem] font-medium leading-none tracking-wide text-[#6f5b52]">Menyiapkan arahan styling Anda…</p>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: StylistMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-3 py-1.5 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-[linear-gradient(135deg,#241915,#3a2822)] text-[#fff7f2]"
            : "bg-[linear-gradient(135deg,#3a2822,#241915)] text-[#c8a997]"
        }`}
      >
        {isUser ? (
          <Send className="h-3.5 w-3.5" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
      </div>

      {/* bubble */}
      <article
        data-message-role={message.role}
        className={`max-w-[85%] px-4 py-3 ${
          isUser
            ? "rounded-2xl rounded-tr-sm bg-[linear-gradient(135deg,#3a2822,#241915)] text-[#fff7f2] shadow-[0_6px_16px_rgba(36,25,21,0.18)]"
            : "rounded-2xl rounded-tl-sm border border-[rgba(156,131,117,0.1)] bg-white/82 text-[#35241d] shadow-[0_4px_12px_rgba(58,39,28,0.04)]"
        }`}
      >
        {message.image ? (
          <div className="mb-2 overflow-hidden rounded-xl">
            <img
              src={message.image}
              alt="Referensi"
              className="max-h-40 w-full object-cover"
            />
          </div>
        ) : null}

        <p className={`whitespace-pre-wrap text-[0.84rem] leading-6 ${isUser ? "text-[#fff7f2]" : "text-[#35241d]"}`}>
          {message.content}
        </p>

        {message.analysis ? (
          <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-[rgba(200,169,151,0.1)] px-3 py-2">
            <ImageIcon className="mt-0.5 h-3 w-3 shrink-0 text-[#c8a997]" />
            <p className="text-[0.74rem] leading-5 text-[#6f5b52]">
              {message.analysis.compatibilityNote ??
                "Item referensi sudah dibaca agar hasil styling lebih selaras."}
            </p>
          </div>
        ) : null}
      </article>
    </div>
  );
}

export function StylistPageClient({ railProducts }: StylistPageClientProps) {
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
  const [isAdvancedPanelOpen, setIsAdvancedPanelOpen] = useState(false);
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
      ? "Mulai dari brief pertama Anda. Setelah hasil keluar, area ini dipakai untuk menyesuaikan formalitas, nuansa, dan budget."
      : latestUserMessage?.content ??
        "Kirim brief pertama Anda. Setelah itu area ini dipakai untuk revisi, upgrade, dan penyesuaian look.");
  const followUpPrompts =
    latestStylistMessage?.followUpPrompts && latestStylistMessage.followUpPrompts.length > 0
      ? latestStylistMessage.followUpPrompts
      : defaultFollowUpPrompts;
  const visibleMessages = isEmptyConversation ? messages : messages.slice(-3);

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
      const minDelay = new Promise((resolve) => setTimeout(resolve, 900));
      const responsePromise = fetch("/api/v1/ai/stylist/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          image: userMessage.image,
          mode: activeMode,
          history,
        }),
      });

      const [response] = await Promise.all([responsePromise, minDelay]);

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
    <main className="premium-page relative h-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,248,243,0.82),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(178,150,132,0.08),transparent_22%)]" />

      <div className="relative z-10 flex h-full min-w-0 flex-col">
        <div className="mx-auto grid h-full w-full min-w-0 flex-1 lg:grid-cols-[minmax(380px,440px)_minmax(0,1fr)]">

        {/* ── LEFT: Tools panel ── */}
        <aside className="flex h-full min-h-0 flex-col border-r border-[rgba(156,131,117,0.1)] bg-[linear-gradient(180deg,rgba(247,240,234,0.97),rgba(240,230,222,0.95))] backdrop-blur-xl">

          {/* ── panel header ── */}
          <div className="shrink-0 border-b border-[rgba(156,131,117,0.08)] px-5 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3a2822,#241915)]">
                <Sparkles className="h-4 w-4 text-[#c8a997]" />
              </div>
              <div>
                <h1 className="font-display text-[1rem] leading-none tracking-[-0.02em] text-[#241915]">AI Stylist</h1>
                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.2em] text-[#8a6c5f]">Yoora Sarah</p>
              </div>
            </div>
          </div>

          {/* ── fitur lanjutan langsung di panel kiri ── */}
          <div className="flex-1 overflow-y-auto px-5 py-4 md:px-6">
            <div className="grid gap-5">

              {/* Susun Outfit */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-[rgba(156,131,117,0.1)]" />
                  <span className="text-[0.56rem] uppercase tracking-[0.24em] text-[#a98774]">Susun Outfit</span>
                  <div className="h-px flex-1 bg-[rgba(156,131,117,0.1)]" />
                </div>
                <div className="rounded-2xl border border-[rgba(156,131,117,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(252,247,242,0.5))] p-4 shadow-[0_6px_16px_rgba(58,39,28,0.03)]">
                  <OutfitComposer onPromptSelect={handleQuickAction} />
                </div>
              </div>

              {/* Produk ke Model */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-[rgba(156,131,117,0.1)]" />
                  <span className="text-[0.56rem] uppercase tracking-[0.24em] text-[#a98774]">Produk ke Model</span>
                  <div className="h-px flex-1 bg-[rgba(156,131,117,0.1)]" />
                </div>
                <div className="rounded-2xl border border-[rgba(156,131,117,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(252,247,242,0.5))] p-4 shadow-[0_6px_16px_rgba(58,39,28,0.03)]">
                  <ProductToModelStudio />
                </div>
              </div>

            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </aside>

        {/* ── RIGHT: Result / conversation ── */}
        <section className="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(252,247,242,0.74))] px-5 py-3 md:px-7 md:py-4 lg:px-10 lg:py-4">
          <div className="mb-2 shrink-0">
            <StylistProductRail products={railProducts} />
          </div>


          {!latestStylistMessage && !isLoading ? (
            /* ── empty state ── */
            <div className="flex flex-1 items-center justify-center text-center">
              <div className="mx-auto max-w-xl">
                <Sparkles className="mx-auto h-8 w-8 text-[#c8a997]" />
                <h2 className="mt-5 font-display text-[2.4rem] leading-[0.9] tracking-[-0.06em] text-[#241915] md:text-[3.4rem]">
                  Hasil styling Anda
                  <br className="hidden md:block" />
                  akan tampil di sini.
                </h2>
                <p className="mt-4 text-[0.86rem] leading-7 text-[#8a6c5f]">
                  Mulai dari brief singkat atau pilih salah satu arahan cepat di bawah, lalu AI Stylist akan menyiapkan look utama dan alternatifnya.
                </p>
              </div>
            </div>
          ) : (
            /* ── result board ── */
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[rgba(156,131,117,0.08)] pb-5">
                <div>
                  <p className="text-[0.58rem] uppercase tracking-[0.3em] text-[#8a6c5f]">Hasil Kurasi</p>
                  <h2 className="mt-2 font-display text-[1.8rem] leading-[0.92] tracking-[-0.05em] text-[#241915] md:text-[2.6rem]">
                    {activeLook?.title ?? "Papan Hasil"}
                  </h2>
                </div>
                {activeLook?.totalPrice ? (
                  <span className="rounded-full border border-[rgba(156,131,117,0.12)] bg-white/70 px-3.5 py-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-[#6f5b52]">
                    Total Rp {activeLook.totalPrice.toLocaleString("id-ID")}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 grid min-h-0 flex-1 gap-4 overflow-y-auto xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
                {/* hero look */}
                <div className="flex flex-col p-5 md:p-6">
                  <p className="text-[0.56rem] uppercase tracking-[0.3em] text-[#8a6c5f]">Look Utama</p>
                  <p className="mt-3 max-w-xl text-[0.88rem] leading-7 text-[#35241d]">
                    {activeLook?.note ??
                      latestStylistMessage?.content ??
                      "Rekomendasi utama akan ditampilkan berdasarkan brief Anda."}
                  </p>

                  {latestStylistMessage?.analysis ? (
                    <div className="mt-4 flex items-start gap-3 rounded-xl bg-[rgba(255,252,248,0.6)] px-4 py-3">
                      <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c8a997]" />
                      <p className="text-[0.8rem] leading-6 text-[#6f5b52]">
                        {latestStylistMessage.analysis.compatibilityNote ??
                          "Item referensi telah dibaca untuk menyesuaikan arah look."}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-2">
                    {activeProducts.map((product) => (
                      <ProductTile
                        key={`${product.category}-${product.slug}-${product.name}`}
                        product={product}
                        compact
                      />
                    ))}
                  </div>
                </div>

                {/* sidebar: alternatives + refine */}
                <div className="flex flex-col gap-3">
                  {alternativeLooks.map((look) => {
                    const originalIndex = recommendationLooks.findIndex((item) => item.id === look.id);
                    return (
                      <button
                        key={look.id}
                        type="button"
                        onClick={() => setActiveLookIndex(originalIndex)}
                        className="w-full rounded-2xl bg-[rgba(255,252,248,0.5)] p-4 text-left transition hover:bg-white/70 hover:shadow-[0_10px_24px_rgba(58,39,28,0.04)]"
                      >
                        <p className="text-[0.56rem] uppercase tracking-[0.22em] text-[#8a6c5f]">Look Alternatif</p>
                        <h3 className="mt-1.5 font-display text-[1.15rem] leading-none tracking-[-0.03em] text-[#241915]">
                          {look.title}
                        </h3>
                        <p className="mt-1.5 text-[0.76rem] leading-6 text-[#6f5b52]">{look.note}</p>
                        {look.totalPrice ? (
                          <p className="mt-2 text-[0.66rem] uppercase tracking-[0.14em] text-[#8a6c5f]">
                            Rp {look.totalPrice.toLocaleString("id-ID")}
                          </p>
                        ) : null}
                      </button>
                    );
                  })}

                  <div className="mt-auto rounded-2xl border border-[rgba(156,131,117,0.08)] bg-[linear-gradient(180deg,rgba(255,252,248,0.72),rgba(247,239,233,0.58))] p-4 shadow-[0_10px_20px_rgba(58,39,28,0.03)]">
                    <p className="text-[0.56rem] uppercase tracking-[0.22em] text-[#8a6c5f]">Revisi</p>
                    <div className="mt-2.5">
                      <FollowUpChips prompts={followUpPrompts} onSelect={handleQuickAction} />
                    </div>
                  </div>
                </div>
              </div>

              {/* chat workspace — moved outside result board conditional */}
            </div>
          )}

          {/* ── chat workspace (always visible) ── */}
          <div className="shrink-0 border-t border-[rgba(156,131,117,0.06)] px-1 pt-3">

            {/* quick action chips — di atas chat */}
            <div className="mb-3 flex flex-wrap gap-1.5 px-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleQuickAction(action.prompt, action.mode)}
                  className="rounded-full border border-[rgba(156,131,117,0.12)] bg-[rgba(255,255,255,0.7)] px-3 py-1.5 text-[0.68rem] font-medium text-[#3a2822] transition hover:border-[rgba(92,67,55,0.22)] hover:bg-white hover:shadow-[0_6px_14px_rgba(58,39,28,0.05)]"
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div className="max-h-[10rem] space-y-2 overflow-y-auto">
              {visibleMessages.filter((m) => m.id !== "welcome").map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {isLoading ? <ChatLoadingState /> : null}
              <div ref={messagesEndRef} />
            </div>

            {!isEmptyConversation && followUpPrompts.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {followUpPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleQuickAction(prompt)}
                    className="rounded-full border border-[rgba(156,131,117,0.12)] bg-white/50 px-3 py-1.5 text-[0.66rem] text-[#6f5b52] transition hover:border-[rgba(92,67,55,0.2)] hover:bg-white/80 hover:text-[#3a2822]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            {imageFile ? (
              <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-[rgba(156,131,117,0.1)] bg-white/60 p-2">
                <img src={imageFile} alt="Preview" className="h-10 w-10 rounded-lg object-cover" />
                <p className="min-w-0 flex-1 truncate text-[0.74rem] text-[#6f5b52]">{imageName ?? "Item"}</p>
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImageName(null); }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#3a2822] text-white transition hover:bg-[#8d5f56]"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null}
            {fileError ? <p className="mt-2 text-[0.72rem] text-[#8d5f56]">{fileError}</p> : null}

            <form
              onSubmit={(event) => { event.preventDefault(); void handleSend(); }}
              className="mt-2.5 flex items-center gap-2 rounded-xl border border-[rgba(156,131,117,0.1)] bg-white/70 px-2.5 py-2"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#a2806e] transition hover:bg-[#f4ede7]"
                aria-label="Upload"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                ref={chatInputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={isEmptyConversation ? "Acara, nuansa warna, atau budget..." : "Revisi look, ubah formalitas, atau sesuaikan budget..."}
                className="min-w-0 flex-1 bg-transparent py-1.5 text-[0.88rem] text-[#241915] placeholder:text-[#b09a8e] focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={(!input.trim() && !imageFile) || isLoading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#241915] text-white transition hover:bg-[#3a2822] disabled:opacity-40"
                aria-label="Kirim"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </section>
        </div>
      </div>
    </main>
  );
}
