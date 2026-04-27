import "server-only";

import { fetchInternalApi, isInternalApiConfigured } from "./api-client";

type PortalTelemetryOutcome = "info" | "success" | "failure";

type PortalTelemetryInput = {
  actorEmail?: string;
  eventName: string;
  outcome?: PortalTelemetryOutcome;
  route?: string;
  referenceType?: string;
  referenceId?: string;
  details?: Record<string, unknown>;
};

export async function recordPortalTelemetryEvent(input: PortalTelemetryInput) {
  if (!isInternalApiConfigured()) {
    return;
  }

  try {
    await fetchInternalApi<void>(
      "/telemetry/internal/events",
      {
        method: "POST",
        body: JSON.stringify({
          surface: "portal",
          eventName: input.eventName,
          actorType: "internal",
          route: input.route,
          outcome: input.outcome ?? "info",
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          details: input.details ?? {},
        }),
        cache: "no-store",
      },
      { actorEmail: input.actorEmail },
    );
  } catch {}
}
