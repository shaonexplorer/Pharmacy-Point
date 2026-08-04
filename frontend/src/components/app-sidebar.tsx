'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  Package,
  ShoppingCart,
  Warehouse,
  Store,
  User,
  BarChart3,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStats } from '@/hooks/useStats';
import { useOrders } from '@/hooks/useOrders';
import { useInventory } from '@/hooks/useInventory';

/* ============================================================================
 *  Pharmacy Point — Clinical Precision Sidebar
 *
 *  Design rationale:
 *  The sidebar combines shadcn/ui Sidebar primitives with the "Clinical
 *  Precision" design system from DESIGN.md. Each section is mapped to a
 *  clinical-color dot so the user identifies a section at a glance:
 *   - Pharma Teal (primary)   → Dashboard / Customers (overview & relationships)
 *   - Medi-Blue (secondary)   → Products / Companies / Analytics (standard)
 *   - Safety Green (tertiary) → POS (active dispensing)
 *   - Amber (warning)         → Inventory (caution — stock levels)
 *
 *  Signature element: the "liquid fill" active indicator — a vertical bar on
 *  the left edge of the active nav item that animates like liquid being poured
 *  into a vial (fill from bottom to top with a gradient + soft glow). This is
 *  grounded in the pharmacy subject: medication vials literally contain liquid,
 *  so the fill motion is semantically meaningful, not decorative.
 * ============================================================================ */

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
  badge?: {
    label: string;
    color: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'destructive';
  };
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrator',
  PHARMACIST: 'Pharmacist',
  STAFF: 'Staff Member',
  CUSTOMER: 'Customer',
};

const roleBadgeClasses: Record<string, string> = {
  ADMIN: 'border-primary/30 bg-primary/10 text-primary',
  PHARMACIST: 'border-tertiary/30 bg-tertiary/10 text-tertiary',
  STAFF: 'border-secondary/30 bg-secondary/10 text-secondary',
  CUSTOMER: 'border-muted bg-muted/20 text-muted-foreground',
};

/* ── Brand mark ─────────────────────────────────────────────────────────── */

/** Brand mark: an amber pharmacy vial with visible liquid level. */
function PharmaVial({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pharma-liquid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(199 59% 65%)" />
          <stop offset="100%" stopColor="hsl(199 59% 40%)" />
        </linearGradient>
      </defs>
      {/* Dropper / cap */}
      <rect x="9" y="2" width="6" height="3" rx="1" fill="hsl(0 0% 18%)" />
      {/* Dropper bulb */}
      <circle cx="12" cy="2.5" r="0.7" fill="hsl(0 0% 18%)" />
      {/* Neck */}
      <path d="M10 5v1c0 .5.5 1 1 1s1-.5 1-1V5h-2z" fill="hsl(0 0% 18%)" />
      {/* Bottle body */}
      <path
        d="M7 6h10v14a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V6z"
        fill="hsl(199 60% 88% / 0.35)"
        stroke="hsl(199 59% 50%)"
        strokeWidth="1"
      />
      {/* Liquid fill (amber gradient) */}
      <path d="M7 13h10v7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-7z" fill="url(#pharma-liquid)" />
      {/* Glass highlight */}
      <path
        d="M7.5 7v10a2.5 2.5 0 0 0 2.5 2.5h4a2.5 2.5 0 0 0 2.5-2.5V7"
        fill="none"
        stroke="hsl(0 0% 100% / 0.3)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

/* ── Liquid-fill active indicator (signature element) ───────────────────── */

function LiquidFillIndicator({ active }: { active: boolean }) {
  return (
    <>
      {/* Liquid fill bar — grows from bottom via scale-y */}
      <div
        className={cn(
          'absolute left-0 top-2 bottom-2 w-[3px] overflow-hidden rounded-full',
          'transition-opacity duration-300',
          active ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      >
        <div
          className={cn(
            'h-full w-full origin-bottom',
            'bg-gradient-to-b from-[hsl(199,59%,65%)] to-[hsl(199,59%,33%)]',
            'shadow-[0_0_6px_2px_rgba(0,104,95,0.4)]',
            'transition-[transform,opacity] duration-300 ease-out',
            active ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
          )}
        />
      </div>
      {/* Surface-tension meniscus — pulsed glow at the liquid's top edge */}
      {active && (
        <span
          className={cn(
            'absolute left-[1.5px] top-1.5 h-2 w-2 -translate-x-1/2 rounded-full bg-primary',
            'shadow-[0_0_8px_3px_rgba(0,104,95,0.5)]',
            'animate-pulse'
          )}
          aria-hidden="true"
        />
      )}
    </>
  );
}

/* ── Brand header ───────────────────────────────────────────────────────── */

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-2 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <PharmaVial className="h-6 w-6 text-primary" />
      </div>
      <div>
        <span className="block text-xl font-bold text-foreground">Pharmacy Point</span>
        <span className="text-xs text-muted-foreground">Clinical Precision v1.0</span>
      </div>
    </div>
  );
}

/* ── Nav item wrapper (adds liquid-fill indicator + clinical dot) ────────── */

function NavItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={isCollapsed ? item.name : undefined}
        className={cn(
          'relative group/item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isActive
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <Link href={item.href} className="flex w-full items-center gap-3">
          {/* Liquid fill — the signature active indicator */}
          <LiquidFillIndicator active={isActive} />

          {/* Status dot — maps the section to its clinical color */}
          <span
            className={cn(
              'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
              'transition-all duration-200',
              item.dotColor,
              isActive
                ? 'h-6 w-6 scale-110 shadow-md shadow-black/10'
                : 'group-hover/item:scale-105'
            )}
          >
            <Icon
              className={cn(
                'h-3 w-3 transition-colors duration-200',
                isActive ? 'text-primary-foreground' : 'text-primary-foreground/80'
              )}
            />
            {isActive && (
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: '0 0 8px 3px hsla(199, 59%, 50%, 0.4)',
                }}
              />
            )}
          </span>

          <span className={cn('truncate')}>{item.name}</span>

          {item.badge && (
            <Badge
              variant="secondary"
              className={cn(
                'ml-auto text-xs font-mono font-medium',
                item.badge.color === 'warning' && 'border-warning/30 bg-warning/10 text-warning',
                item.badge.color === 'primary' && 'border-primary/30 bg-primary/10 text-primary',
                item.badge.color === 'secondary' &&
                  'border-secondary/30 bg-secondary/10 text-secondary',
                item.badge.color === 'tertiary' &&
                  'border-tertiary/30 bg-tertiary/10 text-tertiary',
                item.badge.color === 'destructive' && 'border-error/30 bg-error/10 text-error'
              )}
            >
              {item.badge.label}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/* ── User card ──────────────────────────────────────────────────────────── */

function UserCard() {
  const { data: session, isPending } = useSession();

  if (isPending || !session) return null;

  const user = session.user;
  const role = (user as { role?: string }).role;
  const roleLabel = role ? (roleLabels[role] ?? role) : undefined;
  const roleClass = role
    ? (roleBadgeClasses[role] ?? 'border-muted bg-muted/20 text-muted-foreground')
    : undefined;

  const initials = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="border-t border-sidebar-border p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span className="text-sm font-bold">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {user?.name ?? 'Pharmacy Staff'}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
          {role && roleLabel && (
            <Badge variant="outline" size="sm" className={cn('mt-0.5', roleClass)}>
              {roleLabel}
            </Badge>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut()}
        className="mt-4 w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-sidebar-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}

/* ── App Sidebar ────────────────────────────────────────────────────────── */

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: stats } = useStats();
  const { data: pendingOrders, isLoading: ordersLoading } = useOrders({
    status: 'PENDING',
    limit: 1,
  });
  const { data: lowStockData, isLoading: lowStockLoading } = useInventory({
    lowStock: true,
    limit: 1,
  });

  // Pending orders count for POS badge
  const pendingCount = !ordersLoading && pendingOrders?.pagination?.total;
  // Low stock count for Inventory badge
  const lowStockCount = !lowStockLoading && lowStockData?.pagination?.total;

  // Base navigation items — computed directly so no setState in effects
  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      dotColor: 'bg-primary',
      badge:
        stats?.lowStockItems && stats.lowStockItems > 0
          ? { label: `${stats.lowStockItems}`, color: 'warning' }
          : undefined,
    },
    { name: 'Products', href: '/products', icon: Package, dotColor: 'bg-secondary' },
    {
      name: 'POS',
      href: '/pos',
      icon: ShoppingCart,
      dotColor: 'bg-tertiary',
      badge:
        pendingCount && pendingCount > 0
          ? { label: `${pendingCount} pending`, color: 'warning' }
          : undefined,
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: Warehouse,
      dotColor: 'bg-warning',
      badge:
        lowStockCount && lowStockCount > 0
          ? { label: `${lowStockCount} low`, color: 'warning' }
          : undefined,
    },
    { name: 'Companies', href: '/companies', icon: Store, dotColor: 'bg-secondary' },
    { name: 'Customers', href: '/customers', icon: User, dotColor: 'bg-primary' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, dotColor: 'bg-secondary' },
  ];

  return (
    <>
      <Sidebar
        side="left"
        variant="sidebar"
        collapsible="icon"
        {...props}
        className="border-r border-sidebar-border bg-sidebar"
      >
        <SidebarHeader>
          <SidebarBrand />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <UserCard />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

export { LiquidFillIndicator, PharmaVial };
