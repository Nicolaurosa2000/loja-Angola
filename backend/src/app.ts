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

// 1. CORS deve vir em PRIMEIRO LUGAR (antes do Helmet e de qualquer rota)
app.use(
  cors({
    origin: true, // Aceita dinamicamente qualquer origem requisitante
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Trata requisições preflight (OPTIONS) para todas as rotas
app.options("*", cors());

// 2. Helmet configurado para NÃO bloquear chamadas Cross-Origin em APIs
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos de upload
app.use("/uploads", express.static(path.resolve(appConfig.upload.dir)));

// Documentação Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Angola Express API Docs",
  })
);

// Rota de Healthcheck
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Cache Control Middlewares
app.use("/api/products", (_req, res, next) => {
  res.set("Cache-Control", "public, max-age=60, s-maxage=120");
  next();
});
app.use("/api/categories", (_req, res, next) => {
  res.set("Cache-Control", "public, max-age=300, s-maxage=600");
  next();
});
app.use("/uploads", (_req, res, next) => {
  res.set("Cache-Control", "public, max-age=86400, immutable");
  next();
});

// 3. Aplicação do Rate Limiter e do Roteador Principal
// CERTIFIQUE-SE de que appConfig.apiPrefix no seu .env ou config é "/api" e não "/api/v1"
app.use(appConfig.apiPrefix, apiLimiter);
app.use(appConfig.apiPrefix, routes);

// Tratamento de erros
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
export default app;