import NextLink from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/libs/prisma";
import { getCurrentUser } from "@/app/api/_helper/verifySession";
import { calculateAccountDefenseLevel } from "@/app/_helpers/accountDefense";
import type { PasswordStrength } from "@/app/_types/CommonSchemas";

const Page = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      passwordStrength: true,
      passwordUpdatedAt: true,
    },
  });
  if (!user) redirect("/login");

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const [failedLoginCount7Days, activeSessionCount] = await Promise.all([
    prisma.loginHistory.count({
      where: {
        userId: user.id,
        success: false,
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.session.count({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    }),
  ]);

  const defense = calculateAccountDefenseLevel({
    passwordStrength: user.passwordStrength as PasswordStrength,
    failedLoginCount7Days,
    activeSessionCount,
    passwordUpdatedAt: user.passwordUpdatedAt,
    status: user.status,
    now,
  });

  const actions = [
    { href: "/login-history", label: "ログイン履歴", info: "成功・失敗の履歴を確認" },
    { href: "/settings/password", label: "パスワード変更", info: "安全な新パスワードへ変更" },
    ...(user.role === "ADMIN"
      ? [{ href: "/admin/users", label: "ユーザー管理", info: "停止・解除を管理" }]
      : []),
  ];

  return (
    <main>
      <section className="rounded-md border border-emerald-200 bg-white p-6 shadow-sm">
        <h1 className="text-4xl font-black text-slate-900">ダッシュボード</h1>
        <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-5">
          <div className="text-2xl font-black text-slate-900">{user.name}</div>
          <div className="mt-2 text-slate-600">{user.email}</div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
            <span className="rounded bg-white px-3 py-1 text-blue-700 shadow-sm">
              role: {user.role}
            </span>
            <span className="rounded bg-white px-3 py-1 text-emerald-700 shadow-sm">
              status: {user.status}
            </span>
          </div>
        </div>
      </section>

      <section
        id="account-defense-level"
        className="mt-6 rounded-md border border-emerald-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              アカウント防御レベル
            </h2>
            <div className="mt-2 text-slate-600">
              パスワード、ログイン履歴、セッション状態から安全状態を評価します。
            </div>
          </div>
          <div className="rounded-md bg-emerald-500 px-6 py-4 text-center text-white">
            <div className="text-sm font-bold">信用スコア</div>
            <div className="text-4xl font-black">{defense.score} / 100</div>
            <div className="mt-1 text-lg font-bold">評価: {defense.rating}</div>
          </div>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-emerald-100">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${defense.score}%` }}
          />
        </div>

        <div className="mt-5 rounded-md border border-orange-200 bg-orange-50 p-4 text-lg font-bold leading-8 text-slate-900">
          {defense.moodComment}
        </div>

        <div id="account-defense-breakdown" className="mt-6 grid gap-3 md:grid-cols-2">
          {defense.items.map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-emerald-200 bg-emerald-50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold text-slate-900">{item.label}</div>
                <div className="rounded bg-white px-3 py-1 font-black text-emerald-700">
                  +{item.points}
                </div>
              </div>
              <div className="mt-1 text-sm text-slate-600">{item.detail}</div>
            </div>
          ))}
        </div>

        <div
          id="account-defense-suggestions"
          className="mt-6 rounded-md border border-orange-200 bg-orange-50 p-4"
        >
          <h3 className="text-xl font-black text-slate-900">改善提案</h3>
          {defense.suggestions.length === 0 ? (
            <div className="mt-2 text-slate-700">
              今のところ目立つ不安材料はありません。この調子で本人らしい守りを続けましょう。
            </div>
          ) : (
            <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700">
              {defense.suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <NextLink
            key={action.href}
            href={action.href}
            className="rounded-md border border-emerald-200 bg-emerald-500 p-5 text-white shadow-sm hover:bg-emerald-600"
          >
            <div className="text-2xl font-black">{action.label}</div>
            <div className="mt-2 text-sm text-emerald-50">{action.info}</div>
          </NextLink>
        ))}
      </section>
    </main>
  );
};

export default Page;
