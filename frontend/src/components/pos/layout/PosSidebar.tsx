'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MaterialSymbols } from '@/components/ui/material-symbols';
import { StatusIndicator } from '../shared/StatusIndicator';

/**
 * PosSidebar — the dark-themed Clinical Precision POS terminal sidebar.
 *
 * Matches the Stitch design (stitch-screens/07-pos-interface.html):
 *  - Fixed, full-height, 256px wide on desktop
 *  - PharmOS brand header with lock icon
 *  - "Shift Active" indicator with till number
 *  - Navigation pills with colored badge overlays
 *  - Footer: scan button, status + version, settings/handover
 *
 * This sidebar is self-contained — it does NOT use the app-wide
 * shadcn Sidebar primitives. It replaces them for the POS terminal
 * route to deliver the full-screen Clinical Precision terminal UX.
 */

interface NavItem {
  name: string;
  href: string;
  icon: string;
  dotColor: string;
  badge?: {
    label: string;
    className: string;
  };
}

export function PosSidebar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'dashboard',
      dotColor: 'bg-secondary',
    },
    {
      name: 'Point of Sale (POS)',
      href: '/pos',
      icon: 'point_of_sale',
      dotColor: 'bg-tertiary',
      badge: {
        label: 'Active Bill',
        className: 'bg-primary text-on-primary',
      },
    },
    {
      name: 'Inventory & Stock',
      href: '/inventory',
      icon: 'inventory_2',
      dotColor: 'bg-secondary',
      badge: {
        label: '14',
        className: 'bg-error-container text-on-error-container',
      },
    },
    {
      name: 'Expiry & Batches',
      href: '/inventory/expiring',
      icon: 'event_upcoming',
      dotColor: 'bg-destructive',
      badge: {
        label: '8 Expiring',
        className: 'bg-error-container text-on-error-container',
      },
    },
    {
      name: 'Customers & Credit',
      href: '/customers',
      icon: 'group',
      dotColor: 'bg-primary',
      badge: {
        label: 'Dues',
        className: 'text-outline uppercase',
      },
    },
    {
      name: 'Financial Reports',
      href: '/reports/financial',
      icon: 'analytics',
      dotColor: 'bg-secondary',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between border-r border-outline-variant/30">
      {/* ── Brand Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col">
        <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            {/* PharmOS logo (local SVG asset) */}
            <img
              alt="PharmOS Logo"
              className="h-6 w-auto object-contain"
              src="/pharmos-logo.svg"
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight">
                PharmOS
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                Dispensary Pro
              </span>
            </div>
          </div>
          <MaterialSymbols
            icon="lock_clock"
            className="text-outline text-lg cursor-pointer hover:text-on-surface transition-colors"
          />
        </div>

        {/* ── Shift Active Indicator ─────────────────────────────────── */}
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1 bg-surface-container-low rounded-lg">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold">
                Shift Active
              </span>
            </div>
            <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">
              Till #03
            </span>
          </div>
        </div>

        {/* ── Navigation ─────────────────────────────────────────────── */}
        <nav
          className="flex flex-col gap-0.5 px-2 mt-1"
          data-active-classes="bg-primary-container text-on-primary-container font-bold rounded-lg"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg text-on-surface-variant',
                  'hover:bg-surface-container-high hover:text-on-surface transition-colors',
                  isActive &&
                    'bg-primary-container text-on-primary-container font-bold'
                )}
              >
                <div className="flex items-center gap-2">
                  <MaterialSymbols
                    icon={item.icon}
                    className={cn(
                      'text-lg',
                      isActive ? 'text-on-primary-container' : 'text-on-surface-variant'
                    )}
                  />
                  <span className="font-button-text text-button-text">
                    {item.name}
                  </span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'font-label-caps text-label-caps px-1.5 py-0.5 rounded-full',
                      item.badge.className
                    )}
                  >
                    {item.badge.label}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
      </div>

      {/* ── Footer: Scan, Status, Settings ───────────────────────────── */}
      <div className="p-3 flex flex-col gap-2 border-t border-outline-variant/20 bg-surface-container-lowest">
        {/* Scan Medication */}
        <button
          type="button"
          className={cn(
            'w-full flex items-center justify-center gap-1.5 py-2',
            'bg-surface-container hover:bg-surface-container-high rounded-lg',
            'text-on-surface transition-colors'
          )}
        >
          <MaterialSymbols icon="barcode_scanner" className="text-base text-primary" />
          <span className="font-button-text text-button-text">Scan Medication (F3)</span>
        </button>

        {/* Status + Version */}
        <div className="flex items-center justify-between px-1 py-0.5 text-on-surface-variant">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <StatusIndicator
              label="Online • Cloud Synced"
              variant="success"
              className="!inline-flex !gap-1 !px-0 !bg-transparent !text-on-surface-variant"
            />
          </div>
          <span className="font-label-numeric-sm text-label-numeric-sm">v2.4.1</span>
        </div>

        {/* Settings + Handover */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-1',
              'border border-outline-variant/40 rounded-lg text-on-surface-variant',
              'hover:bg-surface-container hover:text-on-surface transition-colors'
            )}
          >
            <MaterialSymbols icon="settings" className="text-sm" />
            <span className="font-button-text text-button-text">Settings</span>
          </button>
          <button
            type="button"
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-1',
              'bg-error-container text-on-error-container rounded-lg hover:opacity-90 transition-opacity'
            )}
          >
            <MaterialSymbols icon="swap_horiz" className="text-sm" />
            <span className="font-button-text text-button-text">Handover</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
