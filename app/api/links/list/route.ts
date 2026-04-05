import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return Response.json([]);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return Response.json([]);

  const links = await prisma.link.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(links);
}
