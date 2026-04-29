import { redirect } from "next/navigation";

import { getPortalSession, isPortalAuthConfigured } from "../../lib/portal-auth";
import { listPortalUsers } from "../../lib/portal-users";
import { signInAction } from "./actions";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type LoginSearchParams = Record<string, string | string[] | undefined>;

const errorMessages: Record<string, string> = {
  missing_configuration: "Portal auth belum dikonfigurasi. Isi env auth Sprint 0 terlebih dahulu.",
  invalid_credentials: "Password bootstrap tidak sesuai.",
  inactive_user: "User ada tetapi tidak aktif.",
  unknown_user: "Email belum ada di user registry internal.",
};

const featureItems = [
  "Pengelolaan brief dan review desain",
  "Visibilitas alur pola dan kesiapan output",
  "Kontrol forecast dan rencana produksi",
  "Jejak persetujuan dan rilis yang jelas",
];

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [session, users, params] = await Promise.all([
    getPortalSession(),
    listPortalUsers(),
    searchParams ?? Promise.resolve<LoginSearchParams>({}),
  ]);

  if (session) {
    redirect("/");
  }

  const nextPath = readParam(params.next);
  const email = readParam(params.email);
  const errorCode = readParam(params.error);
  const authConfigured = isPortalAuthConfigured();

  return (
    <main className="auth-shell">
      <div className="auth-panel">
        <section className="auth-copy">
          <span className="eyebrow">Yoora Sarah</span>
          <h1>Portal internal yang rapi, elegan, dan mudah dipahami.</h1>
          <p>
            Masuk untuk mengelola workflow dari brief hingga rilis dengan bahasa
            yang lebih sederhana, navigasi yang jelas, dan tampilan yang lebih
            profesional untuk tim internal.
          </p>

          <ul className="feature-list">
            {featureItems.map((item) => (
              <li className="feature-item" key={item}>
                <div className="summary-meta">
                  <strong>{item}</strong>
                  <p>Alur kerja internal yang tetap terjaga oleh peran, aktor, dan kontrol akses.</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="auth-form">
          <div className="summary-meta auth-form-intro">
            <strong>Selamat datang kembali</strong>
            <p>Gunakan akun internal Anda untuk membuka pusat kendali portal.</p>
          </div>

          <form action={signInAction}>
            <input type="hidden" name="next" value={nextPath} />

            <label className="field">
              <span>Email</span>
              <input
                defaultValue={email}
                name="email"
                type="email"
                placeholder="owner@yoora.local"
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                name="password"
                type="password"
                placeholder="Masukkan password Anda"
                required
              />
            </label>

            {errorCode ? (
              <p className="form-message form-message-error">
                {errorMessages[errorCode] ?? "Gagal masuk ke portal internal."}
              </p>
            ) : null}

            {!authConfigured ? (
              <p className="form-message">
                Konfigurasi auth belum lengkap. Hubungi administrator.
              </p>
            ) : null}

            <button className="auth-submit auth-submit-full" type="submit">
              Masuk ke portal
            </button>
          </form>

          <div className="auth-reference">
            <p className="text-muted auth-reference-title">
              Akun yang tersedia:
            </p>
            <div className="user-grid">
              {users.map((user) => (
                <div key={user.id} className="user-chip">
                  <span className="user-role">{user.roles[0] || "user"}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
