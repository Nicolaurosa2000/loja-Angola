import type { Request } from "express";
import rateLimit, { type Options } from "express-rate-limit";
import { appConfig } from "../config/app";

type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
  message: string;
};

const isLocalRequest = (req: Request): boolean => {
  const ip = req.ip || req.socket.remoteAddress || "";
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string") {
    const forwardedIps = forwardedFor.split(",").map((value) => value.trim());
    if (
      forwardedIps.some(
        (value) =>
          value === "127.0.0.1" ||
          value === "::1" ||
          value.startsWith("::ffff:127."),
      )
    ) {
      return true;
    }
  }

  return ip === "127.0.0.1" || ip === "::1" || ip.startsWith("::ffff:127.");
};

export const createRateLimitConfig = ({
  windowMs,
  maxRequests,
  message,
}: RateLimitConfig): Partial<Options> => ({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => appConfig.nodeEnv === "development" && isLocalRequest(req),
  message: {
    success: false,
    message,
  },
});

export const apiLimiter = rateLimit(
  createRateLimitConfig({
    windowMs: appConfig.rateLimit.windowMs,
    maxRequests: appConfig.rateLimit.maxRequests,
    message: "Too many requests, please try again later.",
  }),
);

export const authLimiter = rateLimit(
  createRateLimitConfig({
    windowMs: appConfig.rateLimit.authWindowMs,
    maxRequests: appConfig.rateLimit.authMaxRequests,
    message: "Too many authentication attempts, please try again later.",
  }),
);
