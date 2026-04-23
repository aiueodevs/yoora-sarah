import Link from "next/link";

import { foundationTracks, squads } from "../lib/dashboard-data";
import { formatRoleList } from "../lib/portal-copy";
import { requirePortalSession } from "../lib/portal-auth";

const commandModules = [
  {
    href: "/dashboard",
    label: "Dasbor Pimpinan",
    copy: "Ringkasan yang rapi untuk antrean kerja, persetujuan, kapasitas, dan tekanan rilis harian.",
    roles: "Pemilik, perencana, operasional, admin",
  },
  {
    href: "/briefs",
    label: "Intake Brief",
    copy: "Susun brief dengan konteks merek, target, dan tujuan kampanye yang langsung siap diteruskan ke desain.",
    roles: "Pemilik, lead desain, lead pola",
  },
  {
    href: "/design-gallery",
    label: "Review Desain",
    copy: "Pilih, setujui, atau tolak hasil desain AI dalam permukaan review yang jelas dan mudah diawasi.",
    roles: "Pemilik, lead desain, lead pola",
  },
  {
    href: "/forecast",
    label: "Forecast & Perencanaan",
    copy: "Jalankan forecast, baca tingkat keyakinan, lalu teruskan rekomendasi ke rencana produksi tanpa alur buntu.",
    roles: "Pemilik, perencana, admin",
  },
  {
    href: "/production-plans",
    label: "Rencana Produksi",
    copy: "Pantau status rencana dari draf sampai rilis dengan pemilik keputusan dan jejak aksi yang tetap terlihat.",
    roles: "Pemilik, perencana, ops QA",
  },
  {
    href: "/approvals",
    label: "Pusat Persetujuan",
    copy: "Jaga jejak keputusan tetap utuh di setiap artefak, aktor, dan perubahan status untuk kontrol manajemen.",
    roles: "Pemilik, para lead, ops QA",
  },
];

const portalPrinciples = [
  "Portal dipisahkan dari perjalanan pembeli di website, tetapi tetap berbagi data, kontrak API, dan tata kelola yang sama.",
  "Setiap alur kerja menjaga peran dan aktor agar keputusan tetap dapat diaudit di bawah autentikasi internal.",
  "Ringkasan pimpinan, kejelasan kerja tim, dan visibilitas persetujuan diperlakukan sebagai permukaan utama, bukan pelengkap.",
  "Keputusan manusia tetap eksplisit di setiap tahap desain, planning, persetujuan, dan rilis.",
];

const workflowStages = [
  {
    step: "01",
    title: "Brief masuk",
    copy: "Owner atau lead merapikan brief agar konteks kerja tidak hilang sejak awal.",
    href: "/briefs",
  },
  {
    step: "02",
    title: "Desain direview",
    copy: "Hasil visual dibaca cepat, dipilih shortlist-nya, lalu keputusan dibuat jelas.",
    href: "/design-gallery",
  },
  {
    step: "03",
    title: "Pola disiapkan",
    copy: "Lead pola melihat apa yang sudah siap diproses dan apa yang masih perlu perhatian.",
    href: "/patterns",
  },
  {
    step: "04",
    title: "Forecast dibaca",
    copy: "Planner mengecek sinyal demand sebelum kapasitas berubah menjadi komitmen produksi.",
    href: "/forecast",
  },
  {
    step: "05",
    title: "Produksi dirilis",
    copy: "Rencana produksi bergerak ke tahap final dengan jejak persetujuan yang tetap terlihat.",
    href: "/production-plans",
  },
];

export default function HomePage() {
  const sessionPromise = requirePortalSession();

  return (
    <main className="page-shell page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Pusat Kendali Internal</span>
          <h1>Portal kerja yang tenang, premium, dan mudah dipahami tim.</h1>
          <p>
            Portal ini disusun ulang agar setiap orang langsung paham apa yang
            harus dilihat, dikerjakan, dan diputuskan. Fokusnya adalah
            kejelasan workflow, bahasa yang sederhana, dan tampilan yang lebih
            elegan untuk operasi internal Yoora Sarah.
          </p>
          <p className="hero-note">
            Semua modul utama diposisikan sebagai ruang kerja yang saling
            terhubung: brief, review desain, pola, forecast, persetujuan, dan
            rencana produksi.
          </p>

          <div className="hero-links">
            <Link className="hero-link" href="/dashboard">
              Buka dasbor
            </Link>
            <Link className="btn btn-secondary" href="/approvals">
              Lihat persetujuan
            </Link>
          </div>

          <div className="hero-stats">
            <SessionSummary sessionPromise={sessionPromise} />
            <article className="stat-card">
              <span>Prioritas saat ini</span>
              <strong className="stat-value-compact">Kejelasan operasional</strong>
            </article>
            <article className="stat-card">
              <span>Modul aktif</span>
              <strong className="stat-value-compact">6 area utama</strong>
            </article>
            <article className="stat-card">
              <span>Aturan kerja</span>
              <strong className="stat-value-compact">Keputusan tetap manusia</strong>
            </article>
          </div>
        </div>

        <div className="hero-side">
          <article className="content-card">
            <span className="pill">Arah portal</span>
            <h3>Selaras dengan website, tetapi tetap terasa seperti command center.</h3>
            <p>
              Bahasa visual mengikuti karakter website utama, namun struktur
              informasinya tetap khusus untuk kebutuhan manajemen dan tim internal.
            </p>
          </article>

          <article className="content-card">
            <span className="pill">Prinsip kerja</span>
            <ul className="summary-list">
              {portalPrinciples.map((principle) => (
                <li className="summary-item" key={principle}>
                  <div className="summary-meta">
                    <strong>Workflow terkendali</strong>
                    <p>{principle}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Alur Kerja Portal</h2>
            <p className="section-copy">
              Beranda sekarang menunjukkan urutan kerja yang sebenarnya agar
              pengguna baru maupun lama langsung paham harus mulai dari mana.
            </p>
          </div>
        </div>

        <div className="workflow-map-grid">
          {workflowStages.map((stage) => (
            <article className="workflow-stage-card" key={stage.href}>
              <span className="workflow-stage-step">{stage.step}</span>
              <h3>{stage.title}</h3>
              <p>{stage.copy}</p>
              <Link className="btn btn-secondary btn-small" href={stage.href}>
                Buka tahap ini
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Modul Utama</h2>
            <p className="section-copy">
              Setiap modul punya tujuan yang jelas, siapa yang memakainya
              jelas, dan langkah berikutnya juga mudah ditebak oleh pengguna.
            </p>
          </div>
        </div>

        <div className="card-grid">
          {commandModules.map((module) => (
            <article className="content-card" key={module.href}>
              <span className="pill">{module.roles}</span>
              <h3>{module.label}</h3>
              <p>{module.copy}</p>
              <div className="card-footer">
                <span className="card-caption">Rute internal berbasis peran</span>
                <Link className="btn btn-secondary btn-small" href={module.href}>
                  Buka modul
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="split-grid">
        <article className="content-card">
          <span className="pill">Tim penggerak</span>
          <h3>Pemetaan kerja tetap terhubung ke prioritas roadmap.</h3>
          <ul className="workflow-list">
            {squads.map((squad) => (
              <li className="workflow-item" key={squad.name}>
                <div className="workflow-meta">
                  <strong>{squad.name}</strong>
                  <p>{squad.focus}</p>
                  <span className="text-muted">{squad.window}</span>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="content-card">
          <span className="pill">Fondasi operasional</span>
          <h3>Komponen dasar tetap terlihat agar tim paham apa yang menopang portal.</h3>
          <ul className="foundation-list">
            {foundationTracks.map((track) => (
              <li key={track}>
                <div className="summary-meta">
                  <strong>Fondasi aktif</strong>
                  <p>{track}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

async function SessionSummary({
  sessionPromise,
}: {
  sessionPromise: Promise<Awaited<ReturnType<typeof requirePortalSession>>>;
}) {
  const session = await sessionPromise;

  return (
    <article className="stat-card">
      <span>Aktor aktif</span>
      <strong className="stat-value-compact">{session?.fullName ?? "Mode terbuka"}</strong>
      <p className="metric-foot">{formatRoleList(session?.roles)}</p>
    </article>
  );
}
