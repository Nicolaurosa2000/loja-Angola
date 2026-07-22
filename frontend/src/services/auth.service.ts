import api from './api';
import { AuthResponse, ApiResponse, User } from '../types';

export const authService = {
  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken });
    return response.data;
  },

  async getProfile() {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  async updateProfile(data: { name?: string; phone?: string }) {
    const response = await api.patch<ApiResponse<User>>('/auth/me', data);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await api.patch<ApiResponse<null>>('/auth/change-password', data);
    return response.data;
  },
};
