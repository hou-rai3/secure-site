"use client";

import React from "react";
import { useAuth } from "@/app/_hooks/useAuth";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NextLink from "next/link";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = (props) => {
  const { children } = props;
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <main>
        <div className="text-2xl font-bold">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1.5" />
          ログインが必要です
        </div>
        <div className="mt-4">
          このページを利用するには
          <NextLink href="/login" className="px-1 text-blue-500 hover:underline">
            ログイン
          </NextLink>
          してください。
        </div>
      </main>
    );
  }

  return <>{children}</>;
};

export default Layout;
