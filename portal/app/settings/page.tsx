import { getSettingsData } from "../../lib/internal-api";
import { formatPortalToken } from "../../lib/portal-copy";
import { requirePortalSession } from "../../lib/portal-auth";

export default async function SettingsPage() {
  const session = await requirePortalSession({
    roles: ["owner", "admin_data_tech", "ops_qa"],
  });

  const { brands, fabrics, sizeCharts } = await getSettingsData(session?.email ?? undefined);

  return (
    <main className="page-shell page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Master Data</span>
          <h1>Master data harus mudah dibaca agar keputusan admin tetap akurat.</h1>
          <p>
            Halaman ini merangkum domain brand, bahan, dan tabel ukuran dalam
            satu permukaan kerja yang lebih jelas untuk admin dan tim operasi.
          </p>

          <div className="hero-stats">
            <article className="stat-card">
              <span>Brand</span>
              <strong>{brands.length}</strong>
            </article>
            <article className="stat-card">
              <span>Bahan</span>
              <strong>{fabrics.length}</strong>
            </article>
            <article className="stat-card">
              <span>Tabel ukuran</span>
              <strong>{sizeCharts.length}</strong>
            </article>
          </div>
        </div>

        <div className="hero-side">
          <article className="content-card">
            <span className="pill">Tujuan halaman</span>
            <h3>Referensi inti tetap rapi dan mudah dicari.</h3>
            <p>
              Brand, bahan, dan ukuran ditampilkan dalam bahasa yang lebih sederhana
              agar tim tidak kesulitan saat melakukan pengecekan cepat.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Brand</h2>
            <p className="section-copy">Batas antara brand induk dan sub-brand ditampilkan jelas di sini.</p>
          </div>
        </div>
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Nama</th>
                <th>Tipe</th>
                <th>Induk</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={4}>Belum ada data master brand yang tersedia.</td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id}>
                    <td>{brand.code}</td>
                    <td>{brand.name}</td>
                    <td>{formatPortalToken(brand.brandType)}</td>
                    <td>{brands.find((candidate) => candidate.id === brand.parentBrandId)?.code ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section split-grid">
        <article className="content-card">
          <span className="pill">Master bahan</span>
          <h3>Bahan yang disetujui</h3>
          <ul className="foundation-list">
            {fabrics.length === 0 ? (
              <li>Belum ada data bahan yang tersedia.</li>
            ) : (
              fabrics.map((fabric) => (
                <li key={fabric.id}>
                  <div>
                    <strong>{fabric.code}</strong>
                    <div>{fabric.name}</div>
                    <small>{fabric.composition ?? "Komposisi belum dicatat"}</small>
                  </div>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="content-card">
          <span className="pill">Tabel ukuran</span>
          <h3>Baseline ukuran aktif</h3>
          <ul className="foundation-list">
            {sizeCharts.length === 0 ? (
              <li>Belum ada data tabel ukuran yang tersedia.</li>
            ) : (
              sizeCharts.map((chart) => (
                <li key={chart.id}>
                  <div>
                    <strong>{chart.code}</strong>
                    <div>{chart.name}</div>
                    <small>{chart.genderScope ? formatPortalToken(chart.genderScope) : "Cakupan belum dicatat"}</small>
                  </div>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>
    </main>
  );
}
