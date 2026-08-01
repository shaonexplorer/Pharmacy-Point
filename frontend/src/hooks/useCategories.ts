import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category } from '@pharmacy-point/types';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
};

/**
 * Fetch all categories.
 */
export function useCategories() {
  return useQuery<Category[] | undefined>({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await api.categories.list();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
