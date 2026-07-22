import api from './api';
import { ApiResponse, PaginationMeta } from '../types';

export interface Setting {
  id: string;
  key: string;
  value: string;
  group?: string;
  createdAt: string;
  updatedAt: string;
}

export const settingsService = {
  async getAll(params?: { page?: number; limit?: number; group?: string }) {
    const response = await api.get<ApiResponse<Setting[]> & { meta: PaginationMeta }>('/admin/settings', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Setting>>(`/admin/settings/${id}`);
    return response.data;
  },

  async getByKey(key: string) {
    const response = await api.get<ApiResponse<Setting>>(`/admin/settings/key/${key}`);
    return response.data;
  },

  async create(data: { key: string; value: string; group?: string }) {
    const response = await api.post<ApiResponse<Setting>>('/admin/settings', data);
    return response.data;
  },

  async update(id: string, data: { value?: string; group?: string }) {
    const response = await api.put<ApiResponse<Setting>>(`/admin/settings/${id}`, data);
    return response.data;
  },
};
