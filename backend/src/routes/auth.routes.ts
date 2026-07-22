import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rate-limiter';
import { validate } from '../middlewares/validate';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../dto/auth.dto';

const router = Router();
const controller = new AuthController();

router.post('/register', authLimiter, validate(registerSchema), controller.register);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshTokenSchema), controller.refreshToken);
router.get('/me', authenticate, controller.getProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), controller.updateProfile);
router.patch('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);

export default router;
