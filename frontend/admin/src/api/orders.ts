import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from './client';
import { useAuth } from '../contexts/AuthContext';
import type { Order, OrderStatus, CreateOrderRequest } from '../types';

const useRestaurantId = () => {
  const { user } = useAuth();
  return user?.restaurantId || 0;
};

export const useOrders = (status?: OrderStatus, refetchInterval?: number) => {
  const restaurantId = useRestaurantId();

  return useQuery({
    queryKey: ['orders', restaurantId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) {
        params.append('status', status);
      }
      const { data } = await apiClient.get<Order[]>(
        `/orders/restaurant/${restaurantId}?${params}`
      );
      return data;
    },
    enabled: !!restaurantId,
    refetchInterval, // No default polling - SignalR handles real-time updates
  });
};

export const useOrder = (id: number, refetchInterval?: number) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Order>(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderRequest) => {
      const { data } = await apiClient.post<Order>('/orders', orderData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) => {
      await apiClient.put(`/orders/${id}/status`, { Status: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      toast.success('Order status updated');
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.post(`/orders/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      toast.success('Order cancelled');
    },
  });
};
