import Link from "next/link";

import {
  getBriefs,
  type Brief,
} from "../../lib/briefs-api";
import {
  getDesignJobs,
  type DesignJob,
} from "../../lib/design-jobs-api";
import {
  getPatternJobs,
  type PatternJob,
} from "../../lib/pattern-jobs-api";
import {
  getForecastRuns,
  getProductionPlans,
  type ForecastRun,
  type ProductionPlan,
} from "../../lib/forecast-api";
import {
  getKnowledgeArticles,
  getLaunchReadinessInsight,
  getMerchandisingInsight,
  getPerformanceInsight,
} from "../../lib/internal-ai-api";
import {
  formatRoleList,
} from "../../lib/portal-copy";
import { requirePortalSession } from "../../lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requirePortalSession();
  const actorEmail = session?.email ?? undefined;
  const roles = new Set(session?.roles ?? []);
  const canAccessDesign = ["owner", "design_lead", "pattern_lead", "admin_data_tech"].some((role) =>
    roles.has(role),
  );
  const canAccessForecast = ["owner", "planner", "admin_data_tech"].some((role) =>
    roles.has(role),
  );
  const canAccessProduction = ["owner", "planner", "ops_qa", "admin_data_tech"].some((role) =>
    roles.has(role),
  );

  const [
    briefsData,
    designJobs,
    patternJobs,
    forecastRuns,
    productionPlans,
    launchReadiness,
    performanceInsight,
    merchandisingInsight,
    knowledgeArticles,
  ] = await Promise.all([
    canAccessDesign ? getBriefs(actorEmail).catch(() => ({ briefs: [] })) : Promise.resolve({ briefs: [] }),
    canAccessDesign ? getDesignJobs(undefined, actorEmail).catch(() => ({ items: [] })) : Promise.resolve({ items: [] }),
    canAccessDesign ? getPatternJobs(undefined, actorEmail).catch(() => ({ items: [] })) : Promise.resolve({ items: [] }),
    canAccessForecast ? getForecastRuns(undefined, actorEmail).catch(() => ({ items: [] })) : Promise.resolve({ items: [] }),
    canAccessProduction ? getProductionPlans(undefined, actorEmail).catch(() => ({ items: [] })) : Promise.resolve({ items: [] }),
    getLaunchReadinessInsight(actorEmail).catch(() => null),
    getPerformanceInsight(actorEmail).catch(() => null),
    getMerchandisingInsight(actorEmail).catch(() => null),
    getKnowledgeArticles(actorEmail, undefined, "glossary").catch(() => []),
  ]);

  const activeBriefs = (briefsData.briefs || []).filter((brief: Brief) => brief.status === "active").length;
  const draftBriefs = (briefsData.briefs || []).filter((brief: Brief) => brief.status === "draft").length;
  const designInProgress = (designJobs.items || []).filter((job: DesignJob) =>
    job.status === "running" || job.status === "queued",
  ).length;
  const patternsInProgress = (patternJobs.items || []).filter((job: PatternJob) =>
    job.status === "running" || job.status === "queued",
  ).length;
  const forecastsInProgress = (forecastRuns.items || []).filter((run: ForecastRun) =>
    run.status === "running" || run.status === "queued",
  ).length;
  const plansInProgress = (productionPlans.items || []).filter((plan: ProductionPlan) =>
    plan.status === "review" || plan.status === "approved",
  ).length;
  const pendingApprovals = (productionPlans.items || []).filter((plan: ProductionPlan) => plan.status === "review")
    .length;

  const completedDesigns = (designJobs.items || []).filter((job: DesignJob) => job.status === "completed").length;
  const completedPatterns = (patternJobs.items || []).filter((job: PatternJob) =>
    job.status === "completed" || job.status === "review",
  ).length;
  const completedForecasts = (forecastRuns.items || []).filter((run: ForecastRun) => run.status === "completed").length;
  const releasedPlans = (productionPlans.items || []).filter((plan: ProductionPlan) => plan.status === "released").length;

  const signalItems = [
    forecastsInProgress > 0
      ? {
          title: "Forecast masih berjalan",
          copy: `${forecastsInProgress} forecast masih diproses dan perlu tetap terlihat agar follow-up planner tidak terlewat.`,
        }
      : null,
    patternsInProgress > 0
      ? {
          title: "Antrian pola masih aktif",
          copy: `${patternsInProgress} pekerjaan pola masih perlu dipantau sebelum review berikutnya bisa bergerak.`,
        }
      : null,
    pendingApprovals > 0
      ? {
          title: "Keputusan pimpinan dibutuhkan",
          copy: `${pendingApprovals} rencana produksi masih menunggu persetujuan dan tidak boleh berubah menjadi antrean tersembunyi.`,
        }
      : null,
    pendingApprovals === 0 && forecastsInProgress === 0 && patternsInProgress === 0
      ? {
          title: "Tidak ada tekanan antrean mendesak",
          copy: "Antrean kerja sedang tenang. Gunakan momentum ini untuk rapikan backlog, cek kualitas, dan siapkan rilis.",
        }
      : null,
  ].filter(Boolean) as Array<{ title: string; copy: string }>;

  const quickLinks = [
    {
      title: "Intake brief",
      copy: "Susun atau rapikan brief sebelum masuk generasi desain.",
      href: "/briefs",
    },
    {
      title: "Review desain",
      copy: "Pilih shortlist dan setujui opsi desain dengan jejak keputusan yang lebih jelas.",
      href: "/design-gallery",
    },
    {
      title: "Forecast & planning",
      copy: "Jalankan forecast lalu teruskan hasilnya ke rencana produksi.",
      href: "/forecast",
    },
  ];

  const workflowLanes = [
    {
      step: "01",
      title: "Brief aktif",
      value: activeBriefs,
      copy: "Intake yang sedang bergerak dan menentukan beban kerja tahap berikutnya.",
      href: "/briefs",
    },
    {
      step: "02",
      title: "Desain berjalan",
      value: designInProgress,
      copy: "Pekerjaan visual yang masih perlu shortlist atau keputusan lead.",
      href: "/design-gallery",
    },
    {
      step: "03",
      title: "Pola berjalan",
      value: patternsInProgress,
      copy: "Antrean pola yang harus tetap terlihat sebelum produksi disiapkan.",
      href: "/patterns",
    },
    {
      step: "04",
      title: "Forecast berjalan",
      value: forecastsInProgress,
      copy: "Planner masih membaca sinyal demand sebelum kapasitas dikunci.",
      href: "/forecast",
    },
    {
      step: "05",
      title: "Keputusan produksi",
      value: plansInProgress,
      copy: "Rencana yang masih ditahan di review atau persetujuan manajemen.",
      href: "/production-plans",
    },
  ];

  return (
    <main className="page-shell page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Dasbor Pimpinan</span>
          <h1>Operasional terasa premium saat antrean kerja mudah dibaca.</h1>
          <p>
            Dasbor ini dirapikan agar pemilik, lead, planner, dan tim operasi
            bisa langsung membaca kondisi hari ini tanpa harus menafsirkan
            istilah teknis atau membuka banyak halaman sekaligus.
          </p>
          <p className="hero-note">
            Fokus utamanya adalah antrean aktif, tekanan persetujuan, dan kapasitas
            eksekusi yang benar-benar butuh perhatian manusia.
          </p>

          <div className="hero-links">
            <Link className="hero-link" href="/approvals">
              Tinjau persetujuan
            </Link>
            <Link className="btn btn-secondary" href="/production-plans">
              Buka rencana produksi
            </Link>
          </div>

          <div className="hero-stats">
            <article className="stat-card">
              <span>Aktor aktif</span>
              <strong className="stat-value-compact">{session?.fullName ?? "Mode terbuka"}</strong>
            </article>
            <article className="stat-card">
              <span>Cakupan peran</span>
              <strong className="stat-value-compact">{formatRoleList(session?.roles)}</strong>
            </article>
            <article className="stat-card">
              <span>Brief aktif</span>
              <strong>{activeBriefs}</strong>
            </article>
            <article className="stat-card">
              <span>Menunggu persetujuan</span>
              <strong>{pendingApprovals}</strong>
            </article>
          </div>
        </div>

        <div className="hero-side">
          <article className="content-card">
            <span className="pill">Tekanan antrean</span>
            <h3>Prioritas keputusan saat ini</h3>
            <p>
              Titik perhatian utama manajemen hari ini datang dari persetujuan,
              progres forecast, dan review rencana produksi.
            </p>
            <div className="card-meta">
              <span className="pill">{forecastsInProgress} forecast aktif</span>
              <span className="pill">{patternsInProgress} pola aktif</span>
              <span className="pill">{plansInProgress} rencana berjalan</span>
            </div>
          </article>

          <article className="content-card">
            <span className="pill">Kesehatan brief</span>
            <h3>Intake terlihat jelas, tidak tenggelam di bawah data lain.</h3>
            <p>
              {draftBriefs} brief draf dan {activeBriefs} brief aktif saat ini
              menjadi input utama untuk desain dan planning.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Peta Workflow Hari Ini</h2>
            <p className="section-copy">
              Lapisan ini dibuat seperti flow kerja agar pimpinan tidak perlu
              menebak hubungan antar-antrean di setiap modul.
            </p>
          </div>
        </div>

        <div className="workflow-map-grid">
          {workflowLanes.map((lane) => (
            <article className="workflow-stage-card" key={lane.href}>
              <span className="workflow-stage-step">{lane.step}</span>
              <h3>{lane.title}</h3>
              <strong className="workflow-stage-value">{lane.value}</strong>
              <p>{lane.copy}</p>
              <Link className="btn btn-secondary btn-small" href={lane.href}>
                Buka antrean
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Lapisan AI Internal</h2>
            <p className="section-copy">
              Insight AI penting ditampilkan langsung di command center agar tim
              tidak perlu menebak apa yang harus diperhatikan berikutnya.
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
              {performanceInsight.next_actions.slice(0, 2).map((item) => (
                <p key={item}>{item}</p>
              ))}
            </article>
          ) : null}

          {merchandisingInsight ? (
            <article className="content-card">
              <span className="pill">Merchandising</span>
              <h3>{merchandisingInsight.title}</h3>
              <p>{merchandisingInsight.summary}</p>
              {merchandisingInsight.next_actions.slice(0, 2).map((item) => (
                <p key={item}>{item}</p>
              ))}
            </article>
          ) : null}

          {knowledgeArticles.slice(0, 1).map((article) => (
            <article className="content-card" key={article.id}>
              <span className="pill">Glosarium</span>
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
            <h2 className="section-title">Denyut Workflow</h2>
            <p className="section-copy">
              Ringkasan ini dibuat agar pimpinan bisa cepat paham keadaan tanpa
              kehilangan konteks operasional di tiap modul.
            </p>
          </div>
        </div>

        <div className="metrics-grid">
          <article className="metric-card">
            <span className="metric-label">Brief aktif</span>
            <span className="metric-value">{activeBriefs}</span>
            <p className="metric-foot">Intake brief yang sedang bergerak menuju generasi desain.</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Desain diproses</span>
            <span className="metric-value">{designInProgress}</span>
            <p className="metric-foot">Pekerjaan desain yang masih berjalan sebelum shortlist dan handoff pola.</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Pola diproses</span>
            <span className="metric-value">{patternsInProgress}</span>
            <p className="metric-foot">Antrean pola yang harus tetap terlihat bagi lead pola dan tim operasi.</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Forecast diproses</span>
            <span className="metric-value">{forecastsInProgress}</span>
            <p className="metric-foot">Antrean planner yang aktif dan berpengaruh ke kesiapan produksi.</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Rencana direview</span>
            <span className="metric-value">{plansInProgress}</span>
            <p className="metric-foot">Keputusan operasional yang masih menunggu review atau persetujuan.</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Menunggu persetujuan</span>
            <span className="metric-value metric-value-attention">{pendingApprovals}</span>
            <p className="metric-foot">Item di sini harus diperlakukan sebagai pekerjaan manajemen yang terlihat jelas.</p>
          </article>
        </div>
      </section>

      <section className="split-grid">
        <article className="content-card">
          <span className="pill">Sinyal aktif</span>
          <h3>Antrean yang butuh perhatian manusia</h3>
          <ul className="signal-list">
            {signalItems.map((signal) => (
              <li className="signal-item" key={signal.title}>
                <div className="signal-meta">
                  <strong>{signal.title}</strong>
                  <p>{signal.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="content-card">
          <span className="pill">Aksi cepat</span>
          <h3>Masuk langsung ke langkah operasional berikutnya.</h3>
          <ul className="workflow-list">
            {quickLinks.map((link) => (
              <li className="workflow-item" key={link.href}>
                <div className="workflow-meta">
                  <strong>{link.title}</strong>
                  <p>{link.copy}</p>
                  <Link className="btn btn-secondary btn-small" href={link.href}>
                    Buka
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Output Selesai</h2>
            <p className="section-copy">
              Output selesai dipisahkan dari tekanan antrean agar pimpinan bisa
              membaca kapasitas dan kesehatan delivery sekaligus.
            </p>
          </div>
        </div>

        <div className="metrics-grid">
          <article className="metric-card">
            <span className="metric-label">Desain selesai</span>
            <span className="metric-value metric-value-positive">{completedDesigns}</span>
            <p className="metric-foot">Hasil desain yang sudah siap diteruskan ke pekerjaan berikutnya.</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Pola selesai</span>
            <span className="metric-value metric-value-positive">{completedPatterns}</span>
            <p className="metric-foot">Pekerjaan pola yang sudah melalui generasi dan review.</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Forecast selesai</span>
            <span className="metric-value metric-value-positive">{completedForecasts}</span>
            <p className="metric-foot">Run forecast yang sudah selesai dan siap dipakai membuat rencana.</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Rencana dirilis</span>
            <span className="metric-value metric-value-positive">{releasedPlans}</span>
            <p className="metric-foot">Rencana yang sudah dirilis dan menjadi komitmen produksi berikutnya.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
