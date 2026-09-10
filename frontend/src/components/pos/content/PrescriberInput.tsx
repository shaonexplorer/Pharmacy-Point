'use client';

import { cn } from '@/lib/utils';
import { MaterialSymbols } from '@/components/ui/material-symbols';

/**
 * PrescriberInput — a doctor/prescriber name + license input field
 * with a stethoscope icon, matching the Stitch POS design.
 */
export function PrescriberInput({
  value,
  onChange,
  placeholder = 'Prescribing Doctor Name / License',
  className,
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1 mt-1', className)}>
      <MaterialSymbols icon="stethoscope" className="text-outline text-sm" />
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'flex-1 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm',
          'px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-primary shadow-inner'
        )}
      />
    </div>
  );
}
