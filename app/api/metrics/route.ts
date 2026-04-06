import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Não autenticado." }, { status: 401 });
    }

    const [logs, activeGroups, totalGroups] = await Promise.all([
      prisma.postLog.findMany({
        where: { userId: user.id },
        orderBy: { postedAt: "desc" },
        take: 20,
      }),
      prisma.group.count({
        where: {
          userId: user.id,
          isActive: true,
        },
      }),
      prisma.group.count({
        where: {
          userId: user.id,
        },
      }),
    ]);

    const totalLogs = logs.length;
    const successCount = logs.filter((log) => log.status === "success").length;
    const errorCount = logs.filter((log) => log.status === "error").length;
    const skippedCount = logs.filter((log) => log.status === "skipped").length;
    const lastActivity = logs[0]?.postedAt ?? null;

    return Response.json({
      summary: {
        totalLogs,
        successCount,
        errorCount,
        skippedCount,
        activeGroups,
        totalGroups,
        lastActivity,
      },
      recentLogs: logs,
    });
  } catch {
    return Response.json(
      { error: "Erro ao carregar métricas." },
      { status: 500 }
    );
  }
}
