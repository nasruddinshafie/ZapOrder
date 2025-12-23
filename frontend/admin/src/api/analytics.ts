import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { useRestaurantId } from '../hooks/useRestaurantId';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrdersToday: number;
  todayRevenue: number;
  revenueGrowth: number;
}

export interface SalesChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopSellingItem {
  menuItemId: number;
  menuItemName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  orderCount: number;
}

export const useDashboardStats = (startDate?: string, endDate?: string) => {
  const restaurantId = useRestaurantId();

  return useQuery({
    queryKey: ['dashboard-stats', restaurantId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const { data } = await apiClient.get<DashboardStats>(
        `/analytics/dashboard/${restaurantId}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return data;
    },
    enabled: !!restaurantId,
  });
};

export const useSalesChartData = (days: number = 7) => {
  const restaurantId = useRestaurantId();

  return useQuery({
    queryKey: ['sales-chart', restaurantId, days],
    queryFn: async () => {
      const { data } = await apiClient.get<SalesChartDataPoint[]>(
        `/analytics/sales-chart/${restaurantId}?days=${days}`
      );
      return data;
    },
    enabled: !!restaurantId,
  });
};

export const useTopSellingItems = (limit: number = 10) => {
  const restaurantId = useRestaurantId();

  return useQuery({
    queryKey: ['top-selling-items', restaurantId, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<TopSellingItem[]>(
        `/analytics/top-items/${restaurantId}?limit=${limit}`
      );
      return data;
    },
    enabled: !!restaurantId,
  });
};
