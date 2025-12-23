import { useMutation } from '@tanstack/react-query';
import apiClient from './client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types';

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return data;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const { data: response } = await apiClient.post<AuthResponse>('/auth/register', data);
  return response;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: register,
  });
};
