import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/libs/prisma";
import { getCurrentUser } from "@/app/api/_helper/verifySession";

const updateUserStatus = async (formData: FormData) => {
  "use server";

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "ADMIN") redirect("/dashboard");

  const userId = String(formData.get("userId") || "");
  const status = String(formData.get("status") || "");
  if (status !== "ACTIVE" && status !== "SUSPENDED") return;
  if (userId === currentUser.id && status === "SUSPENDED") return;

  await prisma.user.update({ where: { id: userId }, data: { status } });

  if (status === "SUSPENDED") {
    await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  revalidatePath("/admin/users");
};

const Page = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <main className="rounded-md border border-emerald-200 bg-white p-6 shadow-sm">
      <h1 className="text-4xl font-black text-slate-900">ユーザー管理</h1>
      <div className="mt-5 overflow-x-auto rounded-md border border-emerald-200">
        <table className="w-full border-collapse text-sm text-slate-700">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">メール</th>
              <th className="p-3">名前</th>
              <th className="p-3">role</th>
              <th className="p-3">status</th>
              <th className="p-3">作成日</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.status}</td>
                <td className="p-3">{user.createdAt.toLocaleString("ja-JP")}</td>
                <td className="p-3">
                  {user.id === currentUser.id ? (
                    <span className="text-slate-500">自分自身は停止不可</span>
                  ) : (
                    <form action={updateUserStatus}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"}
                      />
                      <button className="rounded-md bg-emerald-500 px-4 py-2 font-bold text-white hover:bg-emerald-600">
                        {user.status === "ACTIVE" ? "停止" : "解除"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Page;
