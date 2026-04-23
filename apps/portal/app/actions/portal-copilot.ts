"use server";

import {
  getApprovalSummaries,
  getBriefCopilotNote,
  getBriefSummaries,
  getContentDraft,
  getForecastSummaries,
  getKnowledgeArticles,
  getLaunchReadinessInsight,
  getMerchandisingInsight,
  getOnboardingGuidance,
  getPerformanceInsight,
  getProductionPlanSummaries,
  getWorkflowStatusSummary,
} from "@/lib/internal-ai-api";
import { requirePortalSession } from "@/lib/portal-auth";
import { recordPortalTelemetryEvent } from "@/lib/portal-telemetry";

const copilotRoles = [
  "owner",
  "design_lead",
  "pattern_lead",
  "planner",
  "ops_qa",
  "admin_data_tech",
];

async function requireCopilotSession() {
  return requirePortalSession({ roles: copilotRoles });
}

export async function recordPortalCopilotEventAction(
  eventName: string,
  details?: Record<string, unknown>,
) {
  const session = await requireCopilotSession();
  await recordPortalTelemetryEvent({
    actorEmail: session?.email ?? undefined,
    eventName,
    route: "/portal-copilot",
    details,
  });
}

export async function getPortalCopilotWorkflowStatusAction() {
  const session = await requireCopilotSession();
  return getWorkflowStatusSummary(session?.email ?? undefined);
}

export async function getPortalCopilotBriefSummariesAction() {
  const session = await requireCopilotSession();
  return getBriefSummaries(session?.email ?? undefined);
}

export async function getPortalCopilotApprovalSummariesAction() {
  const session = await requireCopilotSession();
  return getApprovalSummaries(session?.email ?? undefined);
}

export async function getPortalCopilotForecastSummariesAction() {
  const session = await requireCopilotSession();
  return getForecastSummaries(session?.email ?? undefined);
}

export async function getPortalCopilotProductionPlanSummariesAction() {
  const session = await requireCopilotSession();
  return getProductionPlanSummaries(session?.email ?? undefined);
}

export async function getPortalCopilotBriefCopilotAction(briefId?: string) {
  const session = await requireCopilotSession();
  return getBriefCopilotNote(briefId, session?.email ?? undefined);
}

export async function getPortalCopilotKnowledgeAction(query?: string, topic?: string) {
  const session = await requireCopilotSession();
  return getKnowledgeArticles(session?.email ?? undefined, query, topic);
}

export async function getPortalCopilotOnboardingAction(role?: string) {
  const session = await requireCopilotSession();
  return getOnboardingGuidance(session?.email ?? undefined, role);
}

export async function getPortalCopilotContentDraftAction(briefId?: string) {
  const session = await requireCopilotSession();
  return getContentDraft(session?.email ?? undefined, briefId);
}

export async function getPortalCopilotPerformanceInsightAction() {
  const session = await requireCopilotSession();
  return getPerformanceInsight(session?.email ?? undefined);
}

export async function getPortalCopilotLaunchReadinessInsightAction() {
  const session = await requireCopilotSession();
  return getLaunchReadinessInsight(session?.email ?? undefined);
}

export async function getPortalCopilotMerchandisingInsightAction() {
  const session = await requireCopilotSession();
  return getMerchandisingInsight(session?.email ?? undefined);
}
