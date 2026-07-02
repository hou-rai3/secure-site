import { cookies } from "next/headers";
import { prisma } from "@/libs/prisma";
import {
  hashSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieOptions,
} from "@/app/api/_helper/sessionToken";

const findValidSession = async () => {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionTokenHash: hashSessionToken(rawToken) },
    include: { user: true },
  });

  const now = new Date();
  if (
    !session ||
    session.expiresAt <= now ||
    session.revokedAt !== null ||
    session.user.status !== "ACTIVE"
  ) {
    return null;
  }

  return { session, rawToken };
};

export const verifySession = async (): Promise<string | null> => {
  const result = await findValidSession();
  if (!result) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, "", sessionCookieOptions(0));
    return null;
  }

  const newExpiry = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await prisma.session.update({
    where: { id: result.session.id },
    data: { expiresAt: newExpiry },
  });

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    result.rawToken,
    sessionCookieOptions(SESSION_MAX_AGE_SECONDS),
  );

  return result.session.userId;
};

export const getCurrentUser = async () => {
  const result = await findValidSession();
  if (!result) return null;

  return prisma.user.findUnique({
    where: { id: result.session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
};
