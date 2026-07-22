import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { appConfig } from './config/app';
import { swaggerSpec } from './config/swagger';
import { apiLimiter } from './middlewares/rate-limiter';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: appConfig.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(appConfig.upload.dir)));
app.use(appConfig.apiPrefix, apiLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Angola Express API Docs',
}));

app.use('/api/products', (_req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60, s-maxage=120');
  next();
});
app.use('/api/categories', (_req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  next();
});
app.use('/uploads', (_req, res, next) => {
  res.set('Cache-Control', 'public, max-age=86400, immutable');
  next();
});

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

app.use(appConfig.apiPrefix, routes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
export default app;
