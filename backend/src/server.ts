import app from './app';
import { appConfig } from './config/app';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  app.listen(appConfig.port, () => {
    logger.info(`[nodemon] Running on port ${appConfig.port} in ${appConfig.nodeEnv} mode`);
    logger.info(`[nodemon] Health check: http://localhost:${appConfig.port}/health`);
    logger.info(`[nodemon] API: http://localhost:${appConfig.port}${appConfig.apiPrefix}`);
  });
}

bootstrap().catch((error) => {
  logger.error('[nodemon] Failed to start:', error);
  process.exit(1);
});
