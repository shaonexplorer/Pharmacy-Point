'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  /** Icon component (from lucide-react) */
  icon: React.ComponentType<{ className?: string }>;
  /** Card title — short action label */
  label: string;
  /** Brief description of what this action does */
  description: string;
  /** Navigation target */
  href: string;
  /** Icon text color — e.g. "text-primary" */
  iconColor: string;
  /** Icon background color — e.g. "bg-primary/10" */
  iconBg: string;
  /** Optional className */
  className?: string;
}

/**
 * Quick-action card — a tappable Card that navigates to a workflow.
 *
 * DESIGN.md → Dashboard Overview: "Quick Actions: Cards for 'Add Product,'
 * 'New Order,' 'Stock Adjustment,' 'Add Customer.'"
 *
 * Each card uses a distinctive icon with a soft tinted background matching
 * the Clinical Precision semantic palette. On hover, the icon lifts and a
 * subtle shadow appears to signal interactivity.
 */
export function QuickActionCard({
  icon: Icon,
  label,
  description,
  href,
  iconColor,
  iconBg,
  className,
}: QuickActionCardProps) {
  return (
    <Card
      className={cn(
        'border-border bg-card transition-all duration-200',
        'group hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5',
        className
      )}
    >
      <CardContent className="px-4 py-4">
        <Link href={href} className="group block">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                'transition-transform duration-200 group-hover:scale-110',
                iconBg,
                iconColor
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'font-medium text-foreground transition-colors',
                  'group-hover:text-primary'
                )}
              >
                {label}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
