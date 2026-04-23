const internalApiBaseUrl = process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, "");
const internalApiSharedSecret = process.env.YOORA_INTERNAL_API_SHARED_SECRET?.trim();

export async function fetchInternalApi<T>(path: string, options?: RequestInit): Promise<T> {
  if (!internalApiBaseUrl) {
    throw new Error("Internal API not configured");
  }

  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");

  if (internalApiSharedSecret) {
    headers.set("x-yoora-internal-key", internalApiSharedSecret);
  }

  const response = await fetch(`${internalApiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

export type Brief = {
  id: string;
  brandId: string;
  brandName?: string;
  title: string;
  category: string;
  targetSegment: string;
  campaignName?: string;
  status: "draft" | "active" | "completed";
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Brand = {
  id: string;
  code: string;
  name: string;
  brandType: string;
};

export async function createBrief(data: Record<string, FormDataEntryValue>): Promise<Brief> {
  return fetchInternalApi<Brief>("/briefs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getBrands(): Promise<{ brands: Brand[] }> {
  try {
    return await fetchInternalApi<{ brands: Brand[] }>("/master-data/brands");
  } catch {
    return { brands: [] };
  }
}