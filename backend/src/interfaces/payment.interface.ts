export interface PaymentRequest {
  orderId: string;
  method: string;
  amount: number;
  customerPhone?: string;
  customerEmail?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: string;
  redirectUrl?: string;
  deepLink?: string;
  qrCode?: string;
  receipt?: PaymentReceipt;
  message?: string;
}

export interface PaymentReceipt {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: PaymentReceiptItem[];
  total: number;
  date: string;
  time: string;
}

export interface PaymentReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PaymentVerificationResult {
  status: string;
  transactionId: string;
  paidAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  message?: string;
}
