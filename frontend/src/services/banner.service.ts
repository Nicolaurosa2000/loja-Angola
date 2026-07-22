import api from './api';
import { ApiResponse, Banner, PaginationMeta } from '../types';

export const bannerService = {
  async getAll(params?: { page?: number; limit?: number; isActive?: boolean }) {
    const response = await api.get<ApiResponse<Banner[]> & { meta: PaginationMeta }>('/admin/banners', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Banner>>(`/admin/banners/${id}`);
    return response.data;
  },

  async create(data: Partial<Banner>) {
    const response = await api.post<ApiResponse<Banner>>('/admin/banners', data);
    return response.data;
  },

  async update(id: string, data: Partial<Banner>) {
    const response = await api.put<ApiResponse<Banner>>(`/admin/banners/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/admin/banners/${id}`);
    return response.data;
  },
};
