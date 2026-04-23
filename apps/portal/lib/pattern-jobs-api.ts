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

export type PatternJob = {
  id: string;
  designOptionId: string;
  designOptionTitle?: string;
  sizeChartId: string;
  sizeChartName?: string;
  requestedByUserId: string;
  requestedByEmail?: string;
  status: "queued" | "running" | "completed" | "failed" | "review";
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type PatternOutput = {
  id: string;
  patternJobId: string;
  outputType: "pdf" | "dxf" | "report";
  fileUrl: string;
  fabricEstimateM?: number;
  gradingNotes?: string;
  createdAt: string;
};

export type SizeChart = {
  id: string;
  brandId: string;
  code: string;
  name: string;
  genderScope?: string;
  entries: Array<{
    sizeCode: string;
    bustCm?: number;
    waistCm?: number;
    hipCm?: number;
    lengthCm?: number;
  }>;
};

export async function getPatternJobs(
  designOptionId?: string,
  actorEmail?: string,
): Promise<{ items: PatternJob[] }> {
  try {
    const params = designOptionId ? `?design_option_id=${designOptionId}` : "";
    const payload = await fetchInternalApi<unknown>(
      `/pattern-jobs${params}`,
      undefined,
      actorEmail,
    );
    return { items: extractList<PatternJob>(payload, "items", "jobs") };
  } catch {
    return { items: [] };
  }
}

export async function getPatternJob(jobId: string, actorEmail?: string): Promise<PatternJob> {
  return fetchInternalApi<PatternJob>(`/pattern-jobs/${jobId}`, undefined, actorEmail);
}

export async function createPatternJob(
  designOptionId: string,
  sizeChartId: string,
  actorEmail?: string,
): Promise<PatternJob> {
  return fetchInternalApi<PatternJob>("/pattern-jobs", {
    method: "POST",
    body: JSON.stringify({
      design_option_id: designOptionId,
      size_chart_id: sizeChartId,
    }),
  }, actorEmail);
}

export async function getPatternOutputs(
  jobId: string,
  actorEmail?: string,
): Promise<{ items: PatternOutput[] }> {
  try {
    const payload = await fetchInternalApi<unknown>(
      `/pattern-jobs/${jobId}/outputs`,
      undefined,
      actorEmail,
    );
    return { items: extractList<PatternOutput>(payload, "items", "outputs") };
  } catch {
    return { items: [] };
  }
}

export async function getSizeCharts(actorEmail?: string): Promise<{ sizeCharts: SizeChart[] }> {
  try {
    const payload = await fetchInternalApi<unknown>(
      "/master-data/size-charts",
      undefined,
      actorEmail,
    );
    return { sizeCharts: extractList<SizeChart>(payload, "sizeCharts", "items") };
  } catch {
    return { sizeCharts: [] };
  }
}
