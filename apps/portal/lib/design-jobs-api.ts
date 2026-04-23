import { extractList } from "./response-normalizers";

const internalApiBaseUrl = process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, "");
const internalApiSharedSecret = process.env.YOORA_INTERNAL_API_SHARED_SECRET?.trim();

async function fetchInternalApi<T>(path: string, options?: RequestInit, actorEmail?: string): Promise<T> {
  if (!internalApiBaseUrl) {
    throw new Error("Internal API not configured");
  }

  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");

  if (internalApiSharedSecret) {
    headers.set("x-yoora-internal-key", internalApiSharedSecret);
  }
  if (actorEmail) {
    headers.set("x-yoora-actor-email", actorEmail);
  }

  const response = await fetch(`${internalApiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

export type DesignJob = {
  id: string;
  briefId: string;
  briefTitle?: string;
  requestedByUserId: string;
  requestedByEmail?: string;
  variationCount: number;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  promptVersion?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type DesignOption = {
  id: string;
  designGenerationJobId: string;
  briefId: string;
  candidateCode: string;
  title: string;
  status: "generated" | "shortlisted" | "approved" | "rejected";
  imageUrl?: string;
  materialNotes?: string;
  rationale?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type DesignAnnotation = {
  id: string;
  designOptionId: string;
  authorUserId: string;
  authorEmail?: string;
  annotationType: string;
  note: string;
  createdAt: string;
};

export type DesignJobCreate = {
  briefId: string;
  variationCount: number;
  promptVersion?: string;
};

export async function getDesignJobs(briefId?: string, actorEmail?: string): Promise<{ items: DesignJob[] }> {
  try {
    const params = briefId ? `?brief_id=${briefId}` : "";
    const payload = await fetchInternalApi<unknown>(`/design-jobs${params}`, undefined, actorEmail);
    return { items: extractList<DesignJob>(payload, "items", "jobs") };
  } catch {
    return { items: [] };
  }
}

export async function getDesignJob(jobId: string, actorEmail?: string): Promise<DesignJob> {
  return fetchInternalApi<DesignJob>(`/design-jobs/${jobId}`, undefined, actorEmail);
}

export async function createDesignJob(data: DesignJobCreate): Promise<DesignJob> {
  return fetchInternalApi<DesignJob>("/design-jobs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getDesignOptions(
  briefId?: string,
  jobId?: string,
  actorEmail?: string,
): Promise<{ items: DesignOption[] }> {
  try {
    const params = new URLSearchParams();
    if (briefId) params.append("brief_id", briefId);
    if (jobId) params.append("job_id", jobId);
    const query = params.toString();
    const payload = await fetchInternalApi<unknown>(
      `/design-jobs/options${query ? `?${query}` : ""}`,
      undefined,
      actorEmail,
    );
    return { items: extractList<DesignOption>(payload, "items", "options") };
  } catch {
    return { items: [] };
  }
}

export async function getDesignOption(optionId: string, actorEmail?: string): Promise<DesignOption> {
  return fetchInternalApi<DesignOption>(`/design-jobs/options/${optionId}`, undefined, actorEmail);
}

export async function updateOptionStatus(
  optionId: string,
  newStatus: string,
  actorEmail?: string,
): Promise<DesignOption> {
  return fetchInternalApi<DesignOption>(`/design-jobs/options/${optionId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus }),
  }, actorEmail);
}

export async function getAnnotations(optionId: string, actorEmail?: string): Promise<{ items: DesignAnnotation[] }> {
  try {
    const payload = await fetchInternalApi<unknown>(
      `/design-jobs/options/${optionId}/annotations`,
      undefined,
      actorEmail,
    );
    return { items: extractList<DesignAnnotation>(payload, "items", "annotations") };
  } catch {
    return { items: [] };
  }
}

export async function addAnnotation(
  optionId: string,
  annotationType: string,
  note: string,
  actorEmail?: string,
): Promise<DesignAnnotation> {
  return fetchInternalApi<DesignAnnotation>(`/design-jobs/options/${optionId}/annotations`, {
    method: "POST",
    body: JSON.stringify({ annotation_type: annotationType, note }),
  }, actorEmail);
}
