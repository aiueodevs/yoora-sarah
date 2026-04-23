import "server-only";

export type BriefSummary = {
  id: string;
  title: string;
  status: string;
  created_by: string;
  created_at: string;
  summary: string;
};

export type ApprovalSummary = {
  id: string;
  artifact_type: string;
  artifact_id: string;
  status: string;
  updated_at: string;
  summary: string;
};

export type ForecastSummary = {
  id: number;
  run_id: string;
  status: string;
  period: string;
  created_at: string;
  summary: string;
};

export type ProductionPlanSummary = {
  id: number;
  plan_number: string;
  status: string;
  forecast_run_id: string | null;
  created_at: string;
  summary: string;
};

export type KnowledgeArticle = {
  id: string;
  title: string;
  topic: string;
  audience: string;
  summary: string;
  detail: string;
  source_label: string;
  updated_at: string;
  next_action: string;
};

export type BriefCopilotNote = {
  brief_id: string;
  title: string;
  summary: string;
  concept_direction: string;
  review_risk: string;
  next_action: string;
  source_timestamp: string;
};

export type ContentDraft = {
  id: string;
  title: string;
  audience: string;
  hook: string;
  caption: string;
  call_to_action: string;
  source_context: string;
};

export type LeadershipInsight = {
  id: string;
  title: string;
  summary: string;
  risks: string[];
  next_actions: string[];
  generated_at: string;
};

export type WorkflowStatusSummary = {
  briefs_count: number;
  briefs_by_status: Record<string, number>;
  approvals_count: number;
  approvals_by_status: Record<string, number>;
  forecasts_count: number;
  forecasts_by_status: Record<string, number>;
  plans_count: number;
  plans_by_status: Record<string, number>;
};

const internalApiBaseUrl = process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, "");
const internalApiSharedSecret = process.env.YOORA_INTERNAL_API_SHARED_SECRET?.trim();

async function readInternalApi<T>(path: string, actorEmail?: string): Promise<T | null> {
  if (!internalApiBaseUrl) {
    return null;
  }

  const headers = new Headers();
  if (internalApiSharedSecret) {
    headers.set("x-yoora-internal-key", internalApiSharedSecret);
  }
  if (actorEmail) {
    headers.set("x-yoora-actor-email", actorEmail);
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

export async function getBriefSummaries(actorEmail?: string): Promise<BriefSummary[]> {
  const result = await readInternalApi<BriefSummary[]>("/internal-ai/briefs/summaries", actorEmail);
  return result ?? [];
}

export async function getApprovalSummaries(actorEmail?: string): Promise<ApprovalSummary[]> {
  const result = await readInternalApi<ApprovalSummary[]>("/internal-ai/approvals/summaries", actorEmail);
  return result ?? [];
}

export async function getForecastSummaries(actorEmail?: string): Promise<ForecastSummary[]> {
  const result = await readInternalApi<ForecastSummary[]>("/internal-ai/forecast/summaries", actorEmail);
  return result ?? [];
}

export async function getProductionPlanSummaries(actorEmail?: string): Promise<ProductionPlanSummary[]> {
  const result = await readInternalApi<ProductionPlanSummary[]>("/internal-ai/production-plans/summaries", actorEmail);
  return result ?? [];
}

export async function getWorkflowStatusSummary(actorEmail?: string): Promise<WorkflowStatusSummary | null> {
  return readInternalApi<WorkflowStatusSummary>("/internal-ai/workflow-status", actorEmail);
}

export async function getBriefCopilotNote(
  briefId?: string,
  actorEmail?: string,
): Promise<BriefCopilotNote | null> {
  const params = briefId ? `?briefId=${encodeURIComponent(briefId)}` : "";
  return readInternalApi<BriefCopilotNote>(`/internal-ai/briefs/copilot${params}`, actorEmail);
}

export async function getKnowledgeArticles(
  actorEmail?: string,
  query?: string,
  topic?: string,
): Promise<KnowledgeArticle[]> {
  const params = new URLSearchParams();
  if (query) {
    params.set("query", query);
  }
  if (topic) {
    params.set("topic", topic);
  }
  const suffix = params.size ? `?${params.toString()}` : "";
  const result = await readInternalApi<KnowledgeArticle[]>(`/internal-ai/knowledge/articles${suffix}`, actorEmail);
  return result ?? [];
}

export async function getOnboardingGuidance(
  actorEmail?: string,
  role?: string,
): Promise<KnowledgeArticle[]> {
  const suffix = role ? `?role=${encodeURIComponent(role)}` : "";
  const result = await readInternalApi<KnowledgeArticle[]>(`/internal-ai/knowledge/onboarding${suffix}`, actorEmail);
  return result ?? [];
}

export async function getContentDraft(
  actorEmail?: string,
  briefId?: string,
): Promise<ContentDraft | null> {
  const suffix = briefId ? `?briefId=${encodeURIComponent(briefId)}` : "";
  return readInternalApi<ContentDraft>(`/internal-ai/content/draft${suffix}`, actorEmail);
}

export async function getPerformanceInsight(actorEmail?: string): Promise<LeadershipInsight | null> {
  return readInternalApi<LeadershipInsight>("/internal-ai/insights/performance", actorEmail);
}

export async function getLaunchReadinessInsight(actorEmail?: string): Promise<LeadershipInsight | null> {
  return readInternalApi<LeadershipInsight>("/internal-ai/insights/launch-readiness", actorEmail);
}

export async function getMerchandisingInsight(actorEmail?: string): Promise<LeadershipInsight | null> {
  return readInternalApi<LeadershipInsight>("/internal-ai/insights/merchandising", actorEmail);
}
