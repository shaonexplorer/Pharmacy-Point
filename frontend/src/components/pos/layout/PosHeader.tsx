'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MaterialSymbols } from '@/components/ui/material-symbols';
import { HotkeyBadge } from '../shared/HotkeyBadge';
import Image from 'next/image';

/**
 * PosHeader — the fixed top bar of the Clinical Precision POS terminal.
 *
 * Matches the Stitch design (stitch-screens/07-pos-interface.html):
 *  - Menu toggle (left)
 *  - Drug search input with scanner icon + ⌘K badge
 *  - "+ Quick Sale (F2)" primary button
 *  - Notifications icon with unread badge
 *  - Pharmacist name + role ( xl:hidden )
 *  - Live clock + shift timer ( md:hidden xl:flex )
 *  - Profile avatar + dropdown
 *
 * The header is always visible, fixed at top, and offsets the main
 * content by `pt-16` (64px height).
 */
export function PosHeader() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Shift duration — placeholder; in production this would come from
  // the auth/session context.
  const shiftStart = new Date(now);
  shiftStart.setHours(9, 0, 0, 0); // assume 9:00 AM shift start
  const elapsedMs = now.getTime() - shiftStart.getTime();
  const elapsedHrs = Math.floor(elapsedMs / 3600000);
  const elapsedMins = Math.floor((elapsedMs % 3600000) / 60000);
  const shiftStr = `${String(elapsedHrs).padStart(2, '0')}h ${String(elapsedMins).padStart(2, '0')}m`;

  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-6 border-b border-outline-variant/20">
      {/* ── Left: Menu + Drug Search ── */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          className="text-on-surface-variant hover:text-on-surface focus:outline-none"
          aria-label="Toggle menu"
        >
          <MaterialSymbols icon="menu_open" className="text-2xl" />
        </button>

        <div className="relative w-full flex items-center">
          <MaterialSymbols
            icon="search"
            className="absolute left-2 text-outline text-lg animate-pulse"
          />
          <input
            type="text"
            placeholder="Search drugs by brand, generic name, batch, barcode, or MRN..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={cn(
              'w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg',
              'pl-9 pr-20 py-2 font-body-sm text-body-sm text-on-surface',
              'focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary shadow-sm'
            )}
          />
          <kbd
            className={cn(
              'absolute right-2 font-label-numeric-sm text-label-numeric-sm',
              'bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/40',
              'text-on-surface-variant'
            )}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* ── Right: Quick Sale, Notifications, Clock, Profile ── */}
      <div className="flex items-center gap-3">
        {/* Pharmacist name + role (hidden on xl+) */}
        <div className="hidden xl:flex flex-col text-right">
          <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">
            Dr. Sarah Jenkins, PharmD
          </span>
          <span className="font-body-xs text-body-xs text-on-surface-variant">
            Main Dispensary Counter A
          </span>
        </div>

        {/* + Quick Sale (F2) */}
        <button
          type="button"
          className={cn(
            'h-10 px-4 bg-primary hover:bg-primary-container text-on-primary',
            'font-button-text text-button-text rounded-lg',
            'flex items-center gap-1 shadow-sm transition-colors active:scale-95'
          )}
        >
          <MaterialSymbols icon="add_shopping_cart" className="text-lg" />
          <span>+ Quick Sale (F2)</span>
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-outline-variant/30 hidden sm:block" />

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
          aria-label="Notifications"
        >
          <MaterialSymbols icon="notifications" className="text-xl" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-surface" />
        </button>

        {/* Live clock + shift timer (hidden on md) */}
        <div className="hidden md:flex flex-col text-right">
          <span className="font-label-numeric-md text-label-numeric-md text-on-surface leading-tight">
            {timeStr}
          </span>
          <span className="font-body-xs text-body-xs text-on-surface-variant">
            Shift: {shiftStr}
          </span>
        </div>

        {/* Profile avatar + dropdown */}
        <div className="flex items-center gap-1 cursor-pointer">
          <div className="relative">
            <Image
              src="/pharmacist-avatar.png"
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full object-cover border border-outline-variant/30"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-primary ring-1 ring-surface" />
          </div>
          <MaterialSymbols icon="expand_more" className="text-outline text-base" />
        </div>
      </div>
    </header>
  );
}
