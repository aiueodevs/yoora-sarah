import "server-only";

type StorefrontTelemetryOutcome = "info" | "success" | "failure";

type StorefrontTelemetryInput = {
  eventName: string;
  outcome?: StorefrontTelemetryOutcome;
  route?: string;
  referenceType?: string;
  referenceId?: string;
  details?: Record<string, unknown>;
};

const storefrontApiBaseUrl =
  process.env.YOORA_STOREFRONT_API_BASE_URL?.replace(/\/$/, "") ??
  process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, "");

export async function recordStorefrontTelemetryEvent(input: StorefrontTelemetryInput) {
  if (!storefrontApiBaseUrl) {
    return;
  }

  try {
    await fetch(`${storefrontApiBaseUrl}/telemetry/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        surface: "web",
        eventName: input.eventName,
        actorType: "buyer",
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
