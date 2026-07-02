import NextLink from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faGaugeHigh,
  faHistory,
  faIdCard,
  faLock,
  faShieldHalved,
  faUsersGear,
} from "@fortawesome/free-solid-svg-icons";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

const links = [
  {
    href: "/signup",
    label: "新規登録",
    info: "確認用パスワード、強度チェック、bcrypt保存",
    icon: faLock,
    color: "text-red-600",
  },
  {
    href: "/login",
    label: "ログイン",
    info: "DBセッション、HttpOnly Cookie、レート制限",
    icon: faShieldHalved,
    color: "text-blue-600",
  },
  {
    href: "/dashboard",
    label: "ダッシュボード",
    info: "ログイン後だけ入れる保護ページ",
    icon: faGaugeHigh,
    color: "text-emerald-600",
  },
  {
    href: "/login-history",
    label: "ログイン履歴",
    info: "成功、失敗、レート制限を確認",
    icon: faHistory,
    color: "text-orange-500",
  },
  {
    href: "/settings/password",
    label: "パスワード変更",
    info: "現在のパスワード確認と再ハッシュ化",
    icon: faLock,
    color: "text-slate-500",
  },
  {
    href: "/admin/users",
    label: "ユーザー管理",
    info: "adminだけが停止・解除できる画面",
    icon: faUsersGear,
    color: "text-emerald-700",
  },
  {
    href: "/member/about",
    label: "公開プロフィール編集",
    info: "ログインが必要な既存機能",
    icon: faCode,
    color: "text-blue-700",
  },
];

const Page = async () => {
  const publicProfiles = await prisma.user.findMany({
    where: { aboutSlug: { not: null } },
    select: { name: true, aboutSlug: true },
    orderBy: { name: "asc" },
  });

  return (
    <main>
      <section className="flex min-h-[430px] items-center justify-center border-x border-emerald-100 bg-white px-4 py-12">
        <div className="text-center">
          <div className="text-6xl font-black tracking-wide md:text-8xl">
            <span className="text-red-600">S</span>
            <span className="text-slate-400">E</span>
            <span className="text-blue-600">C</span>
            <span className="text-slate-400">U</span>
            <span className="text-emerald-600">R</span>
            <span className="text-slate-400">E</span>
          </div>
          <h1 className="mt-5 text-3xl font-bold text-slate-900 md:text-5xl">
            セキュア認証・認可アプリ
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600">
            セッションベース認証、権限制御、パスワード保護、ログイン履歴を確認できる実装です。
            白背景と緑のナビゲーションを中心に、赤・青・オレンジをアクセントとして使っています。
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {links.map(({ href, label, info, icon, color }) => (
          <NextLink
            key={href}
            href={href}
            className="group block rounded-md border border-emerald-200 bg-emerald-500 p-3 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-600"
          >
            <div className="rounded-md border border-white/30 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.14)_0,rgba(255,255,255,0.14)_4px,transparent_4px,transparent_10px)] p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-white text-3xl shadow-sm">
                  <FontAwesomeIcon icon={icon} className={color} />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{label}</div>
                  <div className="mt-1 text-sm leading-6 text-emerald-50">{info}</div>
                </div>
              </div>
            </div>
          </NextLink>
        ))}
      </section>

      <section className="mt-8 rounded-md border border-emerald-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900">公開プロフィール</h2>
        <div className="mt-4 grid gap-3">
          {publicProfiles.length === 0 ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-slate-600">
              公開プロフィールはまだありません。
            </div>
          ) : (
            publicProfiles.map(({ name, aboutSlug }) => (
              <NextLink
                key={aboutSlug}
                href={`/about/${aboutSlug}`}
                className="flex items-center rounded-md border border-emerald-200 bg-emerald-50 p-4 text-lg font-bold text-slate-900 hover:border-emerald-500"
              >
                <FontAwesomeIcon icon={faIdCard} className="mr-3 text-emerald-600" />
                {name} のプロフィール
              </NextLink>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default Page;
