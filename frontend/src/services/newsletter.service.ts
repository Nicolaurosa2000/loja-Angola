import api from './api';
import { ApiResponse, PaginationMeta } from '../types';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  createdAt: string;
}

export const newsletterService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) {
    const response = await api.get<ApiResponse<NewsletterSubscriber[]> & { meta: PaginationMeta }>('/admin/newsletter', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<NewsletterSubscriber>>(`/admin/newsletter/${id}`);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/admin/newsletter/${id}`);
    return response.data;
  },
};
