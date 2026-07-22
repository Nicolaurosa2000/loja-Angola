import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

const methodToAction: Record<string, string> = {
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
  GET: 'read',
};

function extractEntityName(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last) return 'unknown';
  const withoutId = last.replace(/^[0-9a-f-]{36}$/, '');
  if (withoutId) return withoutId.replace(/s$/, '');
  if (parts.length >= 2) return parts[parts.length - 2].replace(/s$/, '');
  return last.replace(/s$/, '');
}

export function auditLog(action: string, resource: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400) {
        const resourceId = req.params.id || body?.data?.id || undefined;
        const url = req.originalUrl || req.path || '';
        const detectedAction = methodToAction[req.method] || req.method.toLowerCase();
        const entityName = extractEntityName(url);

        prisma.auditLog
          .create({
            data: {
              action,
              resource,
              resourceId: resourceId as string | undefined,
              details: JSON.stringify({
                method: req.method,
                path: req.path,
                originalUrl: req.originalUrl,
                params: req.params,
                detectedAction,
                entityName,
              }),
              ip: req.ip,
              userAgent: req.headers['user-agent'],
              userId: req.user?.sub,
            },
          })
          .catch((err) => console.error('[AuditLog] Failed to create:', err));
      }
      return originalJson(body);
    };
    next();
  };
}
