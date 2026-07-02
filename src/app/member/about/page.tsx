"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import type { About } from "@/app/_types/About";
import { aboutSchema } from "@/app/_types/About";
import { AboutView } from "@/app/_components/AboutView";
import NextLink from "next/link";

const Page: React.FC = () => {
  const ep = "/api/about-draft";
  const [isInitialized, setIsInitialized] = useState(false);

  const formMethods = useForm<About>({
    mode: "onChange",
    resolver: zodResolver(aboutSchema),
    defaultValues: { userName: "", aboutSlug: null, aboutContent: "" },
  });
  const fieldErrors = formMethods.formState.errors;
  const watchedSlug = useWatch({ control: formMethods.control, name: "aboutSlug" });

  const setRootError = useCallback((errorMsg: string) => {
    formMethods.setError("root", { type: "manual", message: errorMsg });
  }, [formMethods]);

  useEffect(() => {
    if (isInitialized) return;
    const fetchAbout = async () => {
      const res = await fetch(ep, { credentials: "same-origin", cache: "no-store" });
      const data: ApiResponse<About> = await res.json();
      if (data.success) formMethods.reset(aboutSchema.parse(data.payload));
      else setRootError(data.message);
      setIsInitialized(true);
    };
    fetchAbout();
  }, [formMethods, isInitialized, setRootError]);

  const onSubmit = async (formValues: About) => {
    const res = await fetch(ep, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
    });

    const body: ApiResponse<About> = await res.json();
    if (!body.success) {
      setRootError(body.message);
      return;
    }
    formMethods.reset(body.payload);
  };

  if (!isInitialized) {
    return (
      <main className="rounded-md border border-emerald-200 bg-white p-6 shadow-sm">
        <div className="text-3xl font-black text-slate-900">
          <FontAwesomeIcon icon={faIdCard} className="mr-2 text-emerald-500" />
          公開プロフィール編集
        </div>
        <div className="mt-4 flex items-center gap-x-2 text-slate-600">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
          <div>Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="rounded-md border border-emerald-200 bg-white p-6 shadow-sm">
      <div className="text-3xl font-black text-slate-900">
        <FontAwesomeIcon icon={faIdCard} className="mr-2 text-emerald-500" />
        公開プロフィール編集
      </div>

      <form
        noValidate
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className="mt-6 mb-4 flex flex-col gap-y-5"
      >
        <div>
          <label htmlFor="aboutSlug" className="mb-2 block">
            <div className="flex items-center gap-x-2">
              <div className="text-lg font-bold text-slate-900">公開URL</div>
              <div className="text-sm text-slate-500">
                {watchedSlug && !fieldErrors.aboutSlug?.message ? (
                  <NextLink href={`/about/${watchedSlug}`} target="_blank" className="font-bold hover:underline">
                    /about/{watchedSlug}
                  </NextLink>
                ) : (
                  "未公開"
                )}
              </div>
            </div>
          </label>
          <TextInputField
            {...formMethods.register("aboutSlug")}
            id="aboutSlug"
            placeholder="4から16文字の英小文字、数字、ハイフン"
            type="text"
            disabled={formMethods.formState.isSubmitting}
            error={!!fieldErrors.aboutSlug}
            autoComplete="off"
          />
          <ErrorMsgField msg={fieldErrors.aboutSlug?.message} />
          <ErrorMsgField msg={fieldErrors.root?.message} />
        </div>

        <div>
          <label htmlFor="aboutContent" className="mb-2 block text-lg font-bold text-slate-900">
            内容
          </label>
          <textarea
            {...formMethods.register("aboutContent")}
            id="aboutContent"
            className="w-full rounded-md border border-emerald-200 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
            rows={6}
            placeholder="本文を入力してください。"
            disabled={formMethods.formState.isSubmitting}
          />
          <ErrorMsgField msg={fieldErrors.aboutContent?.message} />
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className="tracking-widest"
          isBusy={formMethods.formState.isSubmitting}
          disabled={!formMethods.formState.isValid || formMethods.formState.isSubmitting}
        >
          更新
        </Button>
      </form>

      <div className="my-4 flex flex-col gap-y-2">
        <div className="text-lg font-bold text-emerald-700">Preview</div>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <AboutView about={formMethods.getValues()} />
        </div>
      </div>
    </main>
  );
};

export default Page;
