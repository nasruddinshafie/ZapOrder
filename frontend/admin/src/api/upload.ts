import { useMutation } from '@tanstack/react-query';
import apiClient from './client';

interface UploadResponse {
  url: string;
}

export const uploadMenuItemImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<UploadResponse>('/upload/menu-item-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Convert relative URL to absolute URL
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5226';
  const apiUrl = baseURL.replace('/api', '');
  return `${apiUrl}${data.url}`;
};

export const deleteMenuItemImage = async (fileName: string): Promise<void> => {
  await apiClient.delete(`/upload/menu-item-image/${fileName}`);
};

export const useUploadMenuItemImage = () => {
  return useMutation({
    mutationFn: uploadMenuItemImage,
  });
};
