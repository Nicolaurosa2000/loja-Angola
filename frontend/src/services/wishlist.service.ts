import api from './api';
import { ApiResponse } from '../types';

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    promotionalPrice?: number;
    images: { url: string; isCover: boolean }[];
  };
  createdAt: string;
}

export const wishlistService = {
  async getAll() {
    const response = await api.get<ApiResponse<WishlistItem[]>>('/wishlist');
    return response.data;
  },

  async add(productId: string) {
    const response = await api.post<ApiResponse<WishlistItem>>('/wishlist', { productId });
    return response.data;
  },

  async remove(productId: string) {
    const response = await api.delete<ApiResponse<null>>(`/wishlist/${productId}`);
    return response.data;
  },

  async count() {
    const response = await api.get<ApiResponse<{ total: number }>>('/wishlist/count');
    return response.data;
  },
};
