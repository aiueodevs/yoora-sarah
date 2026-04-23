"use server";

import { revalidatePath } from "next/cache";

import { requirePortalSession } from "../../lib/portal-auth";
import { createForecastRun } from "../../lib/forecast-api";
import { recordPortalTelemetryEvent } from "../../lib/portal-telemetry";

export async function createForecastRunAction(collectionId: number) {
  const session = await requirePortalSession({
    roles: ["owner", "planner", "admin_data_tech"],
  });

  try {
    const result = await createForecastRun(collectionId, session?.email ?? undefined);
    await recordPortalTelemetryEvent({
      actorEmail: session?.email ?? undefined,
      eventName: "portal_forecast_run_created",
      outcome: "success",
      route: "/forecast",
      referenceType: "forecast_run",
      referenceId: String(result.forecast_run_id),
      details: { collectionId },
    });
    revalidatePath("/forecast");
    return result;
  } catch (error) {
    await recordPortalTelemetryEvent({
      actorEmail: session?.email ?? undefined,
      eventName: "portal_forecast_run_created",
      outcome: "failure",
      route: "/forecast",
      details: {
        collectionId,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}
