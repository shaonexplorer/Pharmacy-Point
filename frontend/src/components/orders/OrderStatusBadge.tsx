"use client";

import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200",
  REFUNDED: "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200",
  PARTIALLY_REFUNDED: "bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200",
  RETURNED: "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200",
};

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`font-medium text-xs uppercase tracking-wide ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-800"} ${className ?? ""}`}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
