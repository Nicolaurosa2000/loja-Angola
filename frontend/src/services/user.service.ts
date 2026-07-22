import api from './api';
import { ApiResponse, User, PaginationMeta } from '../types';

export const userService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; role?: string; isActive?: boolean }) {
    const response = await api.get<ApiResponse<User[]> & { meta: PaginationMeta }>('/admin/users', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },

  async create(data: Partial<User>) {
    const response = await api.post<ApiResponse<User>>('/admin/users', data);
    return response.data;
  },

  async update(id: string, data: Partial<User>) {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/admin/users/${id}`);
    return response.data;
  },

  async toggleActive(id: string) {
    const response = await api.patch<ApiResponse<User>>(`/admin/users/${id}/toggle-active`);
    return response.data;
  },
};
