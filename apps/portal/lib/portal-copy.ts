const tokenLabels: Record<string, string> = {
  owner: "Pemilik",
  planner: "Perencana",
  ops_qa: "Ops QA",
  admin_data_tech: "Admin Data & Tech",
  design_lead: "Lead Desain",
  pattern_lead: "Lead Pola",
  draft: "Draf",
  active: "Aktif",
  review: "Review",
  approved: "Disetujui",
  rejected: "Ditolak",
  released: "Dirilis",
  queued: "Antre",
  running: "Diproses",
  completed: "Selesai",
  failed: "Gagal",
  cancelled: "Dibatalkan",
  generated: "Baru dibuat",
  shortlisted: "Masuk shortlist",
  launch_readiness: "Kesiapan rilis",
  performance: "Performa",
  merchandising: "Merchandising",
  policy: "Kebijakan",
  glossary: "Glosarium",
  housewife: "Ibu rumah tangga",
  young_professional: "Profesional muda",
  student: "Pelajar",
  executive: "Eksekutif",
  dress: "Gaun",
  tops: "Atasan",
  bottoms: "Bawahan",
  outerwear: "Luaran",
  accessories: "Aksesori",
};

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPortalToken(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const normalized = value.trim().toLowerCase();
  if (tokenLabels[normalized]) {
    return tokenLabels[normalized];
  }

  return titleCase(normalized.replace(/[_-]+/g, " "));
}

export function formatRoleList(roles: string[] | null | undefined) {
  if (!roles || roles.length === 0) {
    return "Belum ada peran";
  }

  return roles.map((role) => formatPortalToken(role)).join(", ");
}

export function formatPortalDate(value: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatPortalDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatPortalNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}
