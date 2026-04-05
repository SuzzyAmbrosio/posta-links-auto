import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.email !== "admin@saaslinks.com") {
      return Response.json({ error: "Não autorizado." }, { status: 401 });
    }

    const totalUsers = await prisma.user.count();
    const totalLinks = await prisma.link.count();

    const clicksAggregate = await prisma.link.aggregate({
      _sum: {
        clicks: true,
      },
    });

    const proUsers = await prisma.user.count({
      where: {
        plan: "PRO",
      },
    });

    return Response.json({
      totalUsers,
      totalLinks,
      totalClicks: clicksAggregate._sum.clicks || 0,
      proUsers,
    });
  } catch {
    return Response.json(
      { error: "Erro ao carregar estatísticas." },
      { status: 500 }
    );
  }
}
