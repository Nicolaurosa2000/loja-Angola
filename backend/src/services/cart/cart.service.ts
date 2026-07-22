import { CartRepository } from '../../repositories/cart.repository';
import { ProductRepository } from '../../repositories/product.repository';
import { AppError } from '../../middlewares';
import { prisma } from '../../config/database';

export class CartService {
  private repository: CartRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.repository = new CartRepository();
    this.productRepository = new ProductRepository();
  }

  async getCart(userId?: string, sessionId?: string) {
    if (userId) {
      let cart = await this.repository.findByUserId(userId);
      if (!cart) {
        cart = await this.repository.create({
          user: { connect: { id: userId } },
        });
      }
      return cart;
    }

    if (sessionId) {
      let cart = await this.repository.findBySessionId(sessionId);
      if (!cart) {
        cart = await this.repository.create({
          sessionId,
        });
      }
      return cart;
    }

    throw new AppError('User or session ID required', 400);
  }

  async addItem(userId: string, productId: string, quantity = 1) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new AppError('Product not found', 404);
    if (!product.isActive || product.status !== 'ACTIVE') {
      throw new AppError('Product is not available', 400);
    }
    if (product.stock < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    let cart = await this.repository.findByUserId(userId);
    if (!cart) {
      cart = await this.repository.create({
        user: { connect: { id: userId } },
      });
    }

    await this.repository.addItem(cart.id, productId, quantity);
    return this.repository.findById(cart.id);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await this.repository.findByUserId(userId);
    if (!cart) throw new AppError('Cart not found', 404);

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new AppError('Item not found in cart', 404);

    if (quantity > item.product.stock) {
      throw new AppError('Insufficient stock', 400);
    }

    await this.repository.updateItemQuantity(itemId, quantity);
    return this.repository.findById(cart.id);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.repository.findByUserId(userId);
    if (!cart) throw new AppError('Cart not found', 404);

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new AppError('Item not found in cart', 404);

    await this.repository.removeItem(itemId);
    return this.repository.findById(cart.id);
  }

  async applyCoupon(userId: string, code: string) {
    const cart = await this.repository.findByUserId(userId);
    if (!cart) throw new AppError('Cart not found', 404);

    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), isActive: true, deletedAt: null },
    });
    if (!coupon) throw new AppError('Invalid coupon code', 404);

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new AppError('Coupon has expired', 400);
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new AppError('Coupon has reached maximum usage', 400);
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + (item.product.promotionalPrice || item.product.price) * item.quantity,
      0
    );

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      throw new AppError(`Minimum order value of ${coupon.minOrderValue} Kz required`, 400);
    }

    const usages = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });

    if (coupon.maxUsesPerUser && usages >= coupon.maxUsesPerUser) {
      throw new AppError('You have already used this coupon', 400);
    }

    return this.repository.applyCoupon(cart.id, coupon.id);
  }

  async removeCoupon(userId: string) {
    const cart = await this.repository.findByUserId(userId);
    if (!cart) throw new AppError('Cart not found', 404);

    return this.repository.removeCoupon(cart.id);
  }

  async clearCart(userId: string) {
    const cart = await this.repository.findByUserId(userId);
    if (!cart) throw new AppError('Cart not found', 404);

    await this.repository.clearCart(cart.id);
    return this.repository.findById(cart.id);
  }
}
