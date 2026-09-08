import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DueAccountAlertProps {
  dueAmount: number;
  customerName?: string;
}

export function DueAccountAlert({ dueAmount, customerName }: DueAccountAlertProps) {
  if (dueAmount <= 0) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span className="font-medium">
        {customerName ? `${customerName} — ` : ''}
        Outstanding balance: <Badge variant="destructive" className="ml-1">${dueAmount.toFixed(2)}</Badge>
      </span>
    </div>
  );
}
