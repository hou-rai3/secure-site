import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/libs/prisma";
import { getCurrentUser } from "@/app/api/_helper/verifySession";
import { getPasswordStrength, passwordSchema } from "@/app/_types/CommonSchemas";

const changePassword = async (formData: FormData) => {
  "use server";

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (newPassword !== confirmPassword) redirect("/settings/password?error=confirm");

  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) redirect("/settings/password?error=strength");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !(await bcrypt.compare(currentPassword, dbUser.passwordHash))) {
    redirect("/settings/password?error=current");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(newPassword, 12),
      passwordStrength: getPasswordStrength(newPassword),
      passwordUpdatedAt: new Date(),
    },
  });
  redirect("/settings/password?updated=1");
};

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const errorMessage =
    params.error === "confirm"
      ? "確認用パスワードが一致しません。"
      : params.error === "strength"
        ? "新しいパスワードの強度が不足しています。"
        : params.error === "current"
          ? "現在のパスワードが正しくありません。"
          : "";

  return (
    <main className="mx-auto max-w-xl rounded-md border border-emerald-200 bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-4xl font-black text-slate-900">パスワード変更</h1>
      {params.updated && (
        <div className="mt-4 rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
          パスワードを変更しました。
        </div>
      )}
      {errorMessage && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}
      <form action={changePassword} className="mt-6 flex flex-col gap-y-5">
        <label className="block">
          <span className="mb-2 block text-lg font-bold text-slate-900">現在のパスワード</span>
          <input name="currentPassword" type="password" className="w-full rounded-md border border-emerald-200 px-4 py-3" />
        </label>
        <label className="block">
          <span className="mb-2 block text-lg font-bold text-slate-900">新しいパスワード</span>
          <input name="newPassword" type="password" className="w-full rounded-md border border-emerald-200 px-4 py-3" />
        </label>
        <label className="block">
          <span className="mb-2 block text-lg font-bold text-slate-900">確認用パスワード</span>
          <input name="confirmPassword" type="password" className="w-full rounded-md border border-emerald-200 px-4 py-3" />
        </label>
        <button className="rounded-md bg-emerald-500 px-5 py-3 font-bold text-white hover:bg-emerald-600">
          変更する
        </button>
      </form>
    </main>
  );
};

export default Page;
