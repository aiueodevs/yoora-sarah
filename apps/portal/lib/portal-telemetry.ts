import "server-only";

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

const internalApiBaseUrl = process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, "");
const internalApiSharedSecret = process.env.YOORA_INTERNAL_API_SHARED_SECRET?.trim();

export async function recordPortalTelemetryEvent(input: PortalTelemetryInput) {
  if (!internalApiBaseUrl) {
    return;
  }

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (internalApiSharedSecret) {
    headers.set("x-yoora-internal-key", internalApiSharedSecret);
  }
  if (input.actorEmail) {
    headers.set("x-yoora-actor-email", input.actorEmail);
  }

  try {
    await fetch(`${internalApiBaseUrl}/telemetry/internal/events`, {
      method: "POST",
      headers,
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
    });
  } catch {}
}
