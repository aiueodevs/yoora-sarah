import { getApprovalData } from "../../lib/internal-api";
import {
  getKnowledgeArticles,
  getLaunchReadinessInsight,
  getPerformanceInsight,
} from "../../lib/internal-ai-api";
import {
  formatPortalDateTime,
  formatPortalToken,
} from "../../lib/portal-copy";
import { requirePortalSession } from "../../lib/portal-auth";

export default async function ApprovalsPage() {
  const session = await requirePortalSession({
    roles: [
      "owner",
      "design_lead",
      "pattern_lead",
      "planner",
      "ops_qa",
      "admin_data_tech",
    ],
  });

  const actorEmail = session?.email ?? undefined;
  const [{ approvals, auditEvents }, launchReadiness, performanceInsight, policyArticles] = await Promise.all([
    getApprovalData(actorEmail),
    getLaunchReadinessInsight(actorEmail).catch(() => null),
    getPerformanceInsight(actorEmail).catch(() => null),
    getKnowledgeArticles(actorEmail, undefined, "policy").catch(() => []),
  ]);
  const pendingCount = approvals.filter((approval) => approval.currentStatus === "review").length;
  const approvedCount = approvals.filter((approval) => approval.currentStatus === "approved").length;
  const auditCount = auditEvents.length;

  return (
    <main className="page-shell page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Pusat Persetujuan</span>
          <h1>Semua keputusan penting harus terlihat jelas, rapi, dan mudah ditindaklanjuti.</h1>
          <p>
            Halaman ini merangkum persetujuan aktif, konteks keputusan, dan jejak
            audit agar pemilik dan para lead bisa review tanpa kehilangan konteks.
          </p>
          <p className="hero-note">
            Fokus utamanya adalah siapa yang memutuskan, apa yang diputuskan,
            dan status apa yang sedang menunggu tindakan berikutnya.
          </p>

          <div className="hero-stats">
            <article className="stat-card">
              <span>Menunggu review</span>
              <strong>{pendingCount}</strong>
            </article>
            <article className="stat-card">
              <span>Sudah disetujui</span>
              <strong>{approvedCount}</strong>
            </article>
            <article className="stat-card">
              <span>Jejak audit</span>
              <strong>{auditCount}</strong>
            </article>
          </div>
        </div>

        <div className="hero-side">
          <article className="content-card">
            <span className="pill">Aturan review</span>
            <h3>Setiap keputusan harus bisa ditelusuri kembali.</h3>
            <p>
              Persetujuan disusun agar artefak, aktor, dan status selalu
              terbaca jelas untuk kontrol manajemen harian.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Ringkasan Pendukung Keputusan</h2>
            <p className="section-copy">
              Insight ini membantu owner dan lead memahami tekanan operasional,
              kebijakan terkait, dan risiko rilis sebelum memberi keputusan.
            </p>
          </div>
        </div>
        <div className="card-grid">
          {launchReadiness ? (
            <article className="content-card">
              <span className="pill">Kesiapan rilis</span>
              <h3>{launchReadiness.title}</h3>
              <p>{launchReadiness.summary}</p>
              {launchReadiness.risks.slice(0, 2).map((risk) => (
                <p key={risk}>{risk}</p>
              ))}
            </article>
          ) : null}

          {performanceInsight ? (
            <article className="content-card">
              <span className="pill">Performa</span>
              <h3>{performanceInsight.title}</h3>
              <p>{performanceInsight.summary}</p>
            </article>
          ) : null}

          {policyArticles.slice(0, 1).map((article) => (
            <article className="content-card" key={article.id}>
              <span className="pill">Kebijakan</span>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <p>{article.next_action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Persetujuan Aktif dan Terbaru</h2>
            <p className="section-copy">Aksi penting di workflow harus selalu punya artefak, aktor, dan status yang bisa dibaca cepat.</p>
          </div>
        </div>
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Artefak</th>
                <th>Referensi</th>
                <th>Status</th>
                <th>Diperbarui</th>
              </tr>
            </thead>
            <tbody>
              {approvals.length === 0 ? (
                <tr>
                  <td colSpan={4}>Belum ada data persetujuan yang tersedia.</td>
                </tr>
              ) : (
                approvals.map((approval) => (
                  <tr key={approval.id}>
                    <td>{formatPortalToken(approval.artifactType)}</td>
                    <td>{approval.artifactId}</td>
                    <td>
                      <span className={`status-badge status-${approval.currentStatus}`}>
                        {formatPortalToken(approval.currentStatus)}
                      </span>
                    </td>
                    <td>{formatPortalDateTime(approval.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Aktivitas Audit</h2>
            <p className="section-copy">Jejak keputusan terbaru ditampilkan agar perubahan penting tidak hilang dari pengawasan.</p>
          </div>
        </div>
        <div className="card-grid">
          {auditEvents.length === 0 ? (
            <article className="content-card">
              <span className="pill">Belum ada data</span>
              <h3>Feed audit belum tersedia</h3>
              <p>Belum ada event audit yang berhasil dimuat dari sumber data.</p>
            </article>
          ) : (
            auditEvents.map((event) => (
              <article className="content-card" key={event.id}>
                <span className="pill">{formatPortalToken(event.eventType)}</span>
                <h3>{formatPortalToken(event.referenceType)}</h3>
                <p>{event.referenceId}</p>
                <p>{event.notes ?? "Belum ada catatan tambahan."}</p>
                <small>{event.actorId}</small>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
