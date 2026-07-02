"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequest, loginRequestSchema } from "@/app/_types/LoginRequest";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import { faSpinner, faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import NextLink from "next/link";
import { ApiResponse } from "../_types/ApiResponse";
import { mutate } from "swr";
import { useRouter } from "next/navigation";

const Page: React.FC = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isLoginCompleted, setIsLoginCompleted] = useState(false);

  const formMethods = useForm<LoginRequest>({
    mode: "onChange",
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: "", password: "" },
  });
  const fieldErrors = formMethods.formState.errors;

  const setRootError = (errorMsg: string) => {
    formMethods.setError("root", { type: "manual", message: errorMsg });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    formMethods.setValue("email", searchParams.get("email") || "");
  }, [formMethods]);

  useEffect(() => {
    if (isLoginCompleted) {
      router.replace("/dashboard");
      router.refresh();
    }
  }, [isLoginCompleted, router]);

  const onSubmit = async (formValues: LoginRequest) => {
    try {
      setIsPending(true);
      formMethods.clearErrors("root");
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
        credentials: "same-origin",
        cache: "no-store",
      });
      const body = (await res.json()) as ApiResponse<unknown>;
      if (!res.ok || !body.success) {
        setRootError(body.message || "ログインに失敗しました。");
        return;
      }
      mutate("/api/auth", body);
      setIsLoginCompleted(true);
    } catch (e) {
      setRootError(
        e instanceof Error
          ? e.message
          : "予期しないエラーが発生しました。",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl rounded-md border border-emerald-200 bg-white p-6 shadow-lg shadow-emerald-900/10 md:p-8">
      <div className="text-4xl font-black text-slate-900">
        <FontAwesomeIcon icon={faRightToBracket} className="mr-2 text-emerald-500" />
        ログイン
      </div>
      <p className="mt-3 text-slate-600">
        メールアドレスとパスワードを入力してください。
      </p>
      <form
        noValidate
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className={twMerge(
          "mt-6 flex flex-col gap-y-5",
          isLoginCompleted && "cursor-not-allowed opacity-50",
        )}
      >
        <div>
          <label htmlFor="email" className="mb-2 block text-lg font-bold text-slate-900">
            メールアドレス
          </label>
          <TextInputField
            {...formMethods.register("email")}
            id="email"
            placeholder="name@example.com"
            type="email"
            disabled={isPending || isLoginCompleted}
            error={!!fieldErrors.email}
            autoComplete="email"
          />
          <ErrorMsgField msg={fieldErrors.email?.message} />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-lg font-bold text-slate-900">
            パスワード
          </label>
          <TextInputField
            {...formMethods.register("password")}
            id="password"
            placeholder="************"
            type="password"
            disabled={isPending || isLoginCompleted}
            error={!!fieldErrors.password}
            autoComplete="current-password"
          />
          <ErrorMsgField msg={fieldErrors.password?.message} />
          <ErrorMsgField msg={fieldErrors.root?.message} />
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className="tracking-widest"
          isBusy={isPending}
          disabled={!formMethods.formState.isValid || isPending || isLoginCompleted}
        >
          ログイン
        </Button>
      </form>

      {isLoginCompleted && (
        <div className="mt-4 flex items-center gap-x-2 text-emerald-700">
          <FontAwesomeIcon icon={faSpinner} spin />
          <div>
            ログインしました。
            <NextLink href="/dashboard" className="ml-1 font-bold hover:underline">
              ダッシュボードへ
            </NextLink>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
