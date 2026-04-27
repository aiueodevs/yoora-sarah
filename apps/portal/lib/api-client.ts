type InternalApiOptions = {
  actorEmail?: string;
};

function getInternalApiBaseUrl(): string | null {
  return process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, "") ?? null;
}

function getInternalApiSharedSecret(): string | null {
  return process.env.YOORA_INTERNAL_API_SHARED_SECRET?.trim() ?? null;
}

function buildInternalApiHeaders(headers?: HeadersInit, actorEmail?: string): Headers {
  const mergedHeaders = new Headers(headers);
  const sharedSecret = getInternalApiSharedSecret();

  if (!mergedHeaders.has("Content-Type")) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  if (sharedSecret) {
    mergedHeaders.set("x-yoora-internal-key", sharedSecret);
  }

  if (actorEmail) {
    mergedHeaders.set("x-yoora-actor-email", actorEmail);
  }

  return mergedHeaders;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

async function buildInternalApiError(response: Response): Promise<Error> {
  try {
    const payload = await parseJsonResponse<{ detail?: string; message?: string }>(response);
    const message = payload?.detail || payload?.message;
    if (message) {
      return new Error(message);
    }
  } catch {}

  return new Error(`API error: ${response.status}`);
}

export function isInternalApiConfigured(): boolean {
  return Boolean(getInternalApiBaseUrl());
}

export async function fetchInternalApi<T>(
  path: string,
  init?: RequestInit,
  options?: InternalApiOptions,
): Promise<T> {
  const baseUrl = getInternalApiBaseUrl();
  if (!baseUrl) {
    throw new Error("Internal API not configured");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: buildInternalApiHeaders(init?.headers, options?.actorEmail),
  });

  if (!response.ok) {
    throw await buildInternalApiError(response);
  }

  return parseJsonResponse<T>(response);
}

export async function readInternalApi<T>(
  path: string,
  options?: InternalApiOptions,
): Promise<T | null> {
  if (!isInternalApiConfigured()) {
    return null;
  }

  try {
    return await fetchInternalApi<T>(
      path,
      {
        cache: "no-store",
      },
      options,
    );
  } catch {
    return null;
  }
}
