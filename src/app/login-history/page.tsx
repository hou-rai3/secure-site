import { redirect } from "next/navigation";
import { prisma } from "@/libs/prisma";
import { getCurrentUser } from "@/app/api/_helper/verifySession";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const histories = await prisma.loginHistory.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="rounded-md border border-emerald-200 bg-white p-6 shadow-sm">
      <h1 className="text-4xl font-black text-slate-900">ログイン履歴</h1>
      <div className="mt-5 overflow-x-auto rounded-md border border-emerald-200">
        <table className="w-full border-collapse text-sm text-slate-700">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">日時</th>
              <th className="p-3">メール</th>
              <th className="p-3">結果</th>
              <th className="p-3">理由</th>
              <th className="p-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {histories.map((history) => (
              <tr key={history.id} className="border-b">
                <td className="p-3">{history.createdAt.toLocaleString("ja-JP")}</td>
                <td className="p-3">{history.email}</td>
                <td className="p-3">
                  <span className={history.success ? "font-bold text-emerald-700" : "font-bold text-red-600"}>
                    {history.success ? "成功" : "失敗"}
                  </span>
                </td>
                <td className="p-3">{history.reason}</td>
                <td className="p-3">{history.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {histories.length === 0 && (
          <div className="p-4 text-sm text-slate-600">履歴はまだありません。</div>
        )}
      </div>
    </main>
  );
};

export default Page;
