import api from './api';
import { ApiResponse, Order, PaginationMeta } from '../types';

export const orderService = {
  async create(data: { addressId: string; paymentMethod: string; notes?: string; items?: Array<{ productId: string; quantity: number }> }) {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  async uploadProof(orderId: string, formData: FormData) {
    const response = await api.post<ApiResponse<{ url: string }>>(`/orders/${orderId}/proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getAll(page: number = 1, limit: number = 10) {
    const response = await api.get<ApiResponse<Order[]> & { meta: PaginationMeta }>('/orders', {
      params: { page, limit },
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },
};
