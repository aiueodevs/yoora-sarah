export const squads = [
  {
    name: "Squad 1 - Fondasi Platform",
    focus: "Repo, autentikasi, skema, migrasi, dan fondasi master data",
    window: "Sprint 0-1",
  },
  {
    name: "Squad 2 - Desain dan Pola",
    focus: "Brief, generasi, kurasi, handoff persetujuan, dan workflow pola",
    window: "Sprint 2-4",
  },
  {
    name: "Squad 3 - Perencanaan",
    focus: "Ingestion, forecast, detail rekomendasi, dan rencana produksi",
    window: "Sprint 5-7",
  },
  {
    name: "Squad 4 - Menara Kendali",
    focus: "Persetujuan, visibilitas audit, dasbor pimpinan, dan permukaan admin",
    window: "Sprint 1 dan Sprint 8",
  },
  {
    name: "Squad 5 - Kualitas dan Rilis",
    focus: "Testing, keamanan, rehearsal, dan kontrol pilot launch",
    window: "Sprint 9-10",
  },
] as const;

export const foundationTracks = [
  "Migrasi executable di db/migrations",
  "Seed data idempotent di db/seeds",
  "Kerangka FastAPI untuk API internal",
  "Portal Next.js untuk pemilik dan para lead",
] as const;
