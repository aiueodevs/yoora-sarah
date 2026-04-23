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

export type ForecastRun = {
  forecast_run_id: number;
  collection_id: number;
  requested_by_user_id: number;
  requested_by_email?: string;
  status: "queued" | "running" | "completed" | "failed";
  model_version?: string;
  confidence_score?: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ForecastRecommendation = {
  forecast_recommendation_id: number;
  forecast_run_id: number;
  recommendation_summary?: string;
  projected_total_units?: number;
  rationale?: string;
  created_at: string;
};

export type ForecastSizeMix = {
  forecast_size_mix_id: number;
  forecast_recommendation_id: number;
  size_code: string;
  recommended_units: number;
  created_at: string;
};

export type ForecastColorMix = {
  forecast_color_mix_id: number;
  forecast_recommendation_id: number;
  color_code: string;
  recommended_units: number;
  created_at: string;
};

export type AllocationRecommendation = {
  allocation_recommendation_id: number;
  forecast_recommendation_id: number;
  channel_code: string;
  recommended_units: number;
  created_at: string;
};

export type ProductionPlan = {
  production_plan_id: number;
  forecast_run_id: number;
  created_by_user_id: number;
  requested_by_email?: string;
  status: "draft" | "review" | "approved" | "rejected" | "released";
  planner_notes?: string;
  created_at: string;
  updated_at: string;
};

export type ProductionPlanLine = {
  production_plan_line_id: number;
  production_plan_id: number;
  style_id?: number;
  size_code: string;
  color_code: string;
  planned_units: number;
  channel_code?: string;
  created_at: string;
};

export async function getForecastRuns(collectionId?: number, actorEmail?: string): Promise<{ items: ForecastRun[] }> {
  try {
    const params = collectionId ? `?collection_id=${collectionId}` : "";
    const payload = await fetchInternalApi<unknown>(`/forecast/runs${params}`, undefined, actorEmail);
    return { items: extractList<ForecastRun>(payload, "items", "runs") };
  } catch {
    return { items: [] };
  }
}

export async function getForecastRun(runId: number, actorEmail?: string): Promise<ForecastRun> {
  return fetchInternalApi<ForecastRun>(`/forecast/runs/${runId}`, undefined, actorEmail);
}

export async function createForecastRun(collectionId: number, actorEmail?: string): Promise<ForecastRun> {
  return fetchInternalApi<ForecastRun>("/forecast/runs", {
    method: "POST",
    body: JSON.stringify({ collection_id: collectionId }),
  }, actorEmail);
}

export async function getForecastRecommendation(runId: number, actorEmail?: string): Promise<ForecastRecommendation> {
  return fetchInternalApi<ForecastRecommendation>(`/forecast/runs/${runId}/recommendations`, undefined, actorEmail);
}

export async function getSizeMix(recommendationId: number, actorEmail?: string): Promise<{ items: ForecastSizeMix[] }> {
  try {
    const payload = await fetchInternalApi<unknown>(
      `/forecast/recommendations/${recommendationId}/size-mix`,
      undefined,
      actorEmail,
    );
    return { items: extractList<ForecastSizeMix>(payload, "items", "size_mix") };
  } catch {
    return { items: [] };
  }
}

export async function getColorMix(recommendationId: number, actorEmail?: string): Promise<{ items: ForecastColorMix[] }> {
  try {
    const payload = await fetchInternalApi<unknown>(
      `/forecast/recommendations/${recommendationId}/color-mix`,
      undefined,
      actorEmail,
    );
    return { items: extractList<ForecastColorMix>(payload, "items", "color_mix") };
  } catch {
    return { items: [] };
  }
}

export async function getAllocations(recommendationId: number, actorEmail?: string): Promise<{ items: AllocationRecommendation[] }> {
  try {
    const payload = await fetchInternalApi<unknown>(
      `/forecast/recommendations/${recommendationId}/allocations`,
      undefined,
      actorEmail,
    );
    return { items: extractList<AllocationRecommendation>(payload, "items", "allocations") };
  } catch {
    return { items: [] };
  }
}

export async function getProductionPlans(runId?: number, actorEmail?: string): Promise<{ items: ProductionPlan[] }> {
  try {
    const params = runId ? `?forecast_run_id=${runId}` : "";
    const payload = await fetchInternalApi<unknown>(`/forecast/plans${params}`, undefined, actorEmail);
    return { items: extractList<ProductionPlan>(payload, "items", "plans") };
  } catch {
    return { items: [] };
  }
}

export async function getProductionPlan(planId: number, actorEmail?: string): Promise<ProductionPlan> {
  return fetchInternalApi<ProductionPlan>(`/forecast/plans/${planId}`, undefined, actorEmail);
}

export async function createProductionPlan(
  forecastRunId: number,
  plannerNotes?: string,
  actorEmail?: string,
): Promise<ProductionPlan> {
  return fetchInternalApi<ProductionPlan>("/forecast/plans", {
    method: "POST",
    body: JSON.stringify({ forecast_run_id: forecastRunId, planner_notes: plannerNotes }),
  }, actorEmail);
}

export async function updateProductionPlan(
  planId: number,
  status: string,
  plannerNotes?: string,
  actorEmail?: string,
): Promise<ProductionPlan> {
  return fetchInternalApi<ProductionPlan>(`/forecast/plans/${planId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, planner_notes: plannerNotes }),
  }, actorEmail);
}

export async function getProductionPlanLines(planId: number, actorEmail?: string): Promise<{ items: ProductionPlanLine[] }> {
  try {
    const payload = await fetchInternalApi<unknown>(
      `/forecast/plans/${planId}/lines`,
      undefined,
      actorEmail,
    );
    return { items: extractList<ProductionPlanLine>(payload, "items", "lines") };
  } catch {
    return { items: [] };
  }
}

export async function addProductionPlanLine(
  planId: number,
  styleId: number | null,
  sizeCode: string,
  colorCode: string,
  plannedUnits: number,
  channelCode?: string,
  actorEmail?: string,
): Promise<ProductionPlanLine> {
  return fetchInternalApi<ProductionPlanLine>(`/forecast/plans/${planId}/lines`, {
    method: "POST",
    body: JSON.stringify({
      production_plan_id: planId,
      style_id: styleId,
      size_code: sizeCode,
      color_code: colorCode,
      planned_units: plannedUnits,
      channel_code: channelCode,
    }),
  }, actorEmail);
}
