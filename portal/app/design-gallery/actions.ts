"use server";

import { revalidatePath } from "next/cache";

import { updateOptionStatus } from "../../lib/design-jobs-api";
import { requirePortalSession } from "../../lib/portal-auth";
import { recordPortalTelemetryEvent } from "../../lib/portal-telemetry";

export async function updateDesignOptionStatusAction(optionId: string, nextStatus: string) {
  const session = await requirePortalSession({
    roles: ["owner", "design_lead", "pattern_lead", "admin_data_tech"],
  });

  try {
    await updateOptionStatus(
      optionId,
      nextStatus,
      session?.email ?? undefined,
    );

    await recordPortalTelemetryEvent({
      actorEmail: session?.email ?? undefined,
      eventName: "portal_design_option_status_updated",
      outcome: "success",
      route: "/design-gallery",
      referenceType: "design_option",
      referenceId: optionId,
      details: { nextStatus },
    });

    revalidatePath("/design-gallery");
    revalidatePath("/patterns");
  } catch (error) {
    await recordPortalTelemetryEvent({
      actorEmail: session?.email ?? undefined,
      eventName: "portal_design_option_status_updated",
      outcome: "failure",
      route: "/design-gallery",
      referenceType: "design_option",
      referenceId: optionId,
      details: {
        nextStatus,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}
