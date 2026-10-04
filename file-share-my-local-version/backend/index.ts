import app from "./src/app";
import { env } from "./src/config/env";

console.log(`Starting secure file sharing backend on port ${env.PORT}...`);

export default {
  port: env.PORT,
  fetch: app.fetch,
};