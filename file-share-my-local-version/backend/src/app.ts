import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./config/env";
import { authRouter } from "./routes/auth";
import { filesRouter } from "./routes/files";
import { sharesRouter } from "./routes/shares";
import { errorHandler } from "./middleware/error";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: env.FRONTEND_URL,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.onError(errorHandler);

app.route("/auth", authRouter);
app.route("/files", filesRouter);
app.route("/shares", sharesRouter);

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

export default app;
