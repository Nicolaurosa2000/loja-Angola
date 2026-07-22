import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings/settings.service';
import { sendSuccess, sendCreated } from '../utils/api-response';

export class AdminSettingsController {
  private service: SettingsService;

  constructor() {
    this.service = new SettingsService();
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.service.findAll(req.query.group as string);
      sendSuccess(res, settings);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const setting = await this.service.findById(req.params.id);
      sendSuccess(res, setting);
    } catch (error) {
      next(error);
    }
  };

  findByKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const setting = await this.service.findByKey(req.params.key);
      sendSuccess(res, setting);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const setting = await this.service.create(req.body);
      sendCreated(res, setting, 'Setting created');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const setting = await this.service.update(req.params.id, req.body);
      sendSuccess(res, setting, 'Setting updated');
    } catch (error) {
      next(error);
    }
  };
}
