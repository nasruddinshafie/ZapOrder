import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { TableResponse, CreateTableRequest, UpdateTableRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const useRestaurantId = () => {
  const { user } = useAuth();
  return user?.restaurantId || 0;
};

// Get all tables for a restaurant
export const useTables = () => {
  const restaurantId = useRestaurantId();

  return useQuery({
    queryKey: ['tables', restaurantId],
    queryFn: async () => {
      const { data } = await apiClient.get<TableResponse[]>(
        `/tables/restaurant/${restaurantId}`
      );
      return data;
    },
    enabled: !!restaurantId,
  });
};

// Get a single table by ID
export const useTable = (id: number) => {
  return useQuery({
    queryKey: ['table', id],
    queryFn: async () => {
      const { data } = await apiClient.get<TableResponse>(`/tables/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create a new table
export const useCreateTable = () => {
  const queryClient = useQueryClient();
  const restaurantId = useRestaurantId();

  return useMutation({
    mutationFn: async (request: Omit<CreateTableRequest, 'restaurantId'>) => {
      const { data } = await apiClient.post<TableResponse>('/tables', {
        ...request,
        restaurantId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', restaurantId] });
      toast.success('Table created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create table';
      toast.error(message);
    },
  });
};

// Update a table
export const useUpdateTable = () => {
  const queryClient = useQueryClient();
  const restaurantId = useRestaurantId();

  return useMutation({
    mutationFn: async ({ id, ...request }: UpdateTableRequest & { id: number }) => {
      const { data } = await apiClient.put<TableResponse>(`/tables/${id}`, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', restaurantId] });
      toast.success('Table updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update table';
      toast.error(message);
    },
  });
};

// Delete a table
export const useDeleteTable = () => {
  const queryClient = useQueryClient();
  const restaurantId = useRestaurantId();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/tables/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', restaurantId] });
      toast.success('Table deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete table';
      toast.error(message);
    },
  });
};

// Download QR code for a table
export const downloadTableQRCode = async (tableId: number) => {
  try {
    const response = await apiClient.get(`/tables/${tableId}/qrcode`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `table-${tableId}-qrcode.png`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success('QR code downloaded successfully!');
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to download QR code';
    toast.error(message);
  }
};
