import { PaymentRequest, PaymentResult, PaymentReceipt, RefundResult } from '../../interfaces';
import { AppError } from '../../middlewares';

export interface IPaymentService {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(transactionId: string): Promise<PaymentResult>;
  refund(transactionId: string, amount?: number): Promise<RefundResult>;
}

export class MulticaixaExpressService implements IPaymentService {
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    const receipt = this.generateReceipt(request);
    const isMobile = request.metadata?.isMobile === true;

    return {
      success: true,
      status: 'PENDING',
      receipt,
      deepLink: isMobile ? `multicaixaexpress://pay?amount=${request.amount}&reference=${request.orderId}` : undefined,
      message: isMobile
        ? 'A abrir Multicaixa Express...'
        : 'Recibo gerado. Envie via WhatsApp para confirmar o pagamento.',
    };
  }

  async verifyPayment(_transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      status: 'PENDING',
      message: 'Pagamento aguardando confirmação manual do operador.',
    };
  }

  async refund(_transactionId: string, _amount?: number): Promise<RefundResult> {
    return {
      success: true,
      message: 'Reembolso processado manualmente.',
    };
  }

  private generateReceipt(request: PaymentRequest): PaymentReceipt {
    return {
      orderNumber: request.metadata?.orderNumber as string || '',
      customerName: request.metadata?.customerName as string || '',
      customerPhone: request.customerPhone || '',
      items: (request.metadata?.items as any[])?.map((item: any) => ({
        name: item.name || '',
        quantity: item.quantity || 0,
        price: item.price || 0,
      })) || [],
      total: request.amount,
      date: new Date().toLocaleDateString('pt-AO'),
      time: new Date().toLocaleTimeString('pt-AO'),
    };
  }
}

export class CashOnDeliveryService implements IPaymentService {
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    return {
      success: true,
      status: 'PENDING',
      message: 'Pagamento será efectuado no momento da entrega.',
    };
  }

  async verifyPayment(_transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      status: 'PENDING',
    };
  }

  async refund(_transactionId: string, _amount?: number): Promise<RefundResult> {
    return {
      success: true,
      message: 'Reembolso processado.',
    };
  }
}

export class PaymentService {
  private providers: Map<string, IPaymentService>;

  constructor() {
    this.providers = new Map();
    this.providers.set('MULTICAIXA_EXPRESS', new MulticaixaExpressService());
    this.providers.set('CASH_ON_DELIVERY', new CashOnDeliveryService());
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    const provider = this.providers.get(request.method);
    if (!provider) {
      throw new AppError(`Unsupported payment method: ${request.method}`, 400);
    }
    return provider.processPayment(request);
  }

  async verifyPayment(method: string, transactionId: string): Promise<PaymentResult> {
    const provider = this.providers.get(method);
    if (!provider) {
      throw new AppError(`Unsupported payment method: ${method}`, 400);
    }
    return provider.verifyPayment(transactionId);
  }

  async refund(method: string, transactionId: string, amount?: number): Promise<RefundResult> {
    const provider = this.providers.get(method);
    if (!provider) {
      throw new AppError(`Unsupported payment method: ${method}`, 400);
    }
    return provider.refund(transactionId, amount);
  }

  generateWhatsAppLink(phone: string, receipt: PaymentReceipt): string {
    const message = this.formatWhatsAppMessage(receipt);
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${phone.replace(/[+\s]/g, '')}?text=${encoded}`;
  }

  private formatWhatsAppMessage(receipt: PaymentReceipt): string {
    const itemsText = receipt.items
      .map((item) => `${item.name}\nQuantidade: ${item.quantity}\nPreço: ${item.price.toLocaleString('pt-AO')} Kz`)
      .join('\n\n');

    return [
      'Olá,',
      '',
      'Gostaria de finalizar esta compra.',
      '',
      `Pedido Nº ${receipt.orderNumber}`,
      '',
      'Produto(s):',
      itemsText,
      '',
      `Valor Total: ${receipt.total.toLocaleString('pt-AO')} Kz`,
      '',
      `Nome: ${receipt.customerName}`,
      `Telefone: ${receipt.customerPhone}`,
      '',
      'Obrigado.',
    ].join('\n');
  }
}
