"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createProductionPlan } from "../../../lib/forecast-api";
import { requirePortalSession } from "../../../lib/portal-auth";
import { recordPortalTelemetryEvent } from "../../../lib/portal-telemetry";

export async function createProductionPlanForRunAction(forecastRunId: number) {
  const session = await requirePortalSession({
    roles: ["owner", "planner", "admin_data_tech"],
  });

  try {
    const plan = await createProductionPlan(
      forecastRunId,
      undefined,
      session?.email ?? undefined,
    );

    await recordPortalTelemetryEvent({
      actorEmail: session?.email ?? undefined,
      eventName: "portal_production_plan_created_from_forecast",
      outcome: "success",
      route: `/forecast/${forecastRunId}`,
      referenceType: "production_plan",
      referenceId: String(plan.production_plan_id),
      details: { forecastRunId },
    });

    revalidatePath("/forecast");
    revalidatePath("/production-plans");
    redirect(`/production-plans/${plan.production_plan_id}`);
  } catch (error) {
    await recordPortalTelemetryEvent({
      actorEmail: session?.email ?? undefined,
      eventName: "portal_production_plan_created_from_forecast",
      outcome: "failure",
      route: `/forecast/${forecastRunId}`,
      referenceType: "forecast_run",
      referenceId: String(forecastRunId),
      details: {
        message: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}
