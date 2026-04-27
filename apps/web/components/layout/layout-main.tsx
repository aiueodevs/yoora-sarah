'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const FULL_HEIGHT_ROUTES = ['/stylist'];

export function LayoutMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFullHeight = FULL_HEIGHT_ROUTES.includes(pathname);

  return (
    <main className={isFullHeight ? 'h-[calc(100dvh-68px)] overflow-hidden' : 'flex-1'}>
      {children}
    </main>
  );
}
