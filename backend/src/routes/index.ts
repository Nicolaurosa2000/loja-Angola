import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import brandRoutes from './brand.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import addressRoutes from './address.routes';
import wishlistRoutes from './wishlist.routes';
import uploadRoutes from './upload.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/brands', brandRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/addresses', addressRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/uploads', uploadRoutes);
router.use('/admin', adminRoutes);

export default router;
