import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";

import { getPortalSession, isPortalAuthConfigured } from "../lib/portal-auth";
import { formatRoleList } from "../lib/portal-copy";
import { signOutAction } from "./login/actions";
import { PortalCopilot } from "../components/portal-copilot";
import { PortalShell } from "../components/portal-shell";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Portal Internal Yoora Sarah",
  description: "Pusat kendali internal Yoora Sarah untuk brief, perencanaan, persetujuan, dan rilis.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionPromise = getPortalSession();
  const authConfigured = isPortalAuthConfigured();

  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body>
        <PortalShell
          authConfigured={authConfigured}
          sessionArea={
            authConfigured ? (
              <AuthSession sessionPromise={sessionPromise} />
            ) : (
              <span className="session-banner">Autentikasi belum aktif</span>
            )
          }
        >
          {children}
        </PortalShell>
        <PortalCopilot />
      </body>
    </html>
  );
}

async function AuthSession({
  sessionPromise,
}: {
  sessionPromise: Promise<Awaited<ReturnType<typeof getPortalSession>>>;
}) {
  const session = await sessionPromise;

  if (!session) {
    return (
      <Link className="hero-link session-link" href="/login">
        Masuk
      </Link>
    );
  }

  return (
    <div className="session-card">
      <div>
        <strong>{session.fullName}</strong>
        <small>{formatRoleList(session.roles)}</small>
      </div>

      <form action={signOutAction}>
        <button className="session-button" type="submit">
          Keluar
        </button>
      </form>
    </div>
  );
}
