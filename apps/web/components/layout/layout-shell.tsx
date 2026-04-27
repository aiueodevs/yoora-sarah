'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const FULL_HEIGHT_ROUTES = ['/stylist'];

export function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFullHeight = FULL_HEIGHT_ROUTES.includes(pathname);

  return (
    <div className={isFullHeight ? 'flex h-screen flex-col overflow-hidden' : 'flex min-h-screen flex-col'}>
      {children}
    </div>
  );
}
