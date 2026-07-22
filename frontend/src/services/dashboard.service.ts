import api from './api';
import { ApiResponse, DashboardOverview } from '../types';

export const dashboardService = {
  async getOverview(period?: string) {
    const response = await api.get<ApiResponse<DashboardOverview>>('/admin/dashboard/overview', { params: { period } });
    return response.data;
  },

  async getRecentOrders(limit?: number) {
    const response = await api.get<ApiResponse<any[]>>('/admin/dashboard/recent-orders', { params: { limit } });
    return response.data;
  },

  async getTopProducts(limit?: number) {
    const response = await api.get<ApiResponse<any[]>>('/admin/dashboard/top-products', { params: { limit } });
    return response.data;
  },

  async getSales(startDate?: string, endDate?: string) {
    const response = await api.get<ApiResponse<any[]>>('/admin/dashboard/sales', { params: { startDate, endDate } });
    return response.data;
  },
};
