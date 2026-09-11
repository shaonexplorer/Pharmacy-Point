'use client';

import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@pharmacy-point/types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-secondary/10 text-secondary border-secondary/30',
  COMPLETED: 'bg-tertiary/10 text-tertiary border-tertiary/30',
  CANCELLED: 'bg-error/10 text-error border-error/30',
  REFUNDED: 'bg-primary/10 text-primary border-primary/30',
  PARTIALLY_REFUNDED: 'bg-primary/20 text-primary border-primary/40',
  RETURNED: 'bg-warning/10 text-warning border-warning/30',
};

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const style = STATUS_STYLES[status as OrderStatus] ?? 'bg-muted text-muted-foreground border-border';

  return (
    <Badge
      variant="outline"
      className={`font-medium text-xs uppercase tracking-wide ${style} ${className ?? ''}`}
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
