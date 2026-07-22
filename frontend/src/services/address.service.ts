import api from './api';
import { ApiResponse, Address } from '../types';

export const addressService = {
  async getAll() {
    const response = await api.get<ApiResponse<Address[]>>('/addresses');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Address>>(`/addresses/${id}`);
    return response.data;
  },

  async create(data: {
    label?: string;
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    city: string;
    province: string;
    zipCode?: string;
    isDefault?: boolean;
  }) {
    const response = await api.post<ApiResponse<Address>>('/addresses', data);
    return response.data;
  },

  async update(id: string, data: Partial<{
    label: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    province: string;
    zipCode: string;
    isDefault: boolean;
  }>) {
    const response = await api.put<ApiResponse<Address>>(`/addresses/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse<null>>(`/addresses/${id}`);
    return response.data;
  },
};
