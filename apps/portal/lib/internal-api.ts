export type Brand = {
  id: string;
  code: string;
  name: string;
  brandType: string;
  parentBrandId: string | null;
  isActive: boolean;
};

export type Fabric = {
  id: string;
  code: string;
  name: string;
  composition?: string | null;
  notes?: string | null;
};

export type SizeChart = {
  id: string;
  brandId: string;
  code: string;
  name: string;
  genderScope?: string | null;
  entries: Array<{
    sizeCode: string;
    bustCm?: number | null;
    waistCm?: number | null;
    hipCm?: number | null;
    lengthCm?: number | null;
  }>;
};

export type Approval = {
  id: string;
  artifactType: string;
  artifactId: string;
  currentStatus: string;
  updatedAt: string;
};

export type AuditEvent = {
  id: string;
  actorId: string;
  eventType: string;
  referenceType: string;
  referenceId: string;
  notes?: string | null;
  timestamp: string;
};

type BrandRow = {
  brand_id: number;
  code: string;
  name: string;
  brand_type: string;
  parent_brand_id: number | null;
  is_active: boolean;
};

type FabricRow = {
  fabric_id: number;
  code: string;
  name: string;
  composition?: string | null;
  notes?: string | null;
};

type SizeChartRow = {
  size_chart_id: number;
  brand_id: number;
  code: string;
  name: string;
  gender_scope?: string | null;
};

type SizeChartEntryRow = {
  size_chart_id: number;
  size_code: string;
  bust_cm?: number | null;
  waist_cm?: number | null;
  hip_cm?: number | null;
  length_cm?: number | null;
};

type ApprovalRow = {
  approval_id: number;
  reference_type: string;
  reference_id: string;
  current_status: string;
  updated_at: string;
};

type AuditEventRow = {
  audit_event_id: number;
  actor_user_id: number | null;
  event_type: string;
  reference_type: string;
  reference_id: string;
  event_payload?: {
    reason?: string | null;
    notes?: string | null;
  } | null;
  created_at: string;
};

type UserRow = {
  user_id: number;
  email: string;
};

const internalApiBaseUrl = process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, "");
const internalApiSharedSecret = process.env.YOORA_INTERNAL_API_SHARED_SECRET?.trim();
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

const ACTOR_ALIAS_BY_EMAIL: Record<string, string> = {
  "owner@yoora.local": "user_owner",
  "design.lead@yoora.local": "user_design_lead",
  "pattern.lead@yoora.local": "user_pattern_lead",
  "planner@yoora.local": "user_planner",
  "ops.qa@yoora.local": "user_ops_qa",
  "admin.tech@yoora.local": "user_admin_tech",
};

function externalId(prefix: string, value: number | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  return `${prefix}_${value}`;
}

function toActorId(userId: number | null, email?: string | null): string {
  if (email) {
    const alias = ACTOR_ALIAS_BY_EMAIL[email.toLowerCase()];
    if (alias) {
      return alias;
    }
  }
  if (userId != null) {
    return `user_${userId}`;
  }
  return "system";
}

async function readSupabaseRows<T>(path: string, fallbackValue: T): Promise<T> {
  if (!supabaseUrl || !supabaseSecretKey) {
    return fallbackValue;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      cache: "no-store",
      headers: {
        apikey: supabaseSecretKey,
        Authorization: `Bearer ${supabaseSecretKey}`,
      },
    });
    if (!response.ok) {
      return fallbackValue;
    }
    return (await response.json()) as T;
  } catch {
    return fallbackValue;
  }
}

async function readInternalApi<T>(path: string, actorEmail?: string): Promise<T | null> {
  if (!internalApiBaseUrl) {
    return null;
  }

  const headers = new Headers();
  if (internalApiSharedSecret) {
    headers.set("x-yoora-internal-key", internalApiSharedSecret);
  }
  if (actorEmail) {
    headers.set("x-yoora-actor-email", actorEmail);
  }

  try {
    const response = await fetch(`${internalApiBaseUrl}${path}`, {
      cache: "no-store",
      headers,
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getSettingsData(actorEmail?: string): Promise<{
  brands: Brand[];
  fabrics: Fabric[];
  sizeCharts: SizeChart[];
}> {
  const apiResult = await Promise.all([
    readInternalApi<Brand[]>("/master-data/brands", actorEmail),
    readInternalApi<Fabric[]>("/master-data/fabrics", actorEmail),
    readInternalApi<SizeChart[]>("/master-data/size-charts", actorEmail),
  ]);

  const [brandsFromApi, fabricsFromApi, sizeChartsFromApi] = apiResult;
  if (brandsFromApi && fabricsFromApi && sizeChartsFromApi) {
    return {
      brands: brandsFromApi,
      fabrics: fabricsFromApi,
      sizeCharts: sizeChartsFromApi,
    };
  }

  const [brandRows, fabricRows, chartRows, entryRows] = await Promise.all([
    readSupabaseRows<BrandRow[]>(
      "brands?select=brand_id,code,name,brand_type,parent_brand_id,is_active&order=brand_id.asc",
      [],
    ),
    readSupabaseRows<FabricRow[]>(
      "fabrics?select=fabric_id,code,name,composition,notes&order=fabric_id.asc",
      [],
    ),
    readSupabaseRows<SizeChartRow[]>(
      "size_charts?select=size_chart_id,brand_id,code,name,gender_scope&order=size_chart_id.asc",
      [],
    ),
    readSupabaseRows<SizeChartEntryRow[]>(
      "size_chart_entries?select=size_chart_id,size_code,bust_cm,waist_cm,hip_cm,length_cm&order=size_chart_id.asc&order=size_chart_entry_id.asc",
      [],
    ),
  ]);

  const entriesByChart = new Map<number, SizeChart["entries"]>();
  for (const entry of entryRows) {
    const items = entriesByChart.get(entry.size_chart_id) ?? [];
    items.push({
      sizeCode: entry.size_code,
      bustCm: entry.bust_cm ?? null,
      waistCm: entry.waist_cm ?? null,
      hipCm: entry.hip_cm ?? null,
      lengthCm: entry.length_cm ?? null,
    });
    entriesByChart.set(entry.size_chart_id, items);
  }

  const brands = brandRows.map((row) => ({
    id: externalId("brand", row.brand_id) ?? "",
    code: row.code,
    name: row.name,
    brandType: row.brand_type,
    parentBrandId: externalId("brand", row.parent_brand_id),
    isActive: row.is_active,
  }));

  const fabrics = fabricRows.map((row) => ({
    id: externalId("fabric", row.fabric_id) ?? "",
    code: row.code,
    name: row.name,
    composition: row.composition ?? null,
    notes: row.notes ?? null,
  }));

  const sizeCharts = chartRows.map((row) => ({
    id: externalId("size_chart", row.size_chart_id) ?? "",
    brandId: externalId("brand", row.brand_id) ?? "",
    code: row.code,
    name: row.name,
    genderScope: row.gender_scope ?? null,
    entries: entriesByChart.get(row.size_chart_id) ?? [],
  }));

  return { brands, fabrics, sizeCharts };
}

export type Collection = {
  id: string;
  code: string;
  name: string;
  season?: string | null;
  year?: number | null;
  status: string;
};

export type Style = {
  id: string;
  code: string;
  name: string;
  category?: string | null;
  description?: string | null;
};

export async function getStyles(actorEmail?: string): Promise<{ items: Style[] }> {
  try {
    const result = await readInternalApi<Style[]>("/master-data/styles", actorEmail);
    if (result) {
      return { items: result };
    }
  } catch {}
  return { items: [] };
}

export async function getCollections(actorEmail?: string): Promise<{ items: Collection[] }> {
  try {
    const result = await readInternalApi<Collection[]>("/master-data/collections", actorEmail);
    if (result) {
      return { items: result };
    }
  } catch {}
  return { items: [] };
}

export async function getApprovalData(actorEmail?: string): Promise<{
  approvals: Approval[];
  auditEvents: AuditEvent[];
}> {
  const [approvalsFromApi, auditFromApi] = await Promise.all([
    readInternalApi<Approval[]>("/approvals", actorEmail),
    readInternalApi<{ items: AuditEvent[]; count: number }>("/audit/events", actorEmail),
  ]);

  if (approvalsFromApi && auditFromApi) {
    return {
      approvals: approvalsFromApi,
      auditEvents: auditFromApi.items,
    };
  }

  const [approvalRows, auditRows] = await Promise.all([
    readSupabaseRows<ApprovalRow[]>(
      "approvals?select=approval_id,reference_type,reference_id,current_status,updated_at&order=updated_at.desc&order=approval_id.desc",
      [],
    ),
    readSupabaseRows<AuditEventRow[]>(
      "audit_events?select=audit_event_id,actor_user_id,event_type,reference_type,reference_id,event_payload,created_at&order=created_at.desc&order=audit_event_id.desc",
      [],
    ),
  ]);

  const userIds = [...new Set(auditRows.map((row) => row.actor_user_id).filter((value): value is number => value != null))];
  const users =
    userIds.length === 0
      ? []
      : await readSupabaseRows<UserRow[]>(
          `users?select=user_id,email&user_id=in.(${userIds.join(",")})`,
          [],
        );

  const emailByUserId = new Map<number, string>();
  for (const user of users) {
    emailByUserId.set(user.user_id, user.email);
  }

  const approvals = approvalRows.map((row) => ({
    id: externalId("approval", row.approval_id) ?? "",
    artifactType: row.reference_type,
    artifactId: row.reference_id,
    currentStatus: row.current_status,
    updatedAt: row.updated_at,
  }));

  const auditEvents = auditRows.map((row) => ({
    id: externalId("audit", row.audit_event_id) ?? "",
    actorId: toActorId(row.actor_user_id, row.actor_user_id == null ? null : emailByUserId.get(row.actor_user_id)),
    eventType: row.event_type,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    notes: row.event_payload?.reason ?? row.event_payload?.notes ?? null,
    timestamp: row.created_at,
  }));

  return { approvals, auditEvents };
}
