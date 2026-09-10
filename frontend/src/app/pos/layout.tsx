'use client';

import { ReactNode, useState, useEffect } from 'react';
import { PosProvider } from '@/context/PosContext';
import { OfflineIndicator } from '@/components/pos/OfflineIndicator';

/**
 * POS terminal layout.
 *
 * The POS route uses a self-contained full-screen shell (PosShell) with its
 * own dark-themed sidebar and fixed header — it does NOT use the app-wide
 * shadcn Sidebar. The Navigation component in the root layout detects
 * /pos routes and returns children directly (without AuthShell), so this
 * layout provides the PosProvider and offline indicator.
 */
export default function PosLayout({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      try {
        const queue = JSON.parse(
          localStorage.getItem('pharmacy-offline-queue') || '[]'
        );
        if (queue.length) {
          fetch('/api/orders/offline/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orders: queue }),
          }).then(() => localStorage.removeItem('pharmacy-offline-queue'));
        }
      } catch (e) {
        // silent — offline sync will retry on next reconnect
      }
    }
  }, [isOnline]);

  return (
    <PosProvider>
      {!isOnline && <OfflineIndicator />}
      {children}
    </PosProvider>
  );
}
