import Link from "next/link";

import { getProductionPlans } from "../../lib/forecast-api";
import { formatPortalDate } from "../../lib/portal-copy";
import { requirePortalSession } from "../../lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function ProductionPlansPage() {
  const session = await requirePortalSession({
    roles: ["owner", "planner", "ops_qa", "admin_data_tech"],
  });
  const { items: plans } = await getProductionPlans(undefined, session?.email ?? undefined);

  const draftPlans = plans.filter((plan) => plan.status === "draft");
  const reviewPlans = plans.filter((plan) => plan.status === "review");
  const approvedPlans = plans.filter((plan) => plan.status === "approved");
  const releasedPlans = plans.filter((plan) => plan.status === "released");

  return (
    <main className="page-shell page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Rencana Produksi</span>
          <h1>Rencana produksi harus bergerak rapi dari rekomendasi sampai rilis.</h1>
          <p>
            Halaman ini menempatkan rencana produksi sebagai jalur kerja yang
            mudah dipahami dari output forecast menuju review, persetujuan, dan rilis.
          </p>

          <div className="hero-stats">
            <article className="stat-card">
              <span>Draf</span>
              <strong>{draftPlans.length}</strong>
            </article>
            <article className="stat-card">
              <span>Dalam review</span>
              <strong>{reviewPlans.length}</strong>
            </article>
            <article className="stat-card">
              <span>Disetujui</span>
              <strong>{approvedPlans.length}</strong>
            </article>
            <article className="stat-card">
              <span>Dirilis</span>
              <strong>{releasedPlans.length}</strong>
            </article>
          </div>
        </div>

        <div className="hero-side">
          <article className="content-card">
            <span className="pill">Cakupan pengguna</span>
            <h3>Planner, ops QA, pemilik, dan admin.</h3>
            <p>
              Pengelolaan rencana tetap dipisahkan dari website pembeli agar
              kontrol keputusan dan disiplin persetujuan tidak bercampur dengan UI commerce.
            </p>
          </article>
        </div>
      </section>

      {draftPlans.length > 0 ? (
        <PlanTable
          title="Rencana Draf"
          copy="Rencana draf masih perlu dilengkapi sebelum masuk tahap review."
          ctaLabel="Edit"
          plans={draftPlans}
        />
      ) : null}

      {reviewPlans.length > 0 ? (
        <PlanTable
          title="Dalam Review"
          copy="Rencana yang sedang direview harus tetap terlihat sebagai antrean keputusan aktif."
          ctaLabel="Tinjau"
          plans={reviewPlans}
        />
      ) : null}

      {approvedPlans.length > 0 ? (
        <PlanTable
          title="Disetujui"
          copy="Rencana yang disetujui siap menjadi dasar koordinasi eksekusi berikutnya."
          ctaLabel="Lihat"
          plans={approvedPlans}
        />
      ) : null}

      {releasedPlans.length > 0 ? (
        <PlanTable
          title="Dirilis"
          copy="Rencana yang dirilis merupakan komitmen yang sudah keluar dari rantai review."
          ctaLabel="Lihat"
          plans={releasedPlans}
        />
      ) : null}

      {plans.length === 0 ? (
        <section className="section">
          <div className="empty-state">
            <p>Belum ada rencana produksi. Buat rencana dari forecast yang sudah selesai.</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function PlanTable({
  title,
  copy,
  ctaLabel,
  plans,
}: {
  title: string;
  copy: string;
  ctaLabel: string;
  plans: Array<{
    production_plan_id: number;
    forecast_run_id: number;
    requested_by_email?: string | null;
    created_at: string;
    updated_at: string;
  }>;
}) {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-copy">{copy}</p>
        </div>
      </div>
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Rencana</th>
              <th>Forecast</th>
              <th>Dibuat oleh</th>
              <th>Diperbarui</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.production_plan_id}>
                <td>#{plan.production_plan_id}</td>
                <td>Forecast #{plan.forecast_run_id}</td>
                <td>{plan.requested_by_email || "-"}</td>
                <td>{formatPortalDate(plan.updated_at || plan.created_at)}</td>
                <td>
                  <Link
                    href={`/production-plans/${plan.production_plan_id}`}
                    className="btn btn-secondary btn-small"
                  >
                    {ctaLabel}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
