'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const FULL_VIEWPORT_ROUTES = ['/stylist'];

type RouteShellProps = {
  header: ReactNode;
  main: ReactNode;
  footer: ReactNode;
  overlays: ReactNode;
};

export function RouteShell({ header, main, footer, overlays }: RouteShellProps) {
  const pathname = usePathname();
  const isFullViewport = FULL_VIEWPORT_ROUTES.includes(pathname);

  return (
    <div className={isFullViewport ? 'flex h-screen flex-col overflow-hidden' : 'flex min-h-screen flex-col'}>
      {header}
      <main className={isFullViewport ? 'flex-1 overflow-hidden' : 'flex-1'}>{main}</main>
      {!isFullViewport ? footer : null}
      {!isFullViewport ? overlays : null}
    </div>
  );
}
