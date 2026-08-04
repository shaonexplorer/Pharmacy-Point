'use client';

import { useSession } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/* ============================================================================
 *  Pharmacy Point — Navigation Shell
 *
 *  Modern sidebar using shadcn/ui Sidebar primitives (SidebarProvider,
 *  Sidebar, SidebarInset) wrapped around the Clinical Precision AppSidebar.
 *
 *  Behavior:
 *  - Unauthenticated → renders children without a sidebar shell (auth pages).
 *  - Authenticated → wraps content in SidebarProvider + AppSidebar, with a
 *    mobile header that includes a SidebarTrigger button.
 *  - Shows a spinner while the session is being checked.
 * ============================================================================ */

function MobileHeader() {
  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b border-border bg-card px-3 md:hidden">
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger />
        </TooltipTrigger>
        <TooltipContent>Toggle navigation</TooltipContent>
      </Tooltip>
      <span className="text-sm font-medium text-foreground">Pharmacy Point</span>
      {/* Spacer to balance the header */}
      <div className="w-10" />
    </header>
  );
}

function NavigationLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Mobile-only header with nav toggle */}
          <MobileHeader />
          <div className="flex-1 overflow-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export function Navigation({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <NavigationLoading />;
  }

  if (!session) {
    // Public pages (login, signup) — no navigation shell
    return <div className="flex min-h-screen flex-col">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AuthShell>{children}</AuthShell>
    </div>
  );
}

// Re-export SidebarTrigger for use in individual page headers
export { SidebarTrigger };
