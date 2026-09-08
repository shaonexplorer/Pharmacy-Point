import React from 'react';

export function OfflineIndicator() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 text-sm font-medium shadow-md" role="status" aria-live="polite">
      <span className="inline-block mr-2">●</span> Offline mode — orders queued locally and will sync when connection returns.
    </div>
  );
}
