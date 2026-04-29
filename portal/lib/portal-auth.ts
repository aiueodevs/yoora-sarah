import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { findPortalUserByEmail, type PortalUser } from "./portal-users";
import {
  createSessionToken,
  portalSessionCookieName,
  verifySessionToken,
} from "./session-token";

const sessionDurationMs = 1000 * 60 * 60 * 12;

type SignInResult =
  | { ok: true; user: PortalUser }
  | { ok: false; error: "missing_configuration" | "invalid_credentials" | "inactive_user" | "unknown_user" };

function getPortalAuthSecret() {
  return process.env.YOORA_PORTAL_AUTH_SECRET?.trim() ?? "";
}

function getPortalBootstrapPassword() {
  return process.env.YOORA_PORTAL_BOOTSTRAP_PASSWORD?.trim() ?? "";
}

export function isPortalAuthConfigured() {
  return Boolean(getPortalAuthSecret() && getPortalBootstrapPassword());
}

async function readPortalSessionFromCookieValue(value: string | undefined): Promise<PortalUser | null> {
  if (!value || !isPortalAuthConfigured()) {
    return null;
  }

  const payload = await verifySessionToken(value, getPortalAuthSecret());
  if (!payload) {
    return null;
  }

  const user = await findPortalUserByEmail(payload.email);
  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

export const getPortalSession = cache(async (): Promise<PortalUser | null> => {
  if (!isPortalAuthConfigured()) {
    return null;
  }

  const cookieStore = await cookies();
  return readPortalSessionFromCookieValue(cookieStore.get(portalSessionCookieName)?.value);
});

export async function signInPortalUser(email: string, password: string): Promise<SignInResult> {
  if (!isPortalAuthConfigured()) {
    return { ok: false, error: "missing_configuration" };
  }

  const user = await findPortalUserByEmail(email);
  if (!user) {
    return { ok: false, error: "unknown_user" };
  }

  if (!user.isActive) {
    return { ok: false, error: "inactive_user" };
  }

  if (password !== getPortalBootstrapPassword()) {
    return { ok: false, error: "invalid_credentials" };
  }

  const cookieStore = await cookies();
  const sessionToken = await createSessionToken(
    {
      email: user.email,
      exp: Date.now() + sessionDurationMs,
    },
    getPortalAuthSecret(),
  );

  cookieStore.set(portalSessionCookieName, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDurationMs / 1000,
  });

  return { ok: true, user };
}

export async function clearPortalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(portalSessionCookieName);
}

export async function requirePortalSession(options?: { roles?: string[] }) {
  const session = await getPortalSession();

  if (!isPortalAuthConfigured()) {
    return null;
  }

  if (!session) {
    redirect("/login");
  }

  if (options?.roles?.length) {
    const hasAllowedRole = session.roles.some((role) => options.roles?.includes(role));
    if (!hasAllowedRole) {
      redirect("/");
    }
  }

  return session;
}
