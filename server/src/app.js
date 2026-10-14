import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { router } from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientUrl }));
  app.use(express.json({ limit: "100kb" }));
  if (!env.isProduction) app.use(morgan("dev"));

  app.use("/api", router);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
