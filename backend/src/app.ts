import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { appConfig } from "./config/app";
import { swaggerSpec } from "./config/swagger";
import { apiLimiter } from "./middlewares/rate-limiter";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import routes from "./routes";

const app = express();

// 1. Configuração Global de CORS (Garante que localhost e Vercel passem sem restrições)
app.use(
  cors({
    origin: true, // Aceita automaticamente qualquer origem requisitante
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

app.options("*", cors());

// 2. Helmet ajustado para permitir recursos compartilhados
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos
app.use("/uploads", express.static(path.resolve(appConfig.upload.dir)));

// Swagger Docs
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Angola Express API Docs",
  })
);

// Healthcheck
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Cache Control
app.use("/api/products", (_req, res, next) => {
  res.set("Cache-Control", "public, max-age=60, s-maxage=120");
  next();
});
app.use("/api/categories", (_req, res, next) => {
  res.set("Cache-Control", "public, max-age=300, s-maxage=600");
  next();
});

// 3. Aplicação do Roteador com prefixo /api
const prefix = appConfig.apiPrefix || "/api";
app.use(prefix, apiLimiter);
app.use(prefix, routes);

// Handlers de erro
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
export default app;