"use server";

import { revalidatePath } from "next/cache";

import {
  addProductionPlanLine,
  getProductionPlan,
  getProductionPlanLines,
  updateProductionPlan,
} from "../../../lib/forecast-api";
import { requirePortalSession } from "../../../lib/portal-auth";
import { recordPortalTelemetryEvent } from "../../../lib/portal-telemetry";

type ProductionPlanSnapshot = {
  plan: Awaited<ReturnType<typeof getProductionPlan>>;
  lines: Awaited<ReturnType<typeof getProductionPlanLines>>["items"];
};

async function readPlanSnapshot(
  planId: number,
  actorEmail?: string,
): Promise<ProductionPlanSnapshot> {
  const [plan, lines] = await Promise.all([
    getProductionPlan(planId, actorEmail),
    getProductionPlanLines(planId, actorEmail),
  ]);

  return {
    plan,
    lines: lines.items,
  };
}

export async function addProductionPlanLineAction(input: {
  planId: number;
  styleId: number | null;
  sizeCode: string;
  colorCode: string;
  plannedUnits: number;
  channelCode?: string;
}) {
  const session = await requirePortalSession({
    roles: ["owner", "planner", "ops_qa", "admin_data_tech"],
  });
  const actorEmail = session?.email ?? undefined;

  try {
    await addProductionPlanLine(
      input.planId,
      input.styleId,
      input.sizeCode,
      input.colorCode,
      input.plannedUnits,
      input.channelCode,
      actorEmail,
    );

    await recordPortalTelemetryEvent({
      actorEmail,
      eventName: "portal_production_plan_line_added",
      outcome: "success",
      route: `/production-plans/${input.planId}`,
      referenceType: "production_plan",
      referenceId: String(input.planId),
      details: {
        styleId: input.styleId,
        sizeCode: input.sizeCode,
        colorCode: input.colorCode,
        plannedUnits: input.plannedUnits,
        channelCode: input.channelCode,
      },
    });

    revalidatePath("/production-plans");
    revalidatePath(`/production-plans/${input.planId}`);
    return readPlanSnapshot(input.planId, actorEmail);
  } catch (error) {
    await recordPortalTelemetryEvent({
      actorEmail,
      eventName: "portal_production_plan_line_added",
      outcome: "failure",
      route: `/production-plans/${input.planId}`,
      referenceType: "production_plan",
      referenceId: String(input.planId),
      details: {
        styleId: input.styleId,
        sizeCode: input.sizeCode,
        colorCode: input.colorCode,
        plannedUnits: input.plannedUnits,
        channelCode: input.channelCode,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

export async function updateProductionPlanStatusAction(input: {
  planId: number;
  status: string;
  plannerNotes?: string;
}) {
  const session = await requirePortalSession({
    roles: ["owner", "planner", "ops_qa", "admin_data_tech"],
  });
  const actorEmail = session?.email ?? undefined;

  try {
    await updateProductionPlan(
      input.planId,
      input.status,
      input.plannerNotes,
      actorEmail,
    );

    await recordPortalTelemetryEvent({
      actorEmail,
      eventName: "portal_production_plan_status_updated",
      outcome: "success",
      route: `/production-plans/${input.planId}`,
      referenceType: "production_plan",
      referenceId: String(input.planId),
      details: {
        status: input.status,
        plannerNotes: input.plannerNotes,
      },
    });

    revalidatePath("/production-plans");
    revalidatePath(`/production-plans/${input.planId}`);
    return readPlanSnapshot(input.planId, actorEmail);
  } catch (error) {
    await recordPortalTelemetryEvent({
      actorEmail,
      eventName: "portal_production_plan_status_updated",
      outcome: "failure",
      route: `/production-plans/${input.planId}`,
      referenceType: "production_plan",
      referenceId: String(input.planId),
      details: {
        status: input.status,
        plannerNotes: input.plannerNotes,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}
