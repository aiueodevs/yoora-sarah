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

export type AISupportPolicyArticle = {
  title: string;
  summary: string;
  href: string;
  topics: string[];
};

const internalApiBaseUrl = process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, "");
const internalApiSharedSecret = process.env.YOORA_INTERNAL_API_SHARED_SECRET?.trim();

async function readInternalApi<T>(path: string): Promise<T | null> {
  if (!internalApiBaseUrl) {
    return null;
  }

  const headers = new Headers();
  if (internalApiSharedSecret) {
    headers.set("x-yoora-internal-key", internalApiSharedSecret);
  }

  try {
    const response = await fetch(`${internalApiBaseUrl}${path}`, {
      cache: "no-store",
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
  
  const result = await readInternalApi<Array<{
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
  
  return readInternalApi<AIProductLookupResult>(`/ai-tools/products/details?${params.toString()}`);
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
  
  return readInternalApi<AIVariantAvailabilityResult>(`/ai-tools/variants/availability?${params.toString()}`);
}

export async function getOrderStatus(orderNumber: string): Promise<AIOrderStatusResult | null> {
  const params = new URLSearchParams();
  params.set("order_number", orderNumber);
  
  return readInternalApi<AIOrderStatusResult>(`/ai-tools/orders/status?${params.toString()}`);
}

export async function getSupportPolicies(topic?: string): Promise<AISupportPolicyArticle[]> {
  const params = topic ? `?topic=${encodeURIComponent(topic)}` : "";
  const result = await readInternalApi<AISupportPolicyArticle[]>(`/ai-tools/support/policies${params}`);
  return result ?? [];
}