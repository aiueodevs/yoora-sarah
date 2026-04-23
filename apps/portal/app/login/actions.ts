"use server";

import { redirect } from "next/navigation";

import { clearPortalSession, getPortalSession, signInPortalUser } from "../../lib/portal-auth";
import { recordPortalTelemetryEvent } from "../../lib/portal-telemetry";

function buildLoginRedirect(
  nextPath: string | null,
  error: string,
  email: string,
) {
  const params = new URLSearchParams();
  params.set("error", error);
  if (nextPath) {
    params.set("next", nextPath);
  }
  if (email) {
    params.set("email", email);
  }
  return `/login?${params.toString()}`;
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "").trim();

  const result = await signInPortalUser(email, password);
  if (!result.ok) {
    await recordPortalTelemetryEvent({
      actorEmail: email || undefined,
      eventName: "portal_sign_in_attempt",
      outcome: "failure",
      route: "/login",
      details: { error: result.error },
    });
    redirect(buildLoginRedirect(nextPath || null, result.error, email));
  }

  await recordPortalTelemetryEvent({
    actorEmail: result.user.email,
    eventName: "portal_sign_in_attempt",
    outcome: "success",
    route: "/login",
    details: { nextPath: nextPath || "/" },
  });
  redirect(nextPath || "/");
}

export async function signOutAction() {
  const session = await getPortalSession();
  await recordPortalTelemetryEvent({
    actorEmail: session?.email ?? undefined,
    eventName: "portal_sign_out",
    outcome: "success",
    route: "/login",
  });
  await clearPortalSession();
  redirect("/login");
}
