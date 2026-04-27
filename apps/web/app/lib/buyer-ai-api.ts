"use client";

export type AIProductLookupResult = {
  found: boolean;
  product_name?: string | null;
  category?: string | null;
  price?: number | null;
  in_stock?: boolean | null;
  stock_summary?: string | null;
  variants?: Array<{
    color: string;
    color_hex: string;
    size: string;
  }> | null;
  message?: string | null;
};

export type AIVariantAvailabilityResult = {
  found: boolean;
  variant_name?: string | null;
  available?: boolean | null;
  quantity?: number | null;
  message?: string | null;
};

export type AIOrderStatusResult = {
  found: boolean;
  order_number?: string | null;
  status?: string | null;
  status_label?: string | null;
  total?: number | null;
  item_count?: number | null;
  placed_at?: string | null;
  message?: string | null;
};

export type AIStylistRecommendation = {
  product_name: string;
  category: string;
  slug: string;
  price: number;
  image: string;
  badge?: string | null;
  stock_summary?: string | null;
  confidence_label?: string | null;
  reason?: string | null;
  styling_note?: string | null;
  occasion?: string | null;
};

export type AISizeGuidanceResult = {
  found: boolean;
  product_name?: string | null;
  recommended_size?: string | null;
  confidence_label?: string | null;
  confidence_score?: number | null;
  fit_summary?: string | null;
  measurement_note?: string | null;
  alternative_sizes?: string[] | null;
  handoff_recommended?: boolean | null;
  handoff_reason?: string | null;
  message?: string | null;
};

export type AILaunchPolicyResult = {
  found: boolean;
  product_name?: string | null;
  stock_state?: string | null;
  title?: string | null;
  summary?: string | null;
  href?: string | null;
  message?: string | null;
};

export type AISupportPolicyArticle = {
  title: string;
  summary: string;
  href: string;
  topics: string[];
};

export type AISupportHandoffRecord = {
  id: string;
  status: "draft" | "ready";
  nextAction: string;
  summary: string;
  contact: {
    whatsappNumber: string;
    whatsappHref: string;
    defaultMessage: string;
    confirmationMessage: string;
    businessHours: string;
    responseWindow: string;
  };
  policyArticles: Array<{
    id: string;
    title: string;
    summary: string;
    href: string;
    topics: string[];
  }>;
};

export type AIAssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIAssistantSource = {
  title: string;
  href: string;
};

export type AIAssistantAction = {
  key: string;
  label: string;
  href?: string | null;
  kind: 'link' | 'whatsapp';
};

export type AIAssistantResponse = {
  content: string;
  sources?: AIAssistantSource[] | null;
  actions?: AIAssistantAction[] | null;
  mode?: "groq" | "fallback";
};

const storefrontApiBaseUrl = process.env.NEXT_PUBLIC_YOORA_STOREFRONT_API_URL?.replace(/\/$/, "");

function resolveStorefrontApiUrl(path: string) {
  if (storefrontApiBaseUrl) {
    return `${storefrontApiBaseUrl}${path}`;
  }
  return `/api/buyer-ai${path}`;
}

async function requestStorefrontApi<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const headers = new Headers(init?.headers);
    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(resolveStorefrontApiUrl(path), {
      cache: "no-store",
      ...init,
      headers,
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function searchProducts(
  query?: string,
  category?: string,
  limit: number = 5
): Promise<Array<{
  name: string;
  slug: string;
  category: string;
  price: number;
  image: string;
  badge: string | null;
}>> {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (category) params.set("category", category);
  params.set("limit", String(limit));

  const result = await requestStorefrontApi<Array<{
    name: string;
    slug: string;
    category: string;
    price: number;
    image: string;
    badge: string | null;
  }>>(`/ai-tools/products/search?${params.toString()}`);

  return result ?? [];
}

export async function getProductDetails(
  categorySlug: string,
  productSlug: string
): Promise<AIProductLookupResult | null> {
  const params = new URLSearchParams();
  params.set("category_slug", categorySlug);
  params.set("product_slug", productSlug);

  return requestStorefrontApi<AIProductLookupResult>(`/ai-tools/products/details?${params.toString()}`);
}

export async function getVariantAvailability(
  categorySlug: string,
  productSlug: string,
  color: string,
  size: string
): Promise<AIVariantAvailabilityResult | null> {
  const params = new URLSearchParams();
  params.set("category_slug", categorySlug);
  params.set("product_slug", productSlug);
  params.set("color", color);
  params.set("size", size);

  return requestStorefrontApi<AIVariantAvailabilityResult>(`/ai-tools/variants/availability?${params.toString()}`);
}

export async function getOrderStatus(orderNumber: string): Promise<AIOrderStatusResult | null> {
  const params = new URLSearchParams();
  params.set("order_number", orderNumber);

  return requestStorefrontApi<AIOrderStatusResult>(`/ai-tools/orders/status?${params.toString()}`);
}

export async function getSupportPolicies(topic?: string): Promise<AISupportPolicyArticle[]> {
  const params = topic ? `?topic=${encodeURIComponent(topic)}` : "";
  const result = await requestStorefrontApi<AISupportPolicyArticle[]>(`/ai-tools/support/policies${params}`);
  return result ?? [];
}

export async function getStylistRecommendations(
  categorySlug: string,
  productSlug: string,
  occasion?: string,
  limit: number = 3,
): Promise<AIStylistRecommendation[]> {
  const params = new URLSearchParams();
  params.set("category_slug", categorySlug);
  params.set("product_slug", productSlug);
  params.set("limit", String(limit));
  if (occasion) {
    params.set("occasion", occasion);
  }

  const result = await requestStorefrontApi<AIStylistRecommendation[]>(
    `/ai-tools/products/recommendations?${params.toString()}`,
  );
  return result ?? [];
}

export async function getSizeGuidance(
  categorySlug: string,
  productSlug: string,
  selectedSize?: string,
): Promise<AISizeGuidanceResult | null> {
  const params = new URLSearchParams();
  params.set("category_slug", categorySlug);
  params.set("product_slug", productSlug);
  if (selectedSize) {
    params.set("selected_size", selectedSize);
  }

  return requestStorefrontApi<AISizeGuidanceResult>(`/ai-tools/products/size-guidance?${params.toString()}`);
}

export async function getLaunchPolicy(
  categorySlug: string,
  productSlug: string,
): Promise<AILaunchPolicyResult | null> {
  const params = new URLSearchParams();
  params.set("category_slug", categorySlug);
  params.set("product_slug", productSlug);
  return requestStorefrontApi<AILaunchPolicyResult>(`/ai-tools/products/launch-policy?${params.toString()}`);
}

export async function createSupportHandoffPreview(
  reason: string,
  contextSummary: string,
  orderId?: string,
): Promise<AISupportHandoffRecord | null> {
  const params = new URLSearchParams();
  params.set("reason", reason);
  params.set("context_summary", contextSummary);
  if (orderId) {
    params.set("order_id", orderId);
  }

  return requestStorefrontApi<AISupportHandoffRecord>(
    `/ai-tools/support/handoffs/preview?${params.toString()}`,
    {
      method: "POST",
    },
  );
}

export async function getAssistantResponse(
  query: string,
  messages: AIAssistantMessage[],
): Promise<AIAssistantResponse | null> {
  return requestStorefrontApi<AIAssistantResponse>("/ai-tools/assistant/respond", {
    method: "POST",
    body: JSON.stringify({
      query,
      messages,
    }),
  });
}
