import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { UserCreateSchema, LoginRequestSchema } from "../schemas/auth";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/security";
import { createAccessToken } from "../utils/tokens";
import { authMiddleware } from "../middleware/auth";
import { User } from "@prisma/client";

export const authRouter = new Hono<{ Variables: { user: User } }>();

authRouter.post("/register", zValidator("json", UserCreateSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return c.json({ detail: "A user with this email already exists." }, 409);
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      hashed_password: hashedPassword,
    },
  });

  return c.json({
    id: user.id,
    email: user.email,
    is_active: user.is_active,
    created_at: user.created_at,
  }, 201);
});

authRouter.post("/login", zValidator("json", LoginRequestSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.is_active) {
    return c.json({ detail: "Invalid email or password." }, 401);
  }

  const isValid = await verifyPassword(password, user.hashed_password);
  if (!isValid) {
    return c.json({ detail: "Invalid email or password." }, 401);
  }

  const accessToken = createAccessToken(user.id);
  return c.json({ access_token: accessToken, token_type: "bearer" });
});

authRouter.get("/me", authMiddleware, (c) => {
  const user = c.get("user");
  return c.json({
    id: user.id,
    email: user.email,
    is_active: user.is_active,
    created_at: user.created_at,
  });
});
