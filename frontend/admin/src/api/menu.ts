import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from './client';
import { useAuth } from '../contexts/AuthContext';
import type {
  MenuCategory,
  MenuItem,
  CreateMenuCategoryRequest,
  UpdateMenuCategoryRequest,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
} from '../types';

const useRestaurantId = () => {
  const { user } = useAuth();
  return user?.restaurantId || 0;
};

// Menu Categories
export const useMenuCategories = (isActiveOnly?: boolean) => {
  const restaurantId = useRestaurantId();

  return useQuery({
    queryKey: ['menu-categories', restaurantId, isActiveOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (isActiveOnly !== undefined) {
        params.append('isActiveOnly', String(isActiveOnly));
      }
      const { data } = await apiClient.get<MenuCategory[]>(
        `/menus/categories/restaurant/${restaurantId}?${params}`
      );
      return data;
    },
    enabled: !!restaurantId,
  });
};

export const useCreateCategory = () => {
  const restaurantId = useRestaurantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Omit<CreateMenuCategoryRequest, 'restaurantId'>) => {
      const { data } = await apiClient.post<MenuCategory>('/menus/categories', {
        ...request,
        restaurantId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
      toast.success('Category created successfully');
    },
  });
};

export const useUpdateCategory = () => {
  const restaurantId = useRestaurantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateMenuCategoryRequest;
    }) => {
      await apiClient.put(`/menus/categories/${id}?restaurantId=${restaurantId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
      toast.success('Category updated successfully');
    },
  });
};

export const useDeleteCategory = () => {
  const restaurantId = useRestaurantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/menus/categories/${id}?restaurantId=${restaurantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
      toast.success('Category deleted successfully');
    },
  });
};

export const useToggleCategoryActive = () => {
  const restaurantId = useRestaurantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.put(`/menus/categories/${id}/toggle-active?restaurantId=${restaurantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
    },
  });
};

// Menu Items
export const useMenuItems = (categoryId?: number, isAvailableOnly?: boolean) => {
  const restaurantId = useRestaurantId();

  return useQuery({
    queryKey: ['menu-items', restaurantId, categoryId, isAvailableOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId !== undefined) {
        params.append('categoryId', String(categoryId));
      }
      if (isAvailableOnly !== undefined) {
        params.append('isAvailableOnly', String(isAvailableOnly));
      }
      const { data } = await apiClient.get<MenuItem[]>(
        `/menus/items/restaurant/${restaurantId}?${params}`
      );
      return data;
    },
    enabled: !!restaurantId,
  });
};

export const useCreateMenuItem = () => {
  const restaurantId = useRestaurantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Omit<CreateMenuItemRequest, 'restaurantId'>) => {
      const { data } = await apiClient.post<MenuItem>('/menus/items', {
        ...request,
        restaurantId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item created successfully');
    },
  });
};

export const useUpdateMenuItem = () => {
  const restaurantId = useRestaurantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateMenuItemRequest }) => {
      await apiClient.put(`/menus/items/${id}?restaurantId=${restaurantId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item updated successfully');
    },
  });
};

export const useDeleteMenuItem = () => {
  const restaurantId = useRestaurantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/menus/items/${id}?restaurantId=${restaurantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item deleted successfully');
    },
  });
};

export const useToggleItemAvailability = () => {
  const restaurantId = useRestaurantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.put(`/menus/items/${id}/toggle-availability?restaurantId=${restaurantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};
