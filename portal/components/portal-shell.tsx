"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  CheckCheck,
  FileText,
  Home,
  ImageIcon,
  LayoutDashboard,
  Package,
  Scissors,
  Settings2,
  TrendingUp,
} from "lucide-react";

type NavIcon = typeof Home;

type NavItem = {
  href: string;
  label: string;
  caption: string;
  icon: NavIcon;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

type WorkflowStep = {
  title: string;
  copy: string;
  href: string;
};

const navGroups: NavGroup[] = [
  {
    title: "Ringkasan",
    items: [
      {
        href: "/",
        label: "Beranda",
        caption: "Peta modul dan orientasi kerja tim.",
        icon: Home,
      },
      {
        href: "/dashboard",
        label: "Dasbor",
        caption: "Antrean aktif, sinyal risiko, dan keputusan hari ini.",
        icon: LayoutDashboard,
      },
      {
        href: "/approvals",
        label: "Persetujuan",
        caption: "Semua keputusan yang masih menunggu review.",
        icon: CheckCheck,
      },
    ],
  },
  {
    title: "Workflow Harian",
    items: [
      {
        href: "/briefs",
        label: "Brief",
        caption: "Brief masuk, perapihan konteks, dan arah kerja.",
        icon: FileText,
      },
      {
        href: "/design-gallery",
        label: "Desain",
        caption: "Review hasil visual sebelum diteruskan.",
        icon: ImageIcon,
      },
      {
        href: "/patterns",
        label: "Pola",
        caption: "Pekerjaan pola dan kesiapan handoff produksi.",
        icon: Scissors,
      },
      {
        href: "/forecast",
        label: "Forecast",
        caption: "Perencanaan demand dan keputusan kapasitas.",
        icon: TrendingUp,
      },
      {
        href: "/production-plans",
        label: "Produksi",
        caption: "Rencana yang bergerak dari review sampai rilis.",
        icon: Package,
      },
    ],
  },
  {
    title: "Administrasi",
    items: [
      {
        href: "/settings",
        label: "Master Data",
        caption: "Pengaturan dasar yang menjaga workflow tetap rapi.",
        icon: Settings2,
      },
    ],
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    title: "Brief masuk",
    copy: "Brief dirapikan agar tim paham tujuan, target, dan batasan sejak awal.",
    href: "/briefs",
  },
  {
    title: "Review desain",
    copy: "Output visual disaring supaya shortlist lebih cepat dan keputusan tidak kabur.",
    href: "/design-gallery",
  },
  {
    title: "Pola siap kerja",
    copy: "Lead pola melihat prioritas, progres, dan kesiapan handoff berikutnya.",
    href: "/patterns",
  },
  {
    title: "Forecast dibaca",
    copy: "Planner membaca sinyal demand sebelum kapasitas dikunci ke rencana.",
    href: "/forecast",
  },
  {
    title: "Produksi dirilis",
    copy: "Rencana bergerak ke keputusan final dengan jejak persetujuan yang jelas.",
    href: "/production-plans",
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalShell({
  children,
  sessionArea,
  authConfigured,
}: {
  children: ReactNode;
  sessionArea: ReactNode;
  authConfigured: boolean;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/login");
  const flatItems = navGroups.flatMap((group) => group.items);
  const currentItem = flatItems.find((item) => isActivePath(pathname, item.href));
  const currentStepIndex = workflowSteps.findIndex((step) => isActivePath(pathname, step.href));

  if (isAuthPage) {
    return (
      <div className="portal-auth-layout">
        <header className="portal-auth-bar">
          <Link className="site-brand" href="/">
            <span className="site-brand-mark" aria-hidden="true" />
            <span className="site-brand-copy">
              <strong>Yoora Sarah</strong>
              <small>Pusat kendali internal</small>
            </span>
          </Link>

          <div className="portal-auth-bar-copy">
            <span className="pill">
              {authConfigured ? "Akses internal aktif" : "Autentikasi belum aktif"}
            </span>
            <p>
              Portal ini disusun untuk memandu workflow internal dengan bahasa
              yang lebih jelas dan permukaan kerja yang lebih teratur.
            </p>
          </div>
        </header>

        <div className="portal-auth-stage">{children}</div>
      </div>
    );
  }

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar" aria-label="Sidebar portal">
        <div className="portal-sidebar-inner">
          <Link className="site-brand" href="/">
            <span className="site-brand-mark" aria-hidden="true" />
            <span className="site-brand-copy">
              <strong>Yoora Sarah</strong>
              <small>Pusat kendali internal</small>
            </span>
          </Link>

          <section className="portal-sidebar-intro">
            <span className="eyebrow">Workflow Internal</span>
            <h2>Semua langkah kerja penting sekarang terkumpul di satu sisi.</h2>
            <p>
              Menu dipindah ke kiri agar pengguna tidak perlu membaca header yang
              padat. Fokus utama pindah ke alur, status, dan keputusan berikutnya.
            </p>
          </section>

          <nav className="portal-sidebar-nav" aria-label="Navigasi portal">
            {navGroups.map((group) => (
              <section className="portal-nav-group" key={group.title}>
                <span className="portal-nav-group-title">{group.title}</span>
                <div className="portal-nav-cluster">
                  {group.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        className={`portal-nav-link ${active ? "is-active" : ""}`}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                      >
                        <span className="portal-nav-link-icon" aria-hidden="true">
                          <Icon size={18} />
                        </span>
                        <span className="portal-nav-link-copy">
                          <strong>{item.label}</strong>
                          <small>{item.caption}</small>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>

          <section className="portal-sidebar-flow">
            <div className="portal-sidebar-flow-head">
              <div>
                <span className="portal-nav-group-title">Peta Workflow</span>
                <h3>Urutan kerja yang perlu dipahami user</h3>
              </div>
              <span className="pill">Mudah dipindai</span>
            </div>

            <ol className="portal-flow-list">
              {workflowSteps.map((step, index) => {
                const stepState =
                  currentStepIndex === -1
                    ? ""
                    : index < currentStepIndex
                      ? "is-complete"
                      : index === currentStepIndex
                        ? "is-current"
                        : "";

                return (
                  <li className={`portal-flow-item ${stepState}`.trim()} key={step.href}>
                    <span className="portal-flow-step">{String(index + 1).padStart(2, "0")}</span>
                    <div className="portal-flow-copy">
                      <strong>{step.title}</strong>
                      <p>{step.copy}</p>
                    </div>
                    <ArrowRight className="portal-flow-arrow" size={16} aria-hidden="true" />
                  </li>
                );
              })}
            </ol>
          </section>

          <div className="portal-sidebar-session">{sessionArea}</div>
        </div>
      </aside>

      <div className="portal-stage">
        <header className="portal-topbar">
          <div className="portal-topbar-copy">
            <span className="portal-topbar-kicker">Portal Yoora Sarah</span>
            <h2>{currentItem?.label ?? "Portal Internal"}</h2>
            <p>
              {currentItem?.caption ??
                "Akses semua tahapan kerja tanpa menu yang bertumpuk di bagian atas."}
            </p>
          </div>
        </header>

        <div className="portal-stage-content">{children}</div>

        <footer className="site-footer">
          <div className="site-footer-inner">
            <p>
              Portal ini dirancang agar brief, forecast, persetujuan, dan
              rencana produksi mudah dipahami tanpa membebani user dengan
              navigasi yang padat.
            </p>
            <span>
              Struktur visual portal sekarang menekankan urutan kerja, status
              aktif, dan keputusan berikutnya.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
