"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupRequestSchema, SignupRequest } from "@/app/_types/SignupRequest";
import { getPasswordStrength } from "@/app/_types/CommonSchemas";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  faEye,
  faEyeSlash,
  faSpinner,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signupServerAction } from "@/app/_actions/signup";

const strengthLabel = {
  weak: "weak",
  medium: "medium",
  strong: "strong",
} as const;

const Page: React.FC = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSignUpCompleted, setIsSignUpCompleted] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formMethods = useForm<SignupRequest>({
    mode: "onChange",
    resolver: zodResolver(signupRequestSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const fieldErrors = formMethods.formState.errors;
  const passwordStrength = useMemo(
    () => getPasswordStrength(passwordValue),
    [passwordValue],
  );

  const { onChange: onPasswordChange, ...passwordRegister } =
    formMethods.register("password");

  const setRootError = (errorMsg: string) => {
    formMethods.setError("root", { type: "manual", message: errorMsg });
  };

  useEffect(() => {
    if (isSignUpCompleted) {
      router.replace(
        `/login?email=${encodeURIComponent(formMethods.getValues("email"))}`,
      );
      router.refresh();
    }
  }, [formMethods, isSignUpCompleted, router]);

  const onSubmit = async (signupRequest: SignupRequest) => {
    startTransition(async () => {
      const res = await signupServerAction(signupRequest);
      if (!res.success) {
        setRootError(res.message);
        return;
      }
      setIsSignUpCompleted(true);
    });
  };

  return (
    <main className="mx-auto max-w-xl rounded-md border border-emerald-200 bg-white p-6 shadow-lg shadow-emerald-900/10 md:p-8">
      <div className="text-4xl font-black text-slate-900">
        <FontAwesomeIcon icon={faUserPlus} className="mr-2 text-emerald-500" />
        新規登録
      </div>
      <p className="mt-3 text-slate-600">
        安全なパスワードでアカウントを作成してください。
      </p>

      <form
        noValidate
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className="mt-6 flex flex-col gap-y-5"
      >
        <div>
          <label htmlFor="name" className="mb-2 block text-lg font-bold text-slate-900">
            表示名
          </label>
          <TextInputField
            {...formMethods.register("name")}
            id="name"
            placeholder="山田 太郎"
            type="text"
            disabled={isPending || isSignUpCompleted}
            error={!!fieldErrors.name}
            autoComplete="name"
          />
          <ErrorMsgField msg={fieldErrors.name?.message} />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-lg font-bold text-slate-900">
            メールアドレス
          </label>
          <TextInputField
            {...formMethods.register("email")}
            id="email"
            placeholder="name@example.com"
            type="email"
            disabled={isPending || isSignUpCompleted}
            error={!!fieldErrors.email}
            autoComplete="email"
          />
          <ErrorMsgField msg={fieldErrors.email?.message} />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-lg font-bold text-slate-900">
            パスワード
          </label>
          <div className="flex gap-2">
            <TextInputField
              {...passwordRegister}
              onChange={(event) => {
                onPasswordChange(event);
                setPasswordValue(event.target.value);
              }}
              id="password"
              placeholder="12文字以上、大文字・小文字・数字・記号を含める"
              type={showPassword ? "text" : "password"}
              disabled={isPending || isSignUpCompleted}
              error={!!fieldErrors.password}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="min-w-14 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-emerald-700 hover:bg-emerald-100"
              onClick={() => setShowPassword((value) => !value)}
              aria-label="パスワード表示切り替え"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-slate-700">
            パスワード強度: {passwordValue ? strengthLabel[passwordStrength] : "未入力"}
          </div>
          <ErrorMsgField msg={fieldErrors.password?.message} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-lg font-bold text-slate-900">
            確認用パスワード
          </label>
          <div className="flex gap-2">
            <TextInputField
              {...formMethods.register("confirmPassword")}
              id="confirmPassword"
              placeholder="同じパスワードを入力"
              type={showConfirmPassword ? "text" : "password"}
              disabled={isPending || isSignUpCompleted}
              error={!!fieldErrors.confirmPassword}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="min-w-14 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-emerald-700 hover:bg-emerald-100"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label="確認用パスワード表示切り替え"
            >
              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          <ErrorMsgField msg={fieldErrors.confirmPassword?.message} />
          <ErrorMsgField msg={fieldErrors.root?.message} />
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className="tracking-widest"
          isBusy={isPending}
          disabled={!formMethods.formState.isValid || isPending || isSignUpCompleted}
        >
          登録
        </Button>
      </form>

      {isSignUpCompleted && (
        <div className="mt-4 flex items-center gap-x-2 text-emerald-700">
          <FontAwesomeIcon icon={faSpinner} spin />
          <div>
            登録が完了しました。
            <NextLink href="/login" className="ml-1 font-bold hover:underline">
              ログイン画面へ
            </NextLink>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
