import Link from "next/link";

import { BriefsClient } from "../components/briefs-client";
import { getBriefs, getBrands } from "../../lib/briefs-api";
import { getBriefCopilotNote, getContentDraft } from "../../lib/internal-ai-api";
import {
  formatPortalDate,
  formatPortalToken,
} from "../../lib/portal-copy";
import { requirePortalSession } from "../../lib/portal-auth";

export default async function BriefsPage() {
  const session = await requirePortalSession({
    roles: ["owner", "design_lead", "pattern_lead", "admin_data_tech"],
  });
  const actorEmail = session?.email ?? undefined;
  const [{ briefs }, { brands }, briefCopilot, contentDraft] = await Promise.all([
    getBriefs(actorEmail),
    getBrands(actorEmail),
    getBriefCopilotNote(undefined, actorEmail).catch(() => null),
    getContentDraft(actorEmail).catch(() => null),
  ]);

  const draftBriefs = briefs.filter((brief) => brief.status === "draft").length;
  const activeBriefs = briefs.filter((brief) => brief.status === "active").length;
  const archivedBriefs = briefs.filter((brief) => brief.status !== "draft" && brief.status !== "active").length;

  return (
    <main className="page-shell page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Intake Brief</span>
          <h1>Brief yang baik harus terasa rapi, jelas, dan siap diteruskan ke tim berikutnya.</h1>
          <p>
            Halaman brief menjadi pintu masuk utama untuk menyusun konteks merek,
            target pelanggan, dan arah kampanye sebelum desain mulai digerakkan.
          </p>
          <p className="hero-note">
            Tujuannya sederhana: siapa pun yang membaca brief harus langsung paham
            apa yang sedang dibuat dan kenapa itu penting.
          </p>

          <div className="hero-links">
            <Link className="hero-link" href="#briefs-list">
              Lihat daftar brief
            </Link>
            <Link className="btn btn-secondary" href="/design-gallery">
              Buka review desain
            </Link>
          </div>

          <div className="hero-stats">
            <article className="stat-card">
              <span>Total brief</span>
              <strong>{briefs.length}</strong>
            </article>
            <article className="stat-card">
              <span>Draf</span>
              <strong>{draftBriefs}</strong>
            </article>
            <article className="stat-card">
              <span>Aktif</span>
              <strong>{activeBriefs}</strong>
            </article>
            <article className="stat-card">
              <span>Arsip atau lainnya</span>
              <strong>{archivedBriefs}</strong>
            </article>
          </div>
        </div>

        <div className="hero-side">
          <article className="content-card">
            <span className="pill">Cakupan pengguna</span>
            <h3>Pemilik, lead desain, lead pola, dan admin data.</h3>
            <p>
              Intake brief dijaga sebagai ruang kerja berbasis peran agar desain
              dan pola tidak berjalan tanpa konteks yang cukup.
            </p>
          </article>

          <article className="content-card">
            <span className="pill">Brand tersedia</span>
            <h3>{brands.length} master brand siap dipakai</h3>
            <p>
              Pilihan brand dibatasi ke master data agar penamaan, kepemilikan,
              dan konteks kampanye tetap konsisten dengan data operasional.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Copilot Brief</h2>
            <p className="section-copy">
              Copilot membantu menajamkan brief dan memberi bahan awal konten tanpa melewati review manusia.
            </p>
          </div>
        </div>

        <div className="card-grid">
          {briefCopilot ? (
            <article className="content-card">
              <span className="pill">Arah konsep</span>
              <h3>{briefCopilot.title}</h3>
              <p>{briefCopilot.summary}</p>
              <p>{briefCopilot.concept_direction}</p>
              <p>{briefCopilot.next_action}</p>
            </article>
          ) : null}

          {contentDraft ? (
            <article className="content-card">
              <span className="pill">Draf konten</span>
              <h3>{contentDraft.title}</h3>
              <p>{contentDraft.hook}</p>
              <p>{contentDraft.caption}</p>
              <p>{contentDraft.call_to_action}</p>
            </article>
          ) : null}
        </div>
      </section>

      <section className="section" id="briefs-list">
        <div className="section-header">
          <div>
            <h2 className="section-title">Daftar Brief</h2>
            <p className="section-copy">
              Setiap brief harus cukup jelas untuk generasi desain, persiapan pola,
              dan review pimpinan berikutnya.
            </p>
          </div>
          <button className="btn btn-primary" id="new-brief-btn" type="button">
            Brief baru
          </button>
        </div>

        {briefs.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada brief. Buat brief pertama untuk memulai workflow desain.</p>
          </div>
        ) : (
          <div className="card-grid">
            {briefs.map((brief) => (
              <article key={brief.id} className="content-card">
                <div className="card-topline">
                  <span className={`status-badge status-${brief.status}`}>{formatPortalToken(brief.status)}</span>
                  <span className="pill">{brief.brandName}</span>
                </div>
                <h3>{brief.title}</h3>
                <p>
                  {brief.campaignName
                    ? `Konteks kampanye: ${brief.campaignName}.`
                    : "Konteks kampanye untuk brief ini belum dicatat."}
                </p>
                <div className="card-meta">
                  <span className="pill">{formatPortalToken(brief.category)}</span>
                  <span className="pill">{formatPortalToken(brief.targetSegment)}</span>
                </div>
                <div className="card-footer">
                  <span className="card-caption">
                    Dibuat {formatPortalDate(brief.createdAt)}
                  </span>
                  <Link className="btn btn-secondary btn-small" href={`/briefs/${brief.id}`}>
                    Lihat detail
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Direktori Brand</h2>
            <p className="section-copy">
              Intake tetap dibatasi ke master brand resmi agar category planning
              dan persetujuan berikutnya tidak kehilangan referensi.
            </p>
          </div>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Nama</th>
                <th>Tipe</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id}>
                  <td>{brand.code}</td>
                  <td>{brand.name}</td>
                  <td>
                    <span className="pill">{formatPortalToken(brand.brandType)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <dialog id="new-brief-modal" className="modal">
        <form className="modal-content">
          <header>
            <h2>Buat Brief Baru</h2>
            <button type="button" className="close-btn" aria-label="Tutup">
              x
            </button>
          </header>
          <div className="form-body">
            <div className="form-group">
              <label htmlFor="brief-brand">Brand</label>
              <select id="brief-brand" name="brandId" required>
                <option value="">Pilih brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="brief-title">Judul brief</label>
              <input
                type="text"
                id="brief-title"
                name="title"
                required
                placeholder="Contoh: Koleksi Ramadan 2026"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brief-category">Kategori</label>
                <select id="brief-category" name="category" required>
                  <option value="">Pilih kategori</option>
                  <option value="dress">Gaun</option>
                  <option value="tops">Atasan</option>
                  <option value="bottoms">Bawahan</option>
                  <option value="outerwear">Luaran</option>
                  <option value="accessories">Aksesori</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="brief-segment">Target segmen</label>
                <select id="brief-segment" name="targetSegment" required>
                  <option value="">Pilih segmen</option>
                  <option value="young_professional">Profesional muda</option>
                  <option value="housewife">Ibu rumah tangga</option>
                  <option value="student">Pelajar</option>
                  <option value="executive">Eksekutif</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="brief-campaign">Nama kampanye (opsional)</label>
              <input
                type="text"
                id="brief-campaign"
                name="campaignName"
                placeholder="Contoh: Ramadan 2026"
              />
            </div>
            <div className="form-group">
              <label htmlFor="brief-notes">Catatan</label>
              <textarea
                id="brief-notes"
                name="notes"
                rows={4}
                placeholder="Tambahkan kebutuhan khusus, batasan, atau inspirasi penting..."
              />
            </div>
            <p id="brief-form-message" className="message" aria-live="polite" hidden />
          </div>
          <footer>
            <button type="button" className="btn btn-secondary" id="cancel-brief">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan brief
            </button>
          </footer>
        </form>
      </dialog>

      <BriefsClient />
    </main>
  );
}
