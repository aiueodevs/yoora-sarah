"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PremiumLoader } from "@/components/ui/premium-loader";

type Template = {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt?: string;
};

type Product = {
  id?: string;
  name: string;
  slug?: string;
  category: string;
  categoryLabel?: string;
  price: number;
  image: string;
  role?: string;
  reason?: string;
};

type TemplateBundle = {
  template: Template;
  products: Product[];
};

type OutfitComposerProps = {
  onPromptSelect?: (prompt: string) => void;
  className?: string;
};

export function OutfitComposer({
  onPromptSelect,
  className = "",
}: OutfitComposerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [bundle, setBundle] = useState<TemplateBundle | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingBundle, setIsLoadingBundle] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadTemplates() {
      setIsLoadingTemplates(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/v1/ai/stylist/templates", {
          cache: "no-store",
        });
        const data = (await response.json()) as Template[];
        if (!isActive) {
          return;
        }

        const nextTemplates = Array.isArray(data) ? data : [];
        setTemplates(nextTemplates);

        const firstTemplate = nextTemplates[0] ?? null;
        if (firstTemplate) {
          void selectTemplate(firstTemplate);
        }
      } catch {
        if (isActive) {
          setLoadError("Template styling belum dapat dimuat.");
        }
      } finally {
        if (isActive) {
          setIsLoadingTemplates(false);
        }
      }
    }

    void loadTemplates();

    return () => {
      isActive = false;
    };
  }, []);

  async function selectTemplate(template: Template) {
    setSelectedTemplateId(template.id);
    setIsLoadingBundle(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/v1/ai/stylist/templates/${template.id}/products`, {
        cache: "no-store",
      });
      const data = (await response.json()) as TemplateBundle;
      setBundle(data);
    } catch {
      setLoadError("Preview template belum dapat ditampilkan.");
      setBundle(null);
    } finally {
      setIsLoadingBundle(false);
    }
  }

  const featuredProducts = bundle?.products?.slice(0, 2) ?? [];

  return (
    <div className={className}>
      {isLoadingTemplates ? (
        <div className="flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2.5 text-[0.76rem] text-[#6f5b52]">
          <PremiumLoader className="h-5 w-5 text-[#8a6c5f]" />
          Menyiapkan template…
        </div>
      ) : null}

      {templates.length > 0 ? (
        <div className="grid gap-1.5">
          <label className="grid gap-1.5">
            <span className="text-[0.6rem] uppercase tracking-[0.18em] text-[#8a6c5f]">Pilih Template</span>
            <select
              value={selectedTemplateId ?? ""}
              onChange={(e) => {
                const template = templates.find((t) => t.id === e.target.value);
                if (template) void selectTemplate(template);
              }}
              className="rounded-xl border border-[rgba(156,131,117,0.1)] bg-white/70 px-3 py-2.5 text-[0.78rem] font-medium text-[#241915] focus:outline-none focus:ring-1 focus:ring-[rgba(92,67,55,0.18)]"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.icon} {template.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {loadError ? (
        <div className="rounded-xl bg-[rgba(156,131,117,0.06)] px-3 py-3 text-center">
          <p className="text-[0.74rem] text-[#8a6c5f]">Template belum tersedia saat ini.</p>
        </div>
      ) : null}

      {!isLoadingTemplates && !loadError && templates.length === 0 ? (
        <div className="rounded-xl bg-[rgba(156,131,117,0.06)] px-3 py-3 text-center">
          <p className="text-[0.74rem] text-[#8a6c5f]">Belum ada template tersedia.</p>
        </div>
      ) : null}

      {bundle ? (
        <div className="mt-3 rounded-xl border border-[rgba(156,131,117,0.08)] bg-white/60 p-3">
          <p className="text-[0.74rem] leading-5 text-[#6f5b52]">
            {bundle.template.description}
          </p>
          {bundle.template.prompt && onPromptSelect ? (
            <button
              type="button"
              onClick={() => onPromptSelect(bundle.template.prompt!)}
              className="mt-2.5 inline-flex h-8 items-center rounded-lg bg-[#241915] px-3.5 text-[0.64rem] font-medium uppercase tracking-[0.14em] text-[#fff7f2] transition hover:bg-[#3a2822]"
            >
              Gunakan Template
            </button>
          ) : null}

          {isLoadingBundle ? (
            <div className="mt-3 flex items-center gap-2 text-[0.74rem] text-[#6f5b52]">
              <PremiumLoader className="h-4 w-4 text-[#8a6c5f]" />
              Menyiapkan preview…
            </div>
          ) : null}

          {featuredProducts.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {featuredProducts.map((product) => (
                <div
                  key={`${product.category}-${product.slug}-${product.name}`}
                  className="flex items-center gap-2.5 rounded-xl border border-[rgba(156,131,117,0.06)] bg-white/80 p-1.5 transition hover:bg-white"
                >
                  <div className="relative h-11 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f3ece6]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.72rem] font-medium text-[#241915]">{product.name}</p>
                    <p className="mt-0.5 text-[0.64rem] text-[#8a6c5f]">
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  {product.slug ? (
                    <Link
                      href={`/${product.category}/${product.slug}`}
                      className="mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(156,131,117,0.08)] text-[#8a6c5f] transition hover:bg-[rgba(156,131,117,0.15)] hover:text-[#3a2822]"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
