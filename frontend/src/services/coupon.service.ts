import api from './api';
import { ApiResponse, Coupon, PaginationMeta } from '../types';

export const couponService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) {
    const response = await api.get<ApiResponse<Coupon[]> & { meta: PaginationMeta }>('/admin/coupons', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Coupon>>(`/admin/coupons/${id}`);
    return response.data;
  },

  async create(data: Partial<Coupon>) {
    const response = await api.post<ApiResponse<Coupon>>('/admin/coupons', data);
    return response.data;
  },

  async update(id: string, data: Partial<Coupon>) {
    const response = await api.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/admin/coupons/${id}`);
    return response.data;
  },
};
