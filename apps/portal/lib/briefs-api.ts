import { extractList } from "./response-normalizers";

const internalApiBaseUrl = process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, "");
const internalApiSharedSecret = process.env.YOORA_INTERNAL_API_SHARED_SECRET?.trim();

async function fetchInternalApi<T>(path: string, options?: RequestInit, actorEmail?: string): Promise<T> {
  if (!internalApiBaseUrl) {
    throw new Error("Internal API not configured");
  }

  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");

  if (internalApiSharedSecret) {
    headers.set("x-yoora-internal-key", internalApiSharedSecret);
  }
  if (actorEmail) {
    headers.set("x-yoora-actor-email", actorEmail);
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
  createdByUserId: string;
  createdByEmail?: string;
  title: string;
  category: string;
  targetSegment: string;
  campaignName?: string;
  notes?: string;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type BriefCreate = {
  brandId: string;
  title: string;
  category: string;
  targetSegment: string;
  campaignName?: string;
  notes?: string;
};

export type Brand = {
  id: string;
  code: string;
  name: string;
  brandType: string;
  parentBrandId: string | null;
  isActive: boolean;
};

export async function getBriefs(actorEmail?: string): Promise<{ briefs: Brief[] }> {
  try {
    const payload = await fetchInternalApi<unknown>("/briefs", undefined, actorEmail);
    return { briefs: extractList<Brief>(payload, "briefs", "items") };
  } catch {
    return { briefs: [] };
  }
}

export async function getBrief(briefId: string, actorEmail?: string): Promise<Brief> {
  return fetchInternalApi<Brief>(`/briefs/${briefId}`, undefined, actorEmail);
}

export async function createBrief(data: BriefCreate, actorEmail?: string): Promise<Brief> {
  const snakeData = {
    brand_id: data.brandId.replace('brand_', ''),
    title: data.title,
    category: data.category,
    target_segment: data.targetSegment,
    campaign_name: data.campaignName,
    notes: data.notes,
  };
  return fetchInternalApi<Brief>("/briefs", {
    method: "POST",
    body: JSON.stringify(snakeData),
  }, actorEmail);
}

export async function updateBrief(
  briefId: string,
  data: Partial<BriefCreate>,
  actorEmail?: string,
): Promise<Brief> {
  return fetchInternalApi<Brief>(`/briefs/${briefId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }, actorEmail);
}

export async function getBrands(actorEmail?: string): Promise<{ brands: Brand[] }> {
  try {
    const payload = await fetchInternalApi<unknown>("/master-data/brands", undefined, actorEmail);
    return { brands: extractList<Brand>(payload, "brands", "items") };
  } catch {
    return { brands: [] };
  }
}
