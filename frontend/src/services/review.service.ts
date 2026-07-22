import api from './api';
import { ApiResponse, Review, PaginationMeta } from '../types';

export const reviewService = {
  async getAll(params?: { page?: number; limit?: number; status?: string; productId?: string }) {
    const response = await api.get<ApiResponse<Review[]> & { meta: PaginationMeta }>('/admin/reviews', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Review>>(`/admin/reviews/${id}`);
    return response.data;
  },

  async updateStatus(id: string, data: { status: string }) {
    const response = await api.patch<ApiResponse<Review>>(`/admin/reviews/${id}/status`, data);
    return response.data;
  },
};
