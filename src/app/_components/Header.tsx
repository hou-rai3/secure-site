"use client";

import { useAuth } from "@/app/_hooks/useAuth";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardUser,
  faBars,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";

export const Header: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="bg-emerald-500 text-white shadow-md">
      <div className="mx-4 max-w-6xl py-3 md:mx-auto">
        <div className="flex items-center justify-between gap-4">
          <NextLink
            href="/"
            className="flex items-center text-3xl font-bold text-white hover:text-white md:text-4xl"
          >
            <span className="mr-3 flex h-11 w-11 items-center justify-center rounded-md border-4 border-white text-2xl">
              <FontAwesomeIcon icon={faChalkboardUser} />
            </span>
            SecureAuth
          </NextLink>

          {userProfile ? (
            <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
              <NextLink
                href="/dashboard"
                className="rounded-md bg-white px-4 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
              >
                {userProfile.name}
              </NextLink>
              {userProfile.role === "ADMIN" && (
                <NextLink
                  href="/admin/users"
                  className="rounded-md bg-white px-4 py-2 font-bold text-blue-700 hover:bg-blue-50"
                >
                  管理
                </NextLink>
              )}
              <button
                className="rounded-md bg-slate-800 px-4 py-2 font-bold text-white hover:bg-slate-700"
                onClick={async () => {
                  await logout();
                  router.push("/login");
                  router.refresh();
                }}
              >
                ログアウト
              </button>
              <span className="hidden items-center gap-2 text-lg font-bold md:flex">
                MENU
                <FontAwesomeIcon icon={faBars} className="text-3xl" />
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                className="rounded-md bg-white px-5 py-3 text-base font-bold text-emerald-700 hover:bg-emerald-50"
                onClick={() => {
                  router.push("/login");
                }}
              >
                <FontAwesomeIcon icon={faRightToBracket} className="mr-2" />
                ログイン
              </button>
              <span className="hidden items-center gap-2 text-lg font-bold md:flex">
                MENU
                <FontAwesomeIcon icon={faBars} className="text-3xl" />
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
