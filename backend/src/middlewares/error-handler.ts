import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { sendError } from '../utils/api-response';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn(`[AppError] ${err.message}`);
    sendError(res, err.message, err.statusCode);
    return;
  }

  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    logger.warn(`[ValidationError] ${messages}`);
    sendError(res, 'Validation error', 422, messages);
    return;
  }

  if (err.name === 'UnauthorizedError') {
    sendError(res, 'Invalid token', 401);
    return;
  }

  logger.error(`[UnhandledError] ${err.message}`, err.stack);
  sendError(res, 'Internal server error', 500);
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 'Route not found', 404);
}
