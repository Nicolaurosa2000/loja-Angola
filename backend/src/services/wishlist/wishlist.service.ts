import { WishlistRepository } from '../../repositories/wishlist.repository';
import { ProductRepository } from '../../repositories/product.repository';
import { AppError } from '../../middlewares';

export class WishlistService {
  private repository: WishlistRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.repository = new WishlistRepository();
    this.productRepository = new ProductRepository();
  }

  async findAll(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async add(userId: string, productId: string) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new AppError('Product not found', 404);

    const existing = await this.repository.findByUserAndProduct(userId, productId);
    if (existing) throw new AppError('Product already in wishlist', 409);

    return this.repository.create(userId, productId);
  }

  async remove(userId: string, productId: string) {
    const item = await this.repository.findByUserAndProduct(userId, productId);
    if (!item) throw new AppError('Product not in wishlist', 404);

    await this.repository.deleteByUserAndProduct(userId, productId);
  }

  async count(userId: string) {
    return this.repository.count(userId);
  }
}
