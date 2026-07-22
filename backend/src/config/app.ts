import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const appConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  apiPrefix: process.env.API_PREFIX || "/api",

  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },

  upload: {
    dir: process.env.UPLOAD_DIR || "./uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10),
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "300", 10),
    authWindowMs: parseInt(
      process.env.AUTH_RATE_LIMIT_WINDOW_MS || "900000",
      10,
    ),
    authMaxRequests: parseInt(
      process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || "30",
      10,
    ),
  },
} as const;

export const isProduction = appConfig.nodeEnv === "production";
export const isDevelopment = appConfig.nodeEnv === "development";
