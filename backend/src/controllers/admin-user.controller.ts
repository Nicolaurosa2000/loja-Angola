import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user/user.service';
import { sendSuccess, sendCreated } from '../utils/api-response';
import { getPaginationMeta, getPaginationParams } from '../utils/pagination';

export class AdminUserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = getPaginationParams(req.query as any);
      const { items, total } = await this.service.findAll({
        page,
        limit,
        search: req.query.search as string,
        role: req.query.role as string,
      });
      sendSuccess(res, items, 'Success', 200, getPaginationMeta(total, page, limit));
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.findById(req.params.id);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.create(req.body);
      sendCreated(res, user, 'User created');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.update(req.params.id, req.body);
      sendSuccess(res, user, 'User updated');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      sendSuccess(res, null, 'User deleted');
    } catch (error) {
      next(error);
    }
  };

  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.toggleActive(req.params.id);
      sendSuccess(res, user, 'User status updated');
    } catch (error) {
      next(error);
    }
  };
}
