import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function createShareToken(): string {
  return randomBytes(32).toString("hex");
}

export function createSafeFilename(extension: string): string {
  const randomName = randomBytes(16).toString("hex");
  return `${randomName}.${extension}`;
}

export function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts[parts.length - 1]?.toLowerCase() ?? "") : "";
}

export function createAccessToken(userId: number): string {
  const payload = { sub: userId.toString() };
  return jwt.sign(payload, env.JWT_SECRET_KEY, {
    algorithm: env.JWT_ALGORITHM as jwt.Algorithm,
    expiresIn: `${env.ACCESS_TOKEN_EXPIRE_MINUTES}m`,
  });
}

export function decodeAccessToken(token: string): number | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET_KEY, {
      algorithms: [env.JWT_ALGORITHM as jwt.Algorithm],
    }) as jwt.JwtPayload;
    if (payload.sub) {
      return parseInt(payload.sub, 10);
    }
    return null;
  } catch (error) {
    return null;
  }
}
