import { useEffect, useCallback } from 'react';

const QUEUE_KEY = 'pharmacy-offline-queue';

export function useOfflineQueue() {
  const add = useCallback((order: unknown) => {
    try {
      const existing = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      existing.push({ ...order, queuedAt: new Date().toISOString() });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(existing));
    } catch { /* ignore */ }
  }, []);

  const sync = useCallback(async () => {
    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      if (!queue.length) return;
      await fetch('/api/orders/offline/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: queue }),
      });
      localStorage.removeItem(QUEUE_KEY);
    } catch { /* will retry on reconnect */ }
  }, []);

  useEffect(() => {
    const onOnline = () => sync();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [sync]);

  return { add, sync };
}
