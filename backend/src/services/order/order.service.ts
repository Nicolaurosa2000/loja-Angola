import { OrderRepository } from '../../repositories/order.repository';
import { CartRepository } from '../../repositories/cart.repository';
import { AddressRepository } from '../../repositories/address.repository';
import { PaymentService } from '../payment/payment.service';
import { AppError } from '../../middlewares';
import { generateOrderNumber } from '../../helpers';
import { prisma } from '../../config/database';
import { uploadService } from '../upload/upload.service';

export class OrderService {
  private repository: OrderRepository;
  private cartRepository: CartRepository;
  private addressRepository: AddressRepository;
  private paymentService: PaymentService;

  constructor() {
    this.repository = new OrderRepository();
    this.cartRepository = new CartRepository();
    this.addressRepository = new AddressRepository();
    this.paymentService = new PaymentService();
  }

  async findAll(userId: string, page = 1, limit = 10) {
    return this.repository.findByUserId(userId, page, limit);
  }

  async findById(id: string, userId: string) {
    const order = await this.repository.findById(id);
    if (!order) throw new AppError('Order not found', 404);
    if (order.userId !== userId) throw new AppError('Unauthorized', 403);
    return order;
  }

  async uploadProof(userId: string, orderId: string, file?: Express.Multer.File) {
    if (!file) throw new AppError('Proof file is required', 400);

    const order = await this.repository.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.userId !== userId) throw new AppError('Unauthorized', 403);

    const uploaded = await uploadService.saveRecord(file);
    const proofNote = `${order.notes ? `${order.notes}\n` : ''}Comprovativo: ${uploaded.url}`;

    await prisma.order.update({
      where: { id: orderId },
      data: { notes: proofNote },
    });

    return { url: uploaded.url };
  }

  async create(userId: string, data: {
    addressId: string;
    paymentMethod: string;
    notes?: string;
    items?: Array<{ productId: string; quantity: number }>;
  }) {
    const address = await this.addressRepository.findById(data.addressId);
    if (!address) throw new AppError('Address not found', 404);
    if (address.userId !== userId) throw new AppError('Unauthorized', 403);

    const directItems = data.items?.length ? data.items : undefined;
    let cart: Awaited<ReturnType<CartRepository['findByUserId']>> | null = null;
    let orderItems: Array<{ productId: string; quantity: number; unitPrice: number; totalPrice: number }> = [];
    let paymentItems: Array<{ name: string; quantity: number; price: number }> = [];
    let subtotal = 0;
    let discountAmount = 0;
    let couponId: string | undefined;

    if (directItems) {
      for (const item of directItems) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new AppError('Product not found', 404);
        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400);
        }

        const unitPrice = product.promotionalPrice || product.price;
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        });

        paymentItems.push({
          name: product.name,
          quantity: item.quantity,
          price: unitPrice,
        });
      }
    } else {
      cart = await this.cartRepository.findByUserId(userId);
      if (!cart || cart.items.length === 0) {
        throw new AppError('Cart is empty', 400);
      }

      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
        }
      }

      subtotal = cart.items.reduce(
        (sum, item) => sum + (item.product.promotionalPrice || item.product.price) * item.quantity,
        0
      );

      if (cart.coupon) {
        const coupon = cart.coupon;

        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
          throw new AppError('Coupon has expired', 400);
        }

        if (coupon.type === 'PERCENTAGE') {
          discountAmount = subtotal * (coupon.value / 100);
        } else if (coupon.type === 'FIXED') {
          discountAmount = coupon.value;
        }

        if (discountAmount > subtotal) {
          discountAmount = subtotal;
        }

        couponId = coupon.id;
      }

      orderItems = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product.promotionalPrice || item.product.price,
        totalPrice: (item.product.promotionalPrice || item.product.price) * item.quantity,
      }));

      paymentItems = cart.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.promotionalPrice || item.product.price,
      }));
    }

    const total = Math.max(0, subtotal - discountAmount);
    const orderNumber = generateOrderNumber();

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: data.addressId,
          status: 'PENDING',
          subtotal,
          discountAmount,
          shippingAmount: 0,
          total,
          paymentMethod: data.paymentMethod,
          paymentStatus: 'PENDING',
          notes: data.notes,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isCover: true }, take: 1 },
                },
              },
            },
          },
          address: true,
          payments: true,
        },
      });

      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });

        await tx.couponUsage.create({
          data: {
            couponId,
            userId,
            orderId: order.id,
          },
        });

        await tx.orderDiscount.create({
          data: {
            couponId,
            orderId: order.id,
            amount: discountAmount,
          },
        });
      }

      if (data.paymentMethod === 'MULTICAIXA_EXPRESS' || data.paymentMethod === 'CASH_ON_DELIVERY') {
        const transaction = await tx.paymentTransaction.create({
          data: {
            orderId: order.id,
            method: data.paymentMethod,
            amount: total,
            status: 'PENDING',
          },
        });

        const user = await tx.user.findUnique({ where: { id: userId } });

        const paymentResult = await this.paymentService.processPayment({
          orderId: order.id,
          amount: total,
          method: data.paymentMethod,
          customerPhone: user?.phone || '',
          metadata: {
            orderNumber,
            customerName: user?.name || '',
            items: paymentItems,
          },
        });

        if (paymentResult.receipt) {
          await tx.paymentTransaction.update({
            where: { id: transaction.id },
            data: {
              transactionId: paymentResult.receipt.orderNumber,
              gatewayResponse: JSON.stringify(paymentResult),
            },
          });
        }
      }

      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.update({
          where: { id: cart.id },
          data: { couponId: null },
        });
      }

      return order;
    });

    if (data.paymentMethod === 'MULTICAIXA_EXPRESS') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const receipt = {
        orderNumber,
        customerName: user?.name || '',
        customerPhone: user?.phone || '',
        items: paymentItems,
        total,
        date: new Date().toLocaleDateString('pt-AO'),
        time: new Date().toLocaleTimeString('pt-AO'),
      };

      const phone = user?.phone || '';
      const whatsappLink = phone ? this.paymentService.generateWhatsAppLink(phone, receipt) : undefined;

      return {
        ...result,
        whatsappLink,
        receipt,
      } as any;
    }

    return result;
  }
}
