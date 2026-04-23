import { notFound } from "next/navigation";

import {
  getProductionPlan,
  getProductionPlanLines,
} from "../../../lib/forecast-api";
import { getStyles } from "../../../lib/internal-api";
import { requirePortalSession } from "../../../lib/portal-auth";
import { ProductionPlanDetailClient } from "./production-plan-detail-client";

export const dynamic = "force-dynamic";

export default async function ProductionPlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const [{ planId }, session] = await Promise.all([
    params,
    requirePortalSession({
      roles: ["owner", "planner", "ops_qa", "admin_data_tech"],
    }),
  ]);

  const parsedPlanId = Number.parseInt(planId, 10);
  if (Number.isNaN(parsedPlanId)) {
    notFound();
  }

  const actorEmail = session?.email ?? undefined;
  const [plan, lines, styles] = await Promise.all([
    getProductionPlan(parsedPlanId, actorEmail),
    getProductionPlanLines(parsedPlanId, actorEmail),
    getStyles(actorEmail),
  ]);

  return (
    <ProductionPlanDetailClient
      initialPlan={plan}
      initialLines={lines.items}
      styles={styles.items}
    />
  );
}
