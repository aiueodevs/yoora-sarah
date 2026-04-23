import { getPatternJobs, getSizeCharts } from "../../lib/pattern-jobs-api";
import { getDesignOptions } from "../../lib/design-jobs-api";
import {
  formatPortalDateTime,
  formatPortalToken,
} from "../../lib/portal-copy";
import { requirePortalSession } from "../../lib/portal-auth";
import { PatternFormClient } from "./pattern-form-client";

export const dynamic = "force-dynamic";

export default async function PatternQueuePage() {
  const session = await requirePortalSession({
    roles: ["owner", "design_lead", "pattern_lead", "admin_data_tech"],
  });
  const actorEmail = session?.email ?? undefined;
  const { items: jobs } = await getPatternJobs(undefined, actorEmail);
  const { items: designOptions } = await getDesignOptions(undefined, undefined, actorEmail);
  const { sizeCharts } = await getSizeCharts(actorEmail);

  const queuedJobs = jobs.filter((j) => j.status === "queued");
  const runningJobs = jobs.filter((j) => j.status === "running");
  const completedJobs = jobs.filter((j) => j.status === "completed" || j.status === "review");

  return (
    <main className="page-shell page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Workflow Pola</span>
          <h1>Alur pola harus terasa tertib, bukan sekadar antrean teknis.</h1>
          <p>
            Halaman ini mengubah desain yang sudah disetujui menjadi pekerjaan
            pola yang siap dipantau, direview, dan diteruskan ke produksi.
          </p>

          <div className="hero-stats">
            <article className="stat-card">
              <span>Antre</span>
              <strong>{queuedJobs.length}</strong>
            </article>
            <article className="stat-card">
              <span>Diproses</span>
              <strong>{runningJobs.length}</strong>
            </article>
            <article className="stat-card">
              <span>Selesai atau review</span>
              <strong>{completedJobs.length}</strong>
            </article>
          </div>
        </div>

        <div className="hero-side">
          <article className="content-card">
            <span className="pill">Tujuan halaman</span>
            <h3>Dari desain ke pola siap produksi.</h3>
            <p>
              Pengguna bisa memulai job baru, memantau progres, dan melihat hasil
              tanpa berpindah ke antarmuka yang terasa teknis atau membingungkan.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Mulai Pekerjaan Pola Baru</h2>
            <p className="section-copy">Pilih desain yang sudah disetujui lalu pasangkan dengan tabel ukuran yang tepat.</p>
          </div>
        </div>
        <PatternFormClient designOptions={designOptions} sizeCharts={sizeCharts} />
      </section>

      {(queuedJobs.length > 0 || runningJobs.length > 0) && (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Pekerjaan Aktif</h2>
              <p className="section-copy">Pekerjaan yang sedang antre atau berjalan tetap terlihat jelas agar tidak kehilangan momentum review.</p>
            </div>
          </div>
          <div className="jobs-grid">
            {[...runningJobs, ...queuedJobs].map((job) => (
              <article key={job.id} className={`job-card job-${job.status}`}>
                <div className="job-header">
                  <span className={`status-badge status-${job.status}`}>
                    {formatPortalToken(job.status)}
                  </span>
                  <span className="size-chart">{job.sizeChartName}</span>
                </div>
                <h3>{job.designOptionTitle || "Pekerjaan pola"}</h3>
                <p className="job-date">
                  Dibuat: {formatPortalDateTime(job.createdAt)}
                </p>
                {job.status === "running" && (
                  <div className="job-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "60%" }} />
                    </div>
                    <span className="progress-text">Sedang membuat pola...</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Hasil Pola</h2>
            <p className="section-copy">Daftar hasil pola yang sudah selesai atau siap direview.</p>
          </div>
        </div>
        {completedJobs.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada hasil pola yang selesai.</p>
          </div>
        ) : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Desain</th>
                  <th>Tabel Ukuran</th>
                  <th>Status</th>
                  <th>Selesai</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {completedJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.designOptionTitle || "-"}</td>
                    <td>{job.sizeChartName}</td>
                    <td>
                      <span className={`status-badge status-${job.status}`}>
                        {formatPortalToken(job.status)}
                      </span>
                    </td>
                    <td>{formatPortalDateTime(job.updatedAt)}</td>
                    <td>
                      <a
                        href={`/patterns/${job.id}`}
                        className="btn btn-secondary btn-small"
                      >
                        Lihat detail
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
