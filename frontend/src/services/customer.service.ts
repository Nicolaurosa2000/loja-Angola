import api from './api';
import { ApiResponse, User, PaginationMeta } from '../types';

export const customerService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) {
    const response = await api.get<ApiResponse<User[]> & { meta: PaginationMeta }>('/admin/customers', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<User>>(`/admin/customers/${id}`);
    return response.data;
  },

  async toggleActive(id: string) {
    const response = await api.patch<ApiResponse<User>>(`/admin/customers/${id}/toggle-active`);
    return response.data;
  },
};
