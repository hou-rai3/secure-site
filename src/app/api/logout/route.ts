import { prisma } from "@/libs/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import {
  hashSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/app/api/_helper/sessionToken";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const DELETE = async () => {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (rawToken) {
      await prisma.session.updateMany({
        where: {
          sessionTokenHash: hashSessionToken(rawToken),
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    }

    cookieStore.set(SESSION_COOKIE_NAME, "", sessionCookieOptions(0));

    const res: ApiResponse<null> = {
      success: true,
      payload: null,
      message: "ログアウトしました。",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);

    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ログアウト処理に失敗しました。",
    };
    return NextResponse.json(res, { status: 500 });
  }
};
