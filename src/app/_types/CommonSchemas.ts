import { z } from "zod";
import { Role } from "./Role";
import { UserStatus } from "./UserStatus";

export const emailSchema = z.string().email("メールアドレスの形式が正しくありません。");
export const userNameSchema = z.string().min(1, "表示名を入力してください。");
export const roleSchema = z.enum(Role);
export const userStatusSchema = z.enum(UserStatus);

export const passwordSchema = z
  .string()
  .min(12, "パスワードは12文字以上にしてください。")
  .refine((value) => /[a-z]/.test(value), "小文字を含めてください。")
  .refine((value) => /[A-Z]/.test(value), "大文字を含めてください。")
  .refine((value) => /[0-9]/.test(value), "数字を含めてください。")
  .refine((value) => /[^A-Za-z0-9]/.test(value), "記号を含めてください。");

export type PasswordStrength = "weak" | "medium" | "strong";

export const getPasswordStrength = (password: string): PasswordStrength => {
  const variety = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (password.length >= 12 && variety === 4) return "strong";
  if (password.length >= 8 && variety >= 2) return "medium";
  return "weak";
};

export const isUUID = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

export const uuidSchema = z.string().refine(isUUID, {
  message: "Invalid UUID format.",
});

export const aboutContentSchema = z.string().min(0).max(5000);
export const aboutSlugSchema = z
  .string()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine(
    (val) =>
      val === null ||
      (val.length >= 4 && val.length <= 16 && /^[a-z0-9-]+$/.test(val)),
    {
      message: "4から16文字の英小文字、数字、ハイフンのみ使用できます。",
    },
  );
