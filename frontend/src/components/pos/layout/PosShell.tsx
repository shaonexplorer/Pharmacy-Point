'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PosSidebar } from './PosSidebar';
import { PosHeader } from './PosHeader';

/**
 * PosShell — the Clinical Precision POS terminal page shell.
 *
 * Orchestrates:
 *  - PosSidebar (left nav, fixed, dark-themed)
 *  - PosHeader (top bar, fixed, with search + clock + profile)
 *  - Content area (main scroll region)
 *
 * This shell replaces the app-wide shadcn Sidebar + Header for the POS
 * route, delivering the full-screen terminal UX from the Stitch design.
 *
 * The sidebar is 256px (w-64) and the header is 64px (h-16).
 * Main content area is offset: `ml-64 pt-16`.
 */
export function PosShell({
  children,
  showHeader = true,
}: {
  children: ReactNode;
  showHeader?: boolean;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left sidebar */}
      <PosSidebar />

      {/* Right content area */}
      <div className="ml-64 flex flex-1 flex-col">
        {showHeader && <PosHeader />}
        <main
          className={cn(
            'relative bg-background min-h-screen w-full px-6 py-4',
            showHeader ? 'pt-16' : 'pt-0'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
