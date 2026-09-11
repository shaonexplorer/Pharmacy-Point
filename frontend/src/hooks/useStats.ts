import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Stats } from "@pharmacy-point/types";

export type { Stats };

async function fetchStats(): Promise<Stats> {
  return api.stats.get();
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
