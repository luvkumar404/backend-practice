import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET_KEY: z.string(),
  JWT_ALGORITHM: z.string().default("HS256"),
  ACCESS_TOKEN_EXPIRE_MINUTES: z.coerce.number().default(60),

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  PORT: z.coerce.number().default(8000),
});

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error("Invalid environment variables:", envResult.error.format());
  process.exit(1);
}

export const env = envResult.data;
export const MAX_FILE_SIZE_BYTES = env.MAX_FILE_SIZE_MB * 1024 * 1024;
