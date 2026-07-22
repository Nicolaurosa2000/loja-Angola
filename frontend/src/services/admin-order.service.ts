import api from './api';
import { ApiResponse, Order, PaginationMeta } from '../types';

export interface AdminOrder extends Order {
  user: { id: string; name: string; email: string; phone?: string };
  paymentMethod?: string;
  paymentStatus?: string;
  payments?: { id: string; method: string; amount: number; status: string; transactionId?: string }[];
  whatsappLink?: string;
  receipt?: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    items: { name: string; quantity: number; price: number }[];
    total: number;
    date: string;
    time: string;
  };
}

export const adminOrderService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await api.get<ApiResponse<AdminOrder[]> & { meta: PaginationMeta }>('/admin/orders', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<AdminOrder>>(`/admin/orders/${id}`);
    return response.data;
  },

  async updateStatus(id: string, data: { status: string; notes?: string }) {
    const response = await api.patch<ApiResponse<AdminOrder>>(`/admin/orders/${id}/status`, data);
    return response.data;
  },

  async updatePayment(id: string, data: { paymentStatus: string; transactionId?: string; notes?: string }) {
    const response = await api.patch<ApiResponse<AdminOrder>>(`/admin/orders/${id}/payment`, data);
    return response.data;
  },
};
