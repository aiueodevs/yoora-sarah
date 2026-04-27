import { fetchInternalApi } from "./api-client";
import { extractList } from "./response-normalizers";

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
      { actorEmail },
    );
    return { items: extractList<PatternJob>(payload, "items", "jobs") };
  } catch {
    return { items: [] };
  }
}

export async function getPatternJob(jobId: string, actorEmail?: string): Promise<PatternJob> {
  return fetchInternalApi<PatternJob>(`/pattern-jobs/${jobId}`, undefined, { actorEmail });
}

export async function createPatternJob(
  designOptionId: string,
  sizeChartId: string,
  actorEmail?: string,
): Promise<PatternJob> {
  return fetchInternalApi<PatternJob>(
    "/pattern-jobs",
    {
      method: "POST",
      body: JSON.stringify({
        design_option_id: designOptionId,
        size_chart_id: sizeChartId,
      }),
    },
    { actorEmail },
  );
}

export async function getPatternOutputs(
  jobId: string,
  actorEmail?: string,
): Promise<{ items: PatternOutput[] }> {
  try {
    const payload = await fetchInternalApi<unknown>(
      `/pattern-jobs/${jobId}/outputs`,
      undefined,
      { actorEmail },
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
      { actorEmail },
    );
    return { sizeCharts: extractList<SizeChart>(payload, "sizeCharts", "items") };
  } catch {
    return { sizeCharts: [] };
  }
}
