'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Home,
  Package,
  Store,
  BarChart3,
  LogOut,
  Menu,
  User,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────────────── *
 *  Pharmacy Point — "Pharmacy Counter" Navigation
 *
 *  Design rationale:
 *  The navigation evokes a pharmacy counter/workspace rather than a generic
 *  admin sidebar. Each section is mapped to a clinical-color dot so the user
 *  can identify a section at a glance by its semantic hue:
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
 * ────────────────────────────────────────────────────────────────────────── */

interface NavItemConfig {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
}

const navigation: NavItemConfig[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, dotColor: 'bg-primary' },
  { name: 'Products', href: '/products', icon: Package, dotColor: 'bg-secondary' },
  { name: 'POS', href: '/pos', icon: ShoppingCart, dotColor: 'bg-tertiary' },
  { name: 'Inventory', href: '/inventory', icon: Package, dotColor: 'bg-warning' },
  { name: 'Companies', href: '/companies', icon: Store, dotColor: 'bg-secondary' },
  { name: 'Customers', href: '/customers', icon: User, dotColor: 'bg-primary' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, dotColor: 'bg-secondary' },
];

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

/**
 * Liquid-fill active indicator — the signature element.
 * A vertical bar that "pours" like liquid into a vial: it grows from
 * 0 → 100 % height (transform-origin bottom) with a gradient and soft
 * glow. A surface-tension meniscus pulse appears at the liquid's edge.
 */
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

      {/* Surface-tension meniscus — pulsed glow at the liquid's top edge.
          Centered on the 3px fill bar (left-[1.5px] + -translate-x-1/2) */}
      {active && (
        <span
          className={cn(
            'absolute left-[1.5px] top-1.5 h-2 w-2 -translate-x-1/2 rounded-full bg-primary',
            'animate-pulse',
            'shadow-[0_0_8px_3px_rgba(0,104,95,0.5)]'
          )}
          aria-hidden="true"
        />
      )}
    </>
  );
}

/* ── Brand header ───────────────────────────────────────────────────────── */

function NavBrand() {
  return (
    <div className="mb-8 flex items-center gap-3 px-2">
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

/* ── Nav item ───────────────────────────────────────────────────────────── */

function NavItem({ item, onMobileClose }: { item: NavItemConfig; onMobileClose?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
      )}
      onClick={onMobileClose}
    >
      {/* Liquid fill — the signature active indicator */}
      <LiquidFillIndicator active={isActive} />

      {/* Status dot — maps the section to its clinical color */}
      <span
        className={cn(
          'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
          'transition-all duration-200',
          item.dotColor,
          isActive ? 'h-6 w-6 scale-110 shadow-md shadow-black/10' : 'group-hover:scale-105'
        )}
      >
        <Icon
          className={cn(
            'h-3 w-3',
            'transition-colors duration-200',
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

      <span className="truncate">{item.name}</span>
    </Link>
  );
}

/* ── Nav list (reused for desktop + mobile) ─────────────────────────────── */

function NavList({ onMobileClose }: { onMobileClose?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-2" aria-label="Main navigation">
      {navigation.map((item) => (
        <NavItem key={item.name} item={item} onMobileClose={onMobileClose} />
      ))}
    </nav>
  );
}

/* ── User card ──────────────────────────────────────────────────────────── */

function UserCard() {
  const { data: session, isPending } = useSession();

  if (isPending || !session) {
    return null;
  }

  const user = session.user;
  const role = (user as { role?: string }).role;
  const roleLabel = role ? (roleLabels[role] ?? role) : undefined;
  const roleClass = role
    ? (roleBadgeClasses[role] ?? 'border-muted bg-muted/20 text-muted-foreground')
    : undefined;

  const initials = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="border-t border-border p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span className="text-sm font-bold">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {user?.name ?? 'Pharmacy Staff'}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
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
        className="mt-4 w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}

/* ── Desktop sidebar ────────────────────────────────────────────────────── */

function DesktopSidebar() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <aside className="hidden w-72 flex-col gap-2 border-r border-border bg-card p-4 lg:flex lg:pt-6">
        <NavBrand />
        <div className="mt-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </aside>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <aside className="hidden w-72 flex-col border-r border-border bg-card lg:flex">
      <div className="py-6">
        <NavBrand />
        <NavList />
      </div>

      <UserCard />
    </aside>
  );
}

/* ── Mobile drawer ──────────────────────────────────────────────────────── */

function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: session, isPending } = useSession();

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const showContent = session && !isPending;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/60 backdrop-blur-sm',
          'transition-opacity duration-300 ease-out',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="py-6">
          <NavBrand />
          {isPending && (
            <div className="mt-4 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {showContent && (
            <>
              <NavList onMobileClose={onClose} />
              <UserCard />
            </>
          )}
        </div>
      </aside>
    </>
  );
}

/* ── Main wrapper ───────────────────────────────────────────────────────── */

export function Navigation({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    // Public pages (login, signup) — no navigation shell
    return <div className="flex min-h-screen flex-col">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between border-b border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(true)}
            className="text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-foreground">Pharmacy Point</span>
        </div>
      </header>

      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1">
        <DesktopSidebar />
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}
