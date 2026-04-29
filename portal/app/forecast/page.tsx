import { getCollections } from "../../lib/internal-api";
import { getForecastRuns } from "../../lib/forecast-api";
import {
  formatPortalDateTime,
  formatPortalToken,
} from "../../lib/portal-copy";
import { requirePortalSession } from "../../lib/portal-auth";
import { PlannerClient } from "./planner-client";

export const dynamic = "force-dynamic";

export default async function PlannerConsolePage() {
  const session = await requirePortalSession({
    roles: ["owner", "planner", "admin_data_tech"],
  });
  const actorEmail = session?.email ?? undefined;
  const { items: collections } = await getCollections(actorEmail);
  const { items: runs } = await getForecastRuns(undefined, actorEmail);

  const completedRuns = runs.filter((run) => run.status === "completed");
  const runningRuns = runs.filter((run) => run.status === "running");
  const queuedRuns = runs.filter((run) => run.status === "queued");

  return (
    <main className="page-shell page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Forecast & Perencanaan</span>
          <h1>Forecast harus langsung membantu keputusan produksi, bukan berhenti di angka.</h1>
          <p>
            Halaman ini menyatukan jalur kerja dari pemilihan koleksi, proses
            forecast, pembacaan confidence, sampai langkah lanjut ke rencana produksi.
          </p>
          <p className="hero-note">
            Semua informasi yang penting untuk planner dibuat lebih ringkas dan
            mudah dibaca agar tindakan berikutnya tidak membingungkan.
          </p>

          <div className="hero-stats">
            <article className="stat-card">
              <span>Koleksi siap</span>
              <strong>{collections.length}</strong>
            </article>
            <article className="stat-card">
              <span>Diproses</span>
              <strong>{runningRuns.length}</strong>
            </article>
            <article className="stat-card">
              <span>Antre</span>
              <strong>{queuedRuns.length}</strong>
            </article>
            <article className="stat-card">
              <span>Selesai</span>
              <strong>{completedRuns.length}</strong>
            </article>
          </div>
        </div>

        <div className="hero-side">
          <article className="content-card">
            <span className="pill">Cakupan pengguna</span>
            <h3>Pemilik, planner, dan admin data.</h3>
            <p>
              Flow ini dijaga khusus untuk pengambil keputusan planning agar
              hasil model dan pembuatan rencana tetap ada di surface yang benar.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Jalankan Forecast Baru</h2>
            <p className="section-copy">
              Pilih koleksi yang aktif lalu jalankan forecast tanpa berpindah ke alur UI lain.
            </p>
          </div>
        </div>
        <PlannerClient collections={collections} />
      </section>

      {(runningRuns.length > 0 || queuedRuns.length > 0) && (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Forecast Aktif</h2>
              <p className="section-copy">
                Forecast yang masih berjalan tetap ditampilkan sebagai antrean operasional yang mudah dipantau.
              </p>
            </div>
          </div>
          <div className="jobs-grid">
            {[...runningRuns, ...queuedRuns].map((run) => (
              <article key={run.forecast_run_id} className={`job-card job-${run.status}`}>
                <div className="job-header">
                  <span className={`status-badge status-${run.status}`}>{formatPortalToken(run.status)}</span>
                  {run.confidence_score ? (
                    <span className="confidence-score">Keyakinan {run.confidence_score}%</span>
                  ) : null}
                </div>
                <h3>Run forecast #{run.forecast_run_id}</h3>
                <p className="job-date">Dibuat: {formatPortalDateTime(run.created_at)}</p>
                {run.status === "running" ? (
                  <div className="job-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "60%" }} />
                    </div>
                    <span className="progress-text">Model forecast sedang berjalan...</span>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      )}

      {completedRuns.length > 0 ? (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Forecast Selesai</h2>
              <p className="section-copy">
                Hasil yang sudah selesai bisa langsung dibuka untuk melihat rekomendasi dan membuat rencana.
              </p>
            </div>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Run</th>
                  <th>Status</th>
                  <th>Keyakinan</th>
                  <th>Model</th>
                  <th>Selesai</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {completedRuns.map((run) => (
                  <tr key={run.forecast_run_id}>
                    <td>#{run.forecast_run_id}</td>
                    <td>
                      <span className={`status-badge status-${run.status}`}>{formatPortalToken(run.status)}</span>
                    </td>
                    <td>{run.confidence_score ? `${run.confidence_score}%` : "-"}</td>
                    <td>{run.model_version || "-"}</td>
                    <td>{formatPortalDateTime(run.updated_at)}</td>
                    <td>
                      <a
                        href={`/forecast/${run.forecast_run_id}`}
                        className="btn btn-secondary btn-small"
                      >
                        Lihat rekomendasi
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {completedRuns.length === 0 && runningRuns.length === 0 && queuedRuns.length === 0 ? (
        <section className="section">
          <div className="empty-state">
            <p>Belum ada forecast. Pilih koleksi di atas untuk menjalankan forecast pertama.</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
