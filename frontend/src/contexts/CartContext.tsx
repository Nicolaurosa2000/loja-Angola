import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Cart, CartItem, Coupon } from '../types';
import { cartService } from '../services/cart.service';

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  isLoading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const subtotal = cart?.items?.reduce(
    (sum, item) => sum + (item.product.promotionalPrice || item.product.price) * item.quantity,
    0
  ) || 0;

  const discount = cart?.coupon
    ? cart.coupon.type === 'PERCENTAGE'
      ? subtotal * (cart.coupon.value / 100)
      : cart.coupon.value
    : 0;

  const total = Math.max(0, subtotal - discount);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    setIsLoading(true);
    try {
      const response = await cartService.addItem(productId, quantity);
      if (response.data) setCart(response.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setIsLoading(true);
    try {
      const response = await cartService.updateItemQuantity(itemId, quantity);
      if (response.data) setCart(response.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      const response = await cartService.removeItem(itemId);
      if (response.data) setCart(response.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const response = await cartService.applyCoupon(code);
      if (response.data) setCart(response.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await cartService.removeCoupon();
      if (response.data) setCart(response.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart?.items || [],
        itemCount,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        clearCart,
        subtotal,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
