import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../interfaces';

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message = 'Success',
  statusCode = 200,
  meta?: PaginationMeta
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data?: T, message = 'Created successfully'): void {
  sendSuccess(res, data, message, 201);
}

export function sendError(
  res: Response,
  message = 'Internal server error',
  statusCode = 500,
  error?: string
): void {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  res.status(statusCode).json(response);
}

export function sendUnauthorized(res: Response, message = 'Unauthorized'): void {
  sendError(res, message, 401);
}

export function sendForbidden(res: Response, message = 'Forbidden'): void {
  sendError(res, message, 403);
}

export function sendNotFound(res: Response, message = 'Resource not found'): void {
  sendError(res, message, 404);
}

export function sendConflict(res: Response, message = 'Resource already exists'): void {
  sendError(res, message, 409);
}

export function sendValidationError(res: Response, message = 'Validation error', error?: string): void {
  sendError(res, message, 422, error);
}
