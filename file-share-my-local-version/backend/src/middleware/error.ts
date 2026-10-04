import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json({ detail: err.message }, err.status);
  }

  console.error("Unhandled Error:", err);
  return c.json({ detail: "Internal Server Error" }, 500);
}
