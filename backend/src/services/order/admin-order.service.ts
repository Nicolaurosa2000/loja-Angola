import { OrderRepository } from '../../repositories/order.repository';
import { PaymentService } from '../payment/payment.service';
import { AppError } from '../../middlewares';
import { prisma } from '../../config/database';

export class AdminOrderService {
  private repository: OrderRepository;
  private paymentService: PaymentService;

  constructor() {
    this.repository = new OrderRepository();
    this.paymentService = new PaymentService();
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.repository.findAllAdmin(params);
  }

  async findById(id: string) {
    const order = await this.repository.findByIdAdmin(id);
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  async updateStatus(id: string, data: { status: string; notes?: string }) {
    const order = await this.repository.findById(id);
    if (!order) throw new AppError('Order not found', 404);

    const now = new Date();
    const updateData: any = { status: data.status };

    if (data.status === 'PAID') updateData.paidAt = now;
    if (data.status === 'CANCELLED') updateData.cancelledAt = now;
    if (data.status === 'DELIVERED') updateData.deliveredAt = now;
    if (data.notes) updateData.notes = data.notes;

    if (data.status === 'PAID') {
      await this.repository.updatePayment(id, {
        paymentStatus: 'PAID',
        paidAt: now,
      });
      await this.repository.updateTransaction(id, { status: 'PAID' });
    }

    if (data.status === 'CANCELLED') {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    return this.repository.update(id, updateData);
  }

  async updatePayment(id: string, data: { paymentStatus: string; transactionId?: string; notes?: string }) {
    const order = await this.repository.findById(id);
    if (!order) throw new AppError('Order not found', 404);

    const updateData: any = { paymentStatus: data.paymentStatus };
    if (data.paymentStatus === 'PAID') updateData.paidAt = new Date();
    if (data.notes) updateData.notes = data.notes;

    await this.repository.updateTransaction(id, {
      status: data.paymentStatus,
      transactionId: data.transactionId,
    });

    if (data.paymentStatus === 'PAID') {
      updateData.status = 'PAID';
      await this.repository.updatePayment(id, {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      });
    }

    return this.repository.update(id, {
      paymentStatus: data.paymentStatus,
      paidAt: data.paymentStatus === 'PAID' ? new Date() : undefined,
    });
  }
}
