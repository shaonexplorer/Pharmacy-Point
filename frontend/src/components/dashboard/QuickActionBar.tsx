'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  /** Visual variant: 'primary' (teal), 'ghost' (outline), 'destructive' (error) */
  variant?: 'primary' | 'ghost' | 'destructive';
  /** Keyboard shortcut display */
  shortcut?: string;
}

export interface QuickActionBarProps {
  /** Quick action items */
  actions: QuickAction[];
  /** Optional urgent count badge */
  urgentCount?: number;
  /** Optional className */
  className?: string;
}

/**
 * Quick Action Bar — a floating, pinned action bar with quick
 * dispensary shortcuts. Renders with a glassmorphism backdrop.
 *
 * DESIGN.md → Layout:
 *  - Floating, fixed-position bar at bottom of dashboard
 *  - Inverse surface (dark teal) with white text
 *  - Glassmorphism backdrop blur
 *  - Primary action uses Pharma Teal
 *  - Destructive action uses Error color
 *
 * Stitch screen:
 *  - "Dispensary Quick-Bar" label
 *  - Terminal info
 *  - Buttons: New Sale (F2), Add Product (F4), Receive GRN (F7),
 *    Record Due (F9), Urgent Expiring (count badge)
 */
export function QuickActionBar({ actions, urgentCount, className }: QuickActionBarProps) {
  return (
    <div
      className={cn(
        'container-max  fixed bottom-6 right-[12%] z-30 pointer-events-none',
        className
      )}
    >
      <div
        className={cn(
          'pointer-events-auto bg-inverse-surface/10 backdrop-blur-sm',
          'text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl',
          'flex flex-wrap items-center justify-between gap-3'
        )}
      >
        {/* Left: Label + terminal info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Zap className="h-5 w-5 text-primary-fixed" />
            <span className="font-headline-sm text-headline-sm text-white">
              Dispensary Quick-Bar
            </span>
          </div>
          <div className="h-4 w-px bg-outline-variant/30 hidden md:block" />
          <span className="hidden md:inline font-body-xs text-body-xs text-inverse-on-surface/70">
            Terminal #03 Ready • Scanner Active
          </span>
        </div>

        {/* Right: Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => {
            const isUrgent = action.variant === 'destructive';
            return <ActionButton key={action.label} action={action} isUrgent={isUrgent} />;
          })}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ action, isUrgent }: { action: QuickAction; isUrgent: boolean }) {
  const content = (
    <>
      {action.icon}
      <span>{action.label}</span>
      {action.shortcut && (
        <kbd className="ml-1 font-label-numeric-sm text-label-numeric-sm text-current/70">
          ({action.shortcut})
        </kbd>
      )}
    </>
  );

  if (action.href) {
    return (
      <Link href={action.href} className="pointer-events-auto">
        <Button
          variant={isUrgent ? 'destructive' : action.variant === 'primary' ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'h-10 px-3 gap-1.5 font-button-text text-button-text',
            isUrgent
              ? 'bg-error-container text-on-error-container hover:opacity-90'
              : action.variant === 'primary'
                ? 'bg-primary hover:bg-primary-container text-on-primary'
                : 'bg-inverse-surface hover:bg-surface-container/20 text-inverse-on-surface'
          )}
        >
          {content}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant={isUrgent ? 'destructive' : action.variant === 'primary' ? 'default' : 'outline'}
      size="sm"
      onClick={action.onClick}
      className={cn(
        'h-10 px-3 gap-1.5 font-button-text text-button-text pointer-events-auto',
        isUrgent
          ? 'bg-error-container text-on-error-container hover:opacity-90'
          : action.variant === 'primary'
            ? 'bg-primary hover:bg-primary-container text-on-primary'
            : 'bg-inverse-surface hover:bg-surface-container/20 text-inverse-on-surface'
      )}
    >
      {content}
    </Button>
  );
}

// Inline icon to avoid extra import
function Zap({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}
