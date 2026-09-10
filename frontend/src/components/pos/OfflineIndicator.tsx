'use client';

import { MaterialSymbols } from '@/components/ui/material-symbols';

/**
 * OfflineIndicator — a fixed banner shown when the browser is offline,
 * per the Clinical Precision POS terminal design.
 *
 * Uses amber (warning) tones for visibility, matching the Stitch design's
 * offline state treatment.
 */
export function OfflineIndicator() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-warning text-on-warning px-4 py-2 text-sm font-medium shadow-md flex items-center justify-center gap-2">
      <MaterialSymbols icon="cloud_off" className="text-lg" />
      <span>Offline mode — orders queued locally and will sync when connection returns.</span>
    </div>
  );
}
