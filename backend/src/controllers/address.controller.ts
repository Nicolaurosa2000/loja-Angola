import { Request, Response, NextFunction } from 'express';
import { AddressService } from '../services/address/address.service';
import { sendSuccess, sendCreated } from '../utils/api-response';

export class AddressController {
  private service: AddressService;

  constructor() {
    this.service = new AddressService();
  }

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const addresses = await this.service.findAll(userId);
      sendSuccess(res, addresses);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const address = await this.service.findById(req.params.id, userId);
      sendSuccess(res, address);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const address = await this.service.create(userId, req.body);
      sendCreated(res, address, 'Address created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const address = await this.service.update(req.params.id, userId, req.body);
      sendSuccess(res, address, 'Address updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      await this.service.delete(req.params.id, userId);
      sendSuccess(res, null, 'Address deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
