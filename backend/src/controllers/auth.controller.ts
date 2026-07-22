import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { sendSuccess, sendCreated } from '../utils/api-response';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      sendCreated(res, result, 'Account created successfully');
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.refreshToken(req.body.refreshToken);
      sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.authService.getProfile(req.user!.sub);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.authService.updateProfile(req.user!.sub, req.body);
      sendSuccess(res, profile, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.changePassword(
        req.user!.sub,
        req.body.currentPassword,
        req.body.newPassword
      );
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  };
}
