import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { DashboardResponse, TrendResponse, PeriodFilter } from '@yoavchu/shared';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: (params: { period?: PeriodFilter; clientId?: string }) =>
    [...dashboardKeys.all, 'data', params] as const,
  trend: (params: { clientId?: string }) =>
    [...dashboardKeys.all, 'trend', params] as const,
};

export function useDashboard(params: { period?: PeriodFilter; clientId?: string } = {}) {
  return useQuery({
    queryKey: dashboardKeys.data(params),
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardResponse>('/dashboard', { params });
      return data;
    },
    refetchOnWindowFocus: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useDashboardTrend(params: { clientId?: string } = {}) {
  return useQuery({
    queryKey: dashboardKeys.trend(params),
    queryFn: async () => {
      const { data } = await apiClient.get<TrendResponse>('/dashboard/trend', { params });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
