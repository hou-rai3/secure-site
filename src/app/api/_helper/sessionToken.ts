import crypto from "crypto";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 3;

export const createSessionToken = () => crypto.randomBytes(32).toString("base64url");

export const hashSessionToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const sessionCookieOptions = (maxAge: number) => ({
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge,
  secure: process.env.NODE_ENV === "production",
});

export const getClientIp = (req: NextRequest) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";
