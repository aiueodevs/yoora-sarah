"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  createSupportHandoffPreview,
  getLaunchPolicy,
  getSizeGuidance,
  getStylistRecommendations,
  type AILaunchPolicyResult,
  type AISizeGuidanceResult,
  type AISupportHandoffRecord,
  type AIStylistRecommendation,
} from "@/lib/buyer-ai-api";
import { recordBuyerEventAction } from "@/telemetry/actions";

type ProductAiPanelsProps = {
  categorySlug: string;
  productSlug: string;
  productName: string;
  selectedSize: string;
};

export function ProductAiPanels({
  categorySlug,
  productSlug,
  productName,
  selectedSize,
}: ProductAiPanelsProps) {
  const [recommendations, setRecommendations] = useState<AIStylistRecommendation[]>([]);
  const [sizeGuidance, setSizeGuidance] = useState<AISizeGuidanceResult | null>(null);
  const [launchPolicy, setLaunchPolicy] = useState<AILaunchPolicyResult | null>(null);
  const [handoff, setHandoff] = useState<AISupportHandoffRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHandoffLoading, setIsHandoffLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadAiPanels() {
      setIsLoading(true);
      const [recommendationItems, sizeResult, policyResult] = await Promise.all([
        getStylistRecommendations(categorySlug, productSlug),
        getSizeGuidance(categorySlug, productSlug, selectedSize),
        getLaunchPolicy(categorySlug, productSlug),
      ]);

      if (!isActive) {
        return;
      }

      setRecommendations(recommendationItems);
      setSizeGuidance(sizeResult);
      setLaunchPolicy(policyResult);
      setIsLoading(false);

      await recordBuyerEventAction(
        "buyer_ai_product_panels_loaded",
        {
          productSlug,
          recommendationCount: recommendationItems.length,
          recommendedSize: sizeResult?.recommended_size ?? null,
          handoffRecommended: sizeResult?.handoff_recommended ?? false,
        },
        `/${categorySlug}/${productSlug}`,
      );
    }

    void loadAiPanels();

    return () => {
      isActive = false;
    };
  }, [categorySlug, productSlug, selectedSize]);

  async function handleHandoffRequest(reason: string) {
    setIsHandoffLoading(true);
    const preview = await createSupportHandoffPreview(
      reason,
      `Permintaan bantuan dari PDP ${productName} untuk ukuran ${selectedSize}. Buyer membutuhkan arahan yang lebih aman sebelum checkout.`,
    );
    setHandoff(preview);
    setIsHandoffLoading(false);

    await recordBuyerEventAction(
      "buyer_ai_handoff_requested",
      {
        productSlug,
        reason,
        handoffId: preview?.id ?? null,
      },
      `/${categorySlug}/${productSlug}`,
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="premium-panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="premium-kicker">AI Styling</p>
            <h3 className="premium-title-md mt-3">Rekomendasi edit yang masih satu bahasa visual</h3>
          </div>
          <span className="premium-pill px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em]">
            Discovery support
          </span>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm leading-7 text-[#6f5b52]">Menyiapkan rekomendasi yang paling relevan...</p>
        ) : recommendations.length === 0 ? (
          <p className="mt-4 text-sm leading-7 text-[#6f5b52]">
            Belum ada rekomendasi pendamping yang cukup kuat untuk produk ini.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {recommendations.map((item) => (
              <article key={`${item.category}-${item.slug}`} className="premium-panel-soft rounded-[1.5rem] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#7c665b]">
                  {item.confidence_label} confidence
                </p>
                <h4 className="mt-3 text-base font-semibold text-[#241915]">{item.product_name}</h4>
                <p className="mt-2 text-sm leading-6 text-[#6f5b52]">{item.reason}</p>
                <p className="mt-2 text-sm leading-6 text-[#6f5b52]">{item.styling_note}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[#241915]">
                    Rp {item.price.toLocaleString("id-ID")}
                  </span>
                  <Link
                    href={`/${item.category}/${item.slug}`}
                    className="btn btn-secondary btn-small"
                    onClick={() => {
                      void recordBuyerEventAction(
                        "buyer_ai_recommendation_clicked",
                        {
                          sourceProductSlug: productSlug,
                          targetProductSlug: item.slug,
                        },
                        `/${categorySlug}/${productSlug}`,
                      );
                    }}
                  >
                    Lihat
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="premium-panel rounded-[2rem] p-6">
          <p className="premium-kicker">Size Advisor</p>
          <h3 className="premium-title-md mt-3">Panduan ukuran dengan bahasa yang aman dan jelas</h3>
          {sizeGuidance?.found ? (
            <>
              <p className="mt-4 text-sm leading-7 text-[#6f5b52]">{sizeGuidance.fit_summary}</p>
              <p className="mt-4 text-2xl font-medium text-[#241915]">
                Mulai dari ukuran {sizeGuidance.recommended_size}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#6f5b52]">{sizeGuidance.measurement_note}</p>
              {sizeGuidance.alternative_sizes?.length ? (
                <p className="mt-3 text-sm leading-7 text-[#6f5b52]">
                  Alternatif aman: {sizeGuidance.alternative_sizes.join(", ")}.
                </p>
              ) : null}
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#7c665b]">
                {sizeGuidance.confidence_label} confidence
              </p>
              {sizeGuidance.handoff_recommended ? (
                <div className="mt-4 rounded-[1.25rem] border border-[rgba(141,115,99,0.18)] bg-[rgba(255,252,248,0.72)] p-4">
                  <p className="text-sm leading-7 text-[#6f5b52]">
                    Sistem menyarankan handoff ke tim support karena pilihan ukuran yang diminta tidak tersedia atau butuh validasi tambahan.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleHandoffRequest("size")}
                    disabled={isHandoffLoading}
                    className="btn btn-secondary btn-small mt-4"
                  >
                    {isHandoffLoading ? "Menyiapkan handoff..." : "Minta bantuan ukuran"}
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <p className="mt-4 text-sm leading-7 text-[#6f5b52]">
              Panduan ukuran belum tersedia untuk produk ini.
            </p>
          )}
        </article>

        <article className="premium-panel rounded-[2rem] p-6">
          <p className="premium-kicker">Launch Policy</p>
          <h3 className="premium-title-md mt-3">Policy preorder dan support path</h3>
          <p className="mt-4 text-sm leading-7 text-[#6f5b52]">
            {launchPolicy?.message ??
              "Policy pengiriman dan preorder akan muncul di sini agar buyer tidak perlu menebak langkah berikutnya."}
          </p>
          {launchPolicy?.summary ? (
            <p className="mt-3 text-sm leading-7 text-[#6f5b52]">{launchPolicy.summary}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            {launchPolicy?.href ? (
              <Link href={launchPolicy.href} className="btn btn-secondary btn-small">
                Baca policy
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => void handleHandoffRequest("preorder")}
              disabled={isHandoffLoading}
              className="btn btn-primary btn-small"
            >
              {isHandoffLoading ? "Menyiapkan..." : "Hubungi support"}
            </button>
          </div>
        </article>
      </div>

      {handoff ? (
        <article className="premium-panel rounded-[2rem] p-6">
          <p className="premium-kicker">Human Handoff</p>
          <h3 className="premium-title-md mt-3">Support path sudah disiapkan</h3>
          <p className="mt-4 text-sm leading-7 text-[#6f5b52]">{handoff.summary}</p>
          <p className="mt-3 text-sm leading-7 text-[#6f5b52]">{handoff.nextAction}</p>
          <a
            href={handoff.contact.whatsappHref}
            className="btn btn-primary mt-5 inline-flex"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lanjut ke WhatsApp
          </a>
        </article>
      ) : null}
    </div>
  );
}
