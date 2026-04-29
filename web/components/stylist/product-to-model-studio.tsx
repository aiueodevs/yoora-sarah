"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { PremiumLoader } from "@/components/ui/premium-loader";

type StylistProduct = {
  id?: string;
  name: string;
  slug?: string;
  category: string;
  categoryLabel?: string;
  price: number;
  image: string;
};

type ProductToModelResult = {
  status: string;
  provider: string;
  predictionId?: string | null;
  imageUrl?: string | null;
  error?: string | null;
  prompt: string;
  sourceImage: string;
  metadata?: {
    isMock?: boolean;
    note?: string;
    productName?: string;
    category?: string;
    model?: string;
    size?: string;
    quality?: string;
  };
};

type ProductToModelStudioProps = {
  className?: string;
};

const supportedCategories = [
  { value: "dress", label: "Dress" },
  { value: "abaya-2481", label: "Abaya" },
  { value: "one-set-5182", label: "One Set" },
  { value: "essentials-7002", label: "Essentials" },
];

const modelDirections = [
  { value: "studio-catalog", label: "Katalog Studio" },
  { value: "soft-editorial", label: "Editorial Lembut" },
  { value: "campaign-close", label: "Close-up Campaign" },
];

const backgroundDirections = [
  { value: "soft-stone", label: "Batu Lembut" },
  { value: "warm-ivory", label: "Ivory Hangat" },
  { value: "editorial-shadow", label: "Bayangan Editorial" },
];

export function ProductToModelStudio({ className = "" }: ProductToModelStudioProps) {
  const [category, setCategory] = useState(supportedCategories[0]?.value ?? "dress");
  const [products, setProducts] = useState<StylistProduct[]>([]);
  const [selectedProductSlug, setSelectedProductSlug] = useState("");
  const [direction, setDirection] = useState(modelDirections[0]?.value ?? "studio-catalog");
  const [background, setBackground] = useState(backgroundDirections[0]?.value ?? "soft-stone");
  const [prompt, setPrompt] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductToModelResult | null>(null);

  const selectedProduct = products.find((product) => product.slug === selectedProductSlug) ?? null;

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoadingProducts(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/ai/stylist/products/${category}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Produk stylist belum bisa dimuat.");
        }
        const data = (await response.json()) as StylistProduct[];
        if (cancelled) return;
        setProducts(data);
        setSelectedProductSlug((current) =>
          data.some((product) => product.slug === current) ? current : (data[0]?.slug ?? "")
        );
      } catch (fetchError) {
        if (cancelled) return;
        setProducts([]);
        setSelectedProductSlug("");
        setError(fetchError instanceof Error ? fetchError.message : "Produk stylist belum bisa dimuat.");
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }

    void loadProducts();
    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    if (!result?.predictionId || result.status === "succeeded" || result.status === "failed") {
      return;
    }

    let active = true;
    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/ai/stylist/product-to-model/${result.predictionId}`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as ProductToModelResult;
        if (!active) return;
        setResult(data);
        if (data.status === "succeeded" || data.status === "failed") {
          setIsGenerating(false);
          window.clearInterval(intervalId);
        }
      } catch {
        if (!active) return;
        setIsGenerating(false);
        setError("Polling hasil generation gagal. Coba submit ulang.");
        window.clearInterval(intervalId);
      }
    }, 3000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [result?.predictionId, result?.status]);

  async function handleGenerate() {
    if (!selectedProductSlug || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/v1/ai/stylist/product-to-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_slug: category,
          product_slug: selectedProductSlug,
          prompt: prompt.trim() || undefined,
          modelDirection: direction,
          background,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { detail?: string; error?: string } | null;
        throw new Error(payload?.detail ?? payload?.error ?? "Product-to-model belum bisa diproses.");
      }

      const data = (await response.json()) as ProductToModelResult;
      setResult(data);
      if (data.status === "succeeded" || data.status === "failed") {
        setIsGenerating(false);
      }
    } catch (generationError) {
      setIsGenerating(false);
      setError(generationError instanceof Error ? generationError.message : "Product-to-model belum bisa diproses.");
    }
  }

  return (
    <div className={className}>
      <div className="grid gap-2.5">
        <label className="grid gap-1.5">
          <span className="text-[0.6rem] uppercase tracking-[0.18em] text-[#8a6c5f]">Kategori</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-[rgba(156,131,117,0.1)] bg-white/70 px-3 py-2.5 text-[0.78rem] text-[#241915] focus:outline-none focus:ring-1 focus:ring-[rgba(92,67,55,0.18)]"
          >
            {supportedCategories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-[0.6rem] uppercase tracking-[0.18em] text-[#8a6c5f]">Produk</span>
          <select
            value={selectedProductSlug}
            onChange={(event) => setSelectedProductSlug(event.target.value)}
            disabled={loadingProducts || !products.length}
            className="rounded-xl border border-[rgba(156,131,117,0.1)] bg-white/70 px-3 py-2.5 text-[0.78rem] text-[#241915] focus:outline-none focus:ring-1 focus:ring-[rgba(92,67,55,0.18)] disabled:opacity-60"
          >
            {!products.length ? <option value="">Pilih produk</option> : null}
            {products.map((product) => (
              <option key={product.slug ?? product.name} value={product.slug}>
                {product.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-[0.6rem] uppercase tracking-[0.18em] text-[#8a6c5f]">Arah Gaya</span>
          <select
            value={direction}
            onChange={(event) => setDirection(event.target.value)}
            className="rounded-xl border border-[rgba(156,131,117,0.1)] bg-white/70 px-3 py-2.5 text-[0.78rem] text-[#241915] focus:outline-none focus:ring-1 focus:ring-[rgba(92,67,55,0.18)]"
          >
            {modelDirections.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-[0.6rem] uppercase tracking-[0.18em] text-[#8a6c5f]">Latar</span>
          <select
            value={background}
            onChange={(event) => setBackground(event.target.value)}
            className="rounded-xl border border-[rgba(156,131,117,0.1)] bg-white/70 px-3 py-2.5 text-[0.78rem] text-[#241915] focus:outline-none focus:ring-1 focus:ring-[rgba(92,67,55,0.18)]"
          >
            {backgroundDirections.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-[0.6rem] uppercase tracking-[0.18em] text-[#8a6c5f]">Catatan</span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Opsional: mood atau hasil akhir yang diinginkan."
            className="min-h-20 resize-none rounded-xl border border-[rgba(156,131,117,0.1)] bg-white/70 px-3 py-2.5 text-[0.78rem] leading-5 text-[#241915] placeholder:text-[#a2806e] focus:outline-none focus:ring-1 focus:ring-[rgba(92,67,55,0.18)]"
          />
        </label>
      </div>

      {selectedProduct ? (
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-[rgba(156,131,117,0.08)] bg-white/60 p-2.5">
          <img src={selectedProduct.image} alt={selectedProduct.name} className="h-11 w-10 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="truncate text-[0.76rem] font-medium text-[#241915]">{selectedProduct.name}</p>
            <p className="mt-0.5 text-[0.68rem] text-[#8a6c5f]">Rp {selectedProduct.price.toLocaleString("id-ID")}</p>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-[0.74rem] text-[#8d5f56]">{error}</p> : null}

      <button
        type="button"
        onClick={() => void handleGenerate()}
        disabled={!selectedProductSlug || isGenerating || loadingProducts}
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#241915] px-4 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-[#fff7f2] transition hover:bg-[#3a2822] disabled:opacity-45"
      >
        {isGenerating ? (
          <>
            <PremiumLoader className="h-4 w-4 text-white" />
            Menyiapkan Preview
          </>
        ) : (
          <>
            Buat Preview
            <Sparkles className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      {result ? (
        <div className="mt-3 rounded-xl border border-[rgba(156,131,117,0.08)] bg-white/60 p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#8a6c5f]">Hasil Preview</p>
          {result.imageUrl ? (
            <div className="mt-2 flex justify-center overflow-hidden rounded-xl bg-[#f4ede7] py-2">
              <img src={result.imageUrl} alt="Preview produk ke model" className="h-[200px] w-auto rounded-lg object-contain shadow-sm" />
            </div>
          ) : null}
          <p className="mt-2 text-[0.72rem] leading-5 text-[#6f5b52]">
            {result.metadata?.note ?? "Hasil preview akan tampil di sini setelah siap."}
          </p>
          {result.error ? (
            <p className="mt-2 text-[0.72rem] text-[#8d5f56]">{result.error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
