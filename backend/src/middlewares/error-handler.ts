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

// Helper para garantir cabeçalhos CORS em respostas de erro
const setCorsHeaders = (req: Request, res: Response) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
};

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Injeta cabeçalhos CORS antes de devolver a resposta de erro
  setCorsHeaders(req, res);

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

export function notFoundHandler(req: Request, res: Response): void {
  // Injeta cabeçalhos CORS antes de devolver o 404
  setCorsHeaders(req, res);
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}