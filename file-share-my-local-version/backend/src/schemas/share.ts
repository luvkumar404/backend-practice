import { z } from "zod";

export const ShareCreateSchema = z.object({
  expires_at: z.string().datetime().transform((str) => new Date(str)),
  password: z.string().optional().nullable(),
});

export const PublicDownloadRequestSchema = z.object({
  password: z.string().optional().nullable(),
});
