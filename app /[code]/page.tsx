import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function RedirectPage({ params }: Props) {
  const { code } = await params;

  const link = await prisma.link.findUnique({
    where: { shortCode: code }
  });

  if (!link) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          Link não encontrado.
        </div>
      </main>
    );
  }

  await prisma.link.update({
    where: { id: link.id },
    data: { clicks: { increment: 1 } }
  });

  redirect(link.url);
}
