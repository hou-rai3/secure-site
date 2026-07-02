import { prisma } from "@/libs/prisma";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard } from "@fortawesome/free-solid-svg-icons";
import { AboutView } from "@/app/_components/AboutView";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;

  const user = await prisma.user.findUnique({
    where: { aboutSlug: slug },
    select: {
      name: true,
      aboutSlug: true,
      aboutContent: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <main className="rounded-md border border-emerald-200 bg-white p-6 shadow-sm">
      <div className="text-3xl font-black text-slate-900">
        <FontAwesomeIcon icon={faIdCard} className="mr-2 text-emerald-500" />
        {user.name} のプロフィール
      </div>

      <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-6">
        <AboutView
          about={{
            userName: user.name,
            aboutSlug: user.aboutSlug,
            aboutContent: user.aboutContent,
          }}
        />
      </div>
    </main>
  );
};

export default Page;
