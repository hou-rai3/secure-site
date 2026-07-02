import bcrypt from "bcryptjs";
import { prisma } from "@/libs/prisma";
import { loginRequestSchema } from "@/app/_types/LoginRequest";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { createSession } from "@/app/api/_helper/createSession";
import {
  getClientIp,
  SESSION_MAX_AGE_SECONDS,
} from "@/app/api/_helper/sessionToken";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_FAILURES = 5;

const recordLoginHistory = async (params: {
  userId?: string | null;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  reason: string;
}) => {
  await prisma.loginHistory.create({ data: params });
};

const isRateLimited = async (email: string, ipAddress: string) => {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const failures = await prisma.loginHistory.count({
    where: {
      success: false,
      createdAt: { gte: since },
      OR: [{ email }, { ipAddress }],
    },
  });
  return failures >= RATE_LIMIT_MAX_FAILURES;
};

export const POST = async (req: NextRequest) => {
  const ipAddress = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const result = loginRequestSchema.safeParse(await req.json());
    if (!result.success) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "メールアドレスまたはパスワードが正しくありません。",
      };
      return NextResponse.json(res, { status: 400 });
    }

    const loginRequest = result.data;
    if (await isRateLimited(loginRequest.email, ipAddress)) {
      await recordLoginHistory({
        email: loginRequest.email,
        ipAddress,
        userAgent,
        success: false,
        reason: "rate_limited",
      });
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "ログイン試行が多すぎます。しばらく待ってから再試行してください。",
      };
      return NextResponse.json(res, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email: loginRequest.email },
    });

    const isValidPassword =
      !!user && (await bcrypt.compare(loginRequest.password, user.passwordHash));

    if (!user || !isValidPassword) {
      await recordLoginHistory({
        userId: user?.id,
        email: loginRequest.email,
        ipAddress,
        userAgent,
        success: false,
        reason: user ? "invalid_password" : "user_not_found",
      });
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "メールアドレスまたはパスワードが正しくありません。",
      };
      return NextResponse.json(res, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      await recordLoginHistory({
        userId: user.id,
        email: loginRequest.email,
        ipAddress,
        userAgent,
        success: false,
        reason: "suspended",
      });
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "このアカウントは停止されています。",
      };
      return NextResponse.json(res, { status: 403 });
    }

    await createSession(user.id, SESSION_MAX_AGE_SECONDS, req);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await recordLoginHistory({
      userId: user.id,
      email: loginRequest.email,
      ipAddress,
      userAgent,
      success: true,
      reason: "success",
    });

    const res: ApiResponse<UserProfile> = {
      success: true,
      payload: userProfileSchema.parse(user),
      message: "",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ログイン処理に失敗しました。",
    };
    return NextResponse.json(res, { status: 500 });
  }
};
