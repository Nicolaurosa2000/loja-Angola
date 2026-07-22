export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "CUSTOMER" | "ADMIN" | "STAFF";
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  fullDescription?: string;
  price: number;
  promotionalPrice?: number;
  sku: string;
  stock: number;
  isFeatured: boolean;
  images: ProductImage[];
  tags: { id: string; name: string }[];
  avgRating?: number;
  category: Category;
  categoryId: string;
  brand?: Brand;
  createdAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isCover: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  coupon?: Coupon;
}

export interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minOrderValue?: number;
}

export interface Address {
  id: string;
  label?: string;
  street: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  province: string;
  zipCode?: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  items: OrderItem[];
  address?: Address;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
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
  createdAt: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "SEPARATING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  sortOrder: number;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  user: { name: string };
  createdAt: string;
}

export interface DashboardOverview {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
  revenueByPeriod: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  recentOrders: Order[];
  topProducts: {
    productId: string;
    product: Product;
    totalSold: number;
    revenue: number;
  }[];
}

export interface FinanceOverview {
  totalRevenue: number;
  pendingRevenue: number;
  refundedAmount: number;
  averageOrderValue: number;
  transactionCount: number;
  paymentMethods: { method: string; amount: number; count: number }[];
  revenueByPeriod: { date: string; revenue: number }[];
  recentTransactions: FinanceTransaction[];
}

export interface FinanceTransaction {
  id: string;
  method: string;
  amount: number;
  status: string;
  createdAt: string;
  order?: {
    id: string;
    orderNumber: string;
    total: number;
    paymentMethod?: string;
    paymentStatus?: string;
    status?: string;
    user?: { id: string; name: string; email: string };
  };
}

export interface CouponInput {
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  isActive?: boolean;
  startsAt?: string;
  expiresAt?: string;
}

export interface BannerInput {
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  position?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface SettingInput {
  key: string;
  value: string;
  group?: string;
}

export interface UserInput {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  isActive?: boolean;
}
