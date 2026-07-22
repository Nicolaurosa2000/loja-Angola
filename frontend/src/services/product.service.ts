import api from './api';
import { ApiResponse, Product, Category, PaginationMeta } from '../types';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productService = {
  async getAll(filters: ProductFilters = {}) {
    const response = await api.get<ApiResponse<Product[]> & { meta: PaginationMeta }>('/products', {
      params: filters,
    });
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await api.get<ApiResponse<Product>>(`/products/${slug}`);
    return response.data;
  },

  async getFeatured() {
    const response = await api.get<ApiResponse<Product[]>>('/products/featured');
    return response.data;
  },

  async getCategories() {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  async getByCategory(slug: string, filters: ProductFilters = {}) {
    const response = await api.get<ApiResponse<Product[]> & { meta: PaginationMeta }>(
      `/categories/${slug}/products`,
      { params: filters }
    );
    return response.data;
  },
};
