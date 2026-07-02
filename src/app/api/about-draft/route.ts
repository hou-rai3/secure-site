import { prisma } from "@/libs/prisma";
import { aboutSchema } from "@/app/_types/About";
import type { About } from "@/app/_types/About";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { verifySession } from "@/app/api/_helper/verifySession";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const GET = async () => {
  try {
    const userId = await verifySession();
    if (!userId) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "ログインが必要です。",
      };
      return NextResponse.json(res, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        aboutSlug: true,
        aboutContent: true,
      },
    });

    if (!user) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "ユーザー情報を取得できませんでした。",
      };
      return NextResponse.json(res, { status: 404 });
    }

    const res: ApiResponse<About> = {
      success: true,
      payload: {
        userName: user.name,
        aboutSlug: user.aboutSlug,
        aboutContent: user.aboutContent,
      },
      message: "",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "プロフィール取得に失敗しました。",
    };
    return NextResponse.json(res, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const userId = await verifySession();
    if (!userId) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "ログインが必要です。",
      };
      return NextResponse.json(res, { status: 401 });
    }

    const result = aboutSchema.safeParse(await req.json());
    if (!result.success) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "入力内容が正しくありません。",
      };
      return NextResponse.json(res, { status: 400 });
    }
    const about = result.data;

    if (about.aboutSlug) {
      const existingUser = await prisma.user.findFirst({
        where: {
          aboutSlug: about.aboutSlug,
          id: { not: userId },
        },
      });
      if (existingUser) {
        const res: ApiResponse<null> = {
          success: false,
          payload: null,
          message: "指定されたURLは既に使用されています。",
        };
        return NextResponse.json(res, { status: 409 });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        aboutSlug: about.aboutSlug,
        aboutContent: about.aboutContent,
      },
      select: {
        name: true,
        aboutSlug: true,
        aboutContent: true,
      },
    });

    const res: ApiResponse<About> = {
      success: true,
      payload: {
        userName: user.name,
        aboutSlug: user.aboutSlug,
        aboutContent: user.aboutContent,
      },
      message: "",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "プロフィール更新に失敗しました。",
    };
    return NextResponse.json(res, { status: 500 });
  }
};
