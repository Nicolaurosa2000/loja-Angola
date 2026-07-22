import api from './api';
import { ApiResponse, Cart } from '../types';

export const cartService = {
  async getCart() {
    const response = await api.get<ApiResponse<Cart>>('/cart');
    return response.data;
  },

  async addItem(productId: string, quantity: number = 1) {
    const response = await api.post<ApiResponse<Cart>>('/cart/items', { productId, quantity });
    return response.data;
  },

  async updateItemQuantity(itemId: string, quantity: number) {
    const response = await api.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  async removeItem(itemId: string) {
    const response = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    return response.data;
  },

  async applyCoupon(code: string) {
    const response = await api.post<ApiResponse<Cart>>('/cart/coupon', { code });
    return response.data;
  },

  async removeCoupon() {
    const response = await api.delete<ApiResponse<Cart>>('/cart/coupon');
    return response.data;
  },
};
