"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/libs/prisma";
import { signupRequestSchema } from "@/app/_types/SignupRequest";
import { getPasswordStrength } from "@/app/_types/CommonSchemas";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { SignupRequest } from "@/app/_types/SignupRequest";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ServerActionResponse } from "@/app/_types/ServerActionResponse";

export const signupServerAction = async (
  signupRequest: SignupRequest,
): Promise<ServerActionResponse<UserProfile | null>> => {
  try {
    const payload = signupRequestSchema.parse(signupRequest);

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) {
      return {
        success: false,
        payload: null,
        message: "このメールアドレスは既に使用されています。",
      };
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const now = new Date();
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        passwordHash,
        passwordStrength: getPasswordStrength(payload.password),
        passwordUpdatedAt: now,
        name: payload.name,
      },
    });

    return {
      success: true,
      payload: userProfileSchema.parse(user),
      message: "",
    };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "サインアップ処理に失敗しました。";
    console.error(message);
    return {
      success: false,
      payload: null,
      message,
    };
  }
};
