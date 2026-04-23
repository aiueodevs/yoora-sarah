import { getForecastRun, getForecastRecommendation, getSizeMix, getColorMix, getAllocations } from "../../../lib/forecast-api";
import { notFound } from "next/navigation";
import { formatPortalNumber, formatPortalToken } from "../../../lib/portal-copy";
import { requirePortalSession } from "../../../lib/portal-auth";
import { createProductionPlanForRunAction } from "./actions";

interface Props {
  params: Promise<{ runId: string }>;
}

export const dynamic = "force-dynamic";

export default async function ForecastDetailPage({ params }: Props) {
  const [{ runId }, session] = await Promise.all([
    params,
    requirePortalSession({
      roles: ["owner", "planner", "admin_data_tech"],
    }),
  ]);
  const runIdNum = parseInt(runId, 10);

  if (isNaN(runIdNum)) {
    notFound();
  }

  const actorEmail = session?.email ?? undefined;
  const run = await getForecastRun(runIdNum, actorEmail);
  if (!run || run.status !== "completed") {
    notFound();
  }

  const recommendation = await getForecastRecommendation(runIdNum, actorEmail).catch(() => null);
  const { items: sizeMix } = recommendation ? await getSizeMix(recommendation.forecast_recommendation_id, actorEmail) : { items: [] };
  const { items: colorMix } = recommendation ? await getColorMix(recommendation.forecast_recommendation_id, actorEmail) : { items: [] };
  const { items: allocations } = recommendation ? await getAllocations(recommendation.forecast_recommendation_id, actorEmail) : { items: [] };

  return (
    <main className="page-shell page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Detail Forecast</span>
          <h1>Rekomendasi forecast #{run.forecast_run_id}</h1>
          <p>
            Tinjau rekomendasi AI secara terstruktur sebelum Anda melanjutkan ke
            rencana produksi.
          </p>

          <div className="hero-stats">
            <article className="stat-card">
              <span>Status</span>
              <strong className="stat-value-compact">{formatPortalToken(run.status)}</strong>
            </article>
            {run.confidence_score ? (
              <article className="stat-card">
                <span>Keyakinan</span>
                <strong>{run.confidence_score}%</strong>
              </article>
            ) : null}
            {recommendation?.projected_total_units ? (
              <article className="stat-card">
                <span>Total proyeksi</span>
                <strong>{formatPortalNumber(recommendation.projected_total_units)}</strong>
              </article>
            ) : null}
          </div>
        </div>
      </section>

      {recommendation && (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Ringkasan Eksekutif</h2>
              <p className="section-copy">Bacaan cepat untuk planner dan pimpinan sebelum membuka rincian mix dan alokasi.</p>
            </div>
          </div>
          <div className="card">
            <p className="summary-text">{recommendation.recommendation_summary || "Belum ada ringkasan yang tersedia."}</p>
            {recommendation.projected_total_units && (
              <p className="projected-units">
                Total proyeksi: <strong>{formatPortalNumber(recommendation.projected_total_units)} unit</strong>
              </p>
            )}
            {run.confidence_score ? (
              <p className="projected-units">
                Tingkat keyakinan: <strong>{run.confidence_score}%</strong>
              </p>
            ) : null}
            {recommendation.rationale ? <p className="summary-text">{recommendation.rationale}</p> : null}
            <p className="summary-text">
              Output ini adalah rekomendasi untuk ditinjau, bukan instruksi produksi otomatis.
            </p>
          </div>
        </section>
      )}

      {sizeMix.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Rekomendasi Ukuran</h2>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ukuran</th>
                  <th>Unit</th>
                  <th>Porsi</th>
                </tr>
              </thead>
              <tbody>
                {sizeMix.map((item) => {
                  const total = sizeMix.reduce((sum, s) => sum + s.recommended_units, 0);
                  const share = total > 0 ? ((item.recommended_units / total) * 100).toFixed(1) : "0";
                  return (
                    <tr key={item.size_code}>
                      <td>{item.size_code}</td>
                      <td>{formatPortalNumber(item.recommended_units)}</td>
                      <td>{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {colorMix.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Rekomendasi Warna</h2>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Warna</th>
                  <th>Unit</th>
                  <th>Porsi</th>
                </tr>
              </thead>
              <tbody>
                {colorMix.map((item) => {
                  const total = colorMix.reduce((sum, c) => sum + c.recommended_units, 0);
                  const share = total > 0 ? ((item.recommended_units / total) * 100).toFixed(1) : "0";
                  return (
                    <tr key={item.color_code}>
                      <td>{item.color_code}</td>
                      <td>{formatPortalNumber(item.recommended_units)}</td>
                      <td>{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {allocations.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Alokasi Channel</h2>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Unit</th>
                  <th>Porsi</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((item) => {
                  const total = allocations.reduce((sum, a) => sum + a.recommended_units, 0);
                  const share = total > 0 ? ((item.recommended_units / total) * 100).toFixed(1) : "0";
                  return (
                    <tr key={item.channel_code}>
                      <td>{item.channel_code}</td>
                      <td>{formatPortalNumber(item.recommended_units)}</td>
                      <td>{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Tindakan Lanjutan</h2>
        </div>
        <div className="card">
          <form action={createProductionPlanForRunAction.bind(null, runIdNum)}>
            <button className="btn btn-primary" type="submit">
              Buat rencana produksi
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
