import Image from "next/image";
import Link from "next/link";

import {
  getDesignJobs,
  getDesignOptions,
} from "../../lib/design-jobs-api";
import { getBriefs } from "../../lib/briefs-api";
import {
  formatPortalDateTime,
  formatPortalToken,
} from "../../lib/portal-copy";
import { requirePortalSession } from "../../lib/portal-auth";
import { updateDesignOptionStatusAction } from "./actions";

export default async function DesignGalleryPage() {
  const session = await requirePortalSession({
    roles: ["owner", "design_lead", "pattern_lead", "admin_data_tech"],
  });
  const actorEmail = session?.email ?? undefined;
  const { briefs } = await getBriefs(actorEmail);
  const { items: jobs } = await getDesignJobs(undefined, actorEmail);
  const { items: options } = await getDesignOptions(undefined, undefined, actorEmail);

  const completedJobs = jobs.filter((j) => j.status === "completed");
  const pendingJobs = jobs.filter((j) => j.status !== "completed");

  return (
    <main className="page-shell page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Review Desain</span>
          <h1>Kurasi desain harus terasa meyakinkan, rapi, dan mudah diputuskan.</h1>
          <p>
            Halaman ini membantu tim memilih hasil desain AI yang layak diteruskan
            ke pola, dengan tampilan yang lebih bersih dan keputusan yang lebih jelas.
          </p>
          <div className="hero-stats">
            <article className="stat-card">
              <span>Pekerjaan aktif</span>
              <strong>{pendingJobs.length}</strong>
            </article>
            <article className="stat-card">
              <span>Job selesai</span>
              <strong>{completedJobs.length}</strong>
            </article>
            <article className="stat-card">
              <span>Opsi desain</span>
              <strong>{options.length}</strong>
            </article>
          </div>
        </div>

        <div className="hero-side">
          <article className="content-card">
            <span className="pill">Tujuan halaman</span>
            <h3>Pilih cepat, tetap teliti.</h3>
            <p>
              Pengguna bisa melihat kandidat, membaca konteks, lalu melakukan
              shortlist, persetujuan, atau penolakan tanpa alur yang membingungkan.
            </p>
          </article>
        </div>
      </section>

      {pendingJobs.length > 0 && (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Sedang Diproses</h2>
              <p className="section-copy">Pekerjaan desain yang masih berjalan ditampilkan sebagai antrean yang mudah dipantau.</p>
            </div>
          </div>
          <div className="jobs-grid">
            {pendingJobs.map((job) => (
              <article key={job.id} className="job-card job-pending">
                <div className="job-header">
                  <span className={`status-badge status-${job.status}`}>
                    {formatPortalToken(job.status)}
                  </span>
                  <span className="variations">{job.variationCount} varian</span>
                </div>
                <h3>{job.briefTitle || "Brief tanpa judul"}</h3>
                <p className="job-date">
                  Dimulai: {formatPortalDateTime(job.createdAt)}
                </p>
                <div className="job-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width:
                          job.status === "running"
                            ? "50%"
                            : job.status === "completed"
                            ? "100%"
                            : "10%",
                      }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Opsi Desain</h2>
            <p className="section-copy">Filter dan review hasil desain dengan konteks brief yang tetap terlihat.</p>
          </div>
          <div className="filter-group">
            <select id="filter-brief" className="filter-select">
              <option value="">Semua brief</option>
              {briefs.map((brief) => (
                <option key={brief.id} value={brief.id}>
                  {brief.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {options.length === 0 ? (
          <div className="empty-state">
            <p>
              Belum ada opsi desain. Buat brief dan jalankan generasi desain untuk
              melihat hasil di sini.
            </p>
            <Link href="/briefs" className="btn btn-primary">
              Ke halaman brief
            </Link>
          </div>
        ) : (
          <div className="designs-grid">
            {options.map((option) => (
              <article
                key={option.id}
                className={`design-card design-${option.status}`}
              >
                <div className="design-image">
                  {option.imageUrl ? (
                    <Image
                      src={option.imageUrl}
                      alt={option.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="design-image-media"
                      unoptimized
                    />
                  ) : (
                    <div className="design-placeholder">
                      <span>Belum ada preview</span>
                    </div>
                  )}
                  <span className={`status-badge design-status status-${option.status}`}>
                    {formatPortalToken(option.status)}
                  </span>
                </div>
                <div className="design-content">
                  <h3>{option.title}</h3>
                  <p className="design-code">{option.candidateCode}</p>
                  {option.materialNotes && (
                    <p className="design-notes">{option.materialNotes}</p>
                  )}
                  {option.rationale && (
                    <p className="design-rationale">{option.rationale}</p>
                  )}
                  <div className="design-actions">
                    {option.status === "generated" && (
                      <>
                        <form
                          action={updateDesignOptionStatusAction.bind(null, option.id, "shortlisted")}
                        >
                          <button
                            className="btn btn-small btn-secondary"
                            data-action="shortlist"
                            data-option-id={option.id}
                          >
                            Masuk shortlist
                          </button>
                        </form>
                        <form
                          action={updateDesignOptionStatusAction.bind(null, option.id, "rejected")}
                        >
                          <button
                            className="btn btn-small btn-outline"
                            data-action="reject"
                            data-option-id={option.id}
                          >
                            Tolak
                          </button>
                        </form>
                      </>
                    )}
                    {option.status === "shortlisted" && (
                      <>
                        <form
                          action={updateDesignOptionStatusAction.bind(null, option.id, "approved")}
                        >
                          <button
                            className="btn btn-small btn-primary"
                            data-action="approve"
                            data-option-id={option.id}
                          >
                            Setujui
                          </button>
                        </form>
                        <form
                          action={updateDesignOptionStatusAction.bind(null, option.id, "rejected")}
                        >
                          <button
                            className="btn btn-small btn-outline"
                            data-action="reject"
                            data-option-id={option.id}
                          >
                            Tolak
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Job Selesai</h2>
            <p className="section-copy">Riwayat job selesai tetap tersedia untuk pengecekan cepat dan audit ringan.</p>
          </div>
        </div>
        {completedJobs.length === 0 ? (
          <p className="text-muted">Belum ada job desain yang selesai.</p>
        ) : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Brief</th>
                  <th>Varian</th>
                  <th>Status</th>
                  <th>Selesai</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {completedJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.briefTitle || "Tanpa judul"}</td>
                    <td>{job.variationCount}</td>
                    <td>
                      <span className={`status-badge status-${job.status}`}>
                        {formatPortalToken(job.status)}
                      </span>
                    </td>
                    <td>{formatPortalDateTime(job.updatedAt)}</td>
                    <td>
                      <Link href={`/design-jobs/${job.id}`} className="btn btn-secondary btn-small">
                        Lihat
                      </Link>
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
