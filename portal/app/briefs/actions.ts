"use server";

import { revalidatePath } from "next/cache";

import { createBrief } from "../../lib/briefs-api";
import { requirePortalSession } from "../../lib/portal-auth";
import { recordPortalTelemetryEvent } from "../../lib/portal-telemetry";

export async function createBriefAction(formData: FormData) {
  const session = await requirePortalSession({
    roles: ["owner", "design_lead", "pattern_lead", "admin_data_tech"],
  });

  const brandId = String(formData.get("brandId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const targetSegment = String(formData.get("targetSegment") ?? "").trim();
  const campaignName = String(formData.get("campaignName") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!brandId || !title || !category || !targetSegment) {
    throw new Error("Brand, title, category, and target segment are required.");
  }

  try {
    const brief = await createBrief(
      {
        brandId,
        title,
        category,
        targetSegment,
        campaignName: campaignName || undefined,
        notes: notes || undefined,
      },
      session?.email ?? undefined,
    );

    await recordPortalTelemetryEvent({
      actorEmail: session?.email ?? undefined,
      eventName: "portal_brief_created",
      outcome: "success",
      route: "/briefs",
      referenceType: "brief",
      referenceId: brief?.id,
      details: { brandId, category, targetSegment },
    });

    revalidatePath("/briefs");
    revalidatePath("/dashboard");
    revalidatePath("/design-gallery");
    return brief;
  } catch (error) {
    await recordPortalTelemetryEvent({
      actorEmail: session?.email ?? undefined,
      eventName: "portal_brief_created",
      outcome: "failure",
      route: "/briefs",
      details: {
        brandId,
        category,
        targetSegment,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}
