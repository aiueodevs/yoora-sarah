"use server";

import { recordStorefrontTelemetryEvent } from "@/lib/storefront-telemetry";

export async function recordBuyerEventAction(
  eventName: string,
  details?: Record<string, unknown>,
  route: string = "/buyer-assistant",
) {
  await recordStorefrontTelemetryEvent({
    eventName,
    route,
    details,
  });
}
