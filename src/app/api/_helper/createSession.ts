import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { prisma } from "@/libs/prisma";
import {
  createSessionToken,
  getClientIp,
  hashSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/app/api/_helper/sessionToken";

export const createSession = async (
  userId: string,
  tokenMaxAgeSeconds: number,
  req: NextRequest,
): Promise<string> => {
  const rawToken = createSessionToken();
  const sessionTokenHash = hashSessionToken(rawToken);

  await prisma.session.create({
    data: {
      userId,
      sessionTokenHash,
      userAgent: req.headers.get("user-agent") || "unknown",
      ipAddress: getClientIp(req),
      expiresAt: new Date(Date.now() + tokenMaxAgeSeconds * 1000),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    rawToken,
    sessionCookieOptions(tokenMaxAgeSeconds),
  );

  return rawToken;
};
