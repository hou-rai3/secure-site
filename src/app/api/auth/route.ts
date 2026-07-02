import type { UserProfile } from "@/app/_types/UserProfile";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/_helper/verifySession";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const GET = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "ログインが必要です。",
      };
      return NextResponse.json(res, { status: 401 });
    }

    const res: ApiResponse<UserProfile> = {
      success: true,
      payload: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
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
      message: "認証状態の確認に失敗しました。",
    };
    return NextResponse.json(res, { status: 500 });
  }
};
