import { useQuery } from '@tanstack/react-query';
import type { Stats } from '@pharmacy-point/types';

export type { Stats };

async function fetchStats(): Promise<Stats> {
  const response = await fetch('/api/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }

  return response.json();
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
