import type { Context, Next } from "hono";
import { decodeAccessToken } from "../utils/tokens";
import { prisma } from "../lib/prisma";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ detail: "Not authenticated" }, 401);
  }

  const token = authHeader.substring(7);
  const userId = decodeAccessToken(token);

  if (!userId) {
    return c.json({ detail: "Invalid or expired token." }, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.is_active) {
    return c.json({ detail: "User not found or inactive." }, 401);
  }

  c.set("user", user);
  await next();
}
