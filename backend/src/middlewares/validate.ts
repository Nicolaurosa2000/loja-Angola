import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendValidationError } from '../utils/api-response';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const messages = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
      sendValidationError(res, 'Validation failed', messages);
      return;
    }

    req[source] = result.data;
    next();
  };
}
