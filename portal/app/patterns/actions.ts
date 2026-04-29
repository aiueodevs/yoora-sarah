"use server";

import { revalidatePath } from "next/cache";

import { createPatternJob } from "../../lib/pattern-jobs-api";
import { requirePortalSession } from "../../lib/portal-auth";
import { recordPortalTelemetryEvent } from "../../lib/portal-telemetry";

export async function createPatternJobAction(designOptionId: string, sizeChartId: string) {
  const session = await requirePortalSession({
    roles: ["owner", "design_lead", "pattern_lead", "admin_data_tech"],
  });

  try {
    const result = await createPatternJob(designOptionId, sizeChartId, session?.email ?? undefined);
    await recordPortalTelemetryEvent({
      actorEmail: session?.email ?? undefined,
      eventName: "portal_pattern_job_created",
      outcome: "success",
      route: "/patterns",
      referenceType: "pattern_job",
      referenceId: result.id,
      details: { designOptionId, sizeChartId },
    });
    revalidatePath("/patterns");
    return result;
  } catch (error) {
    await recordPortalTelemetryEvent({
      actorEmail: session?.email ?? undefined,
      eventName: "portal_pattern_job_created",
      outcome: "failure",
      route: "/patterns",
      referenceType: "design_option",
      referenceId: designOptionId,
      details: {
        sizeChartId,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}
