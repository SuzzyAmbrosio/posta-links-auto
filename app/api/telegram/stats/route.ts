import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Conta envios dos últimos 30 dias
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const envios = await prisma.telegramPost.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: thirtyDaysAgo }
    }
  })

  const canais = await prisma.telegramChannel.count({
    where: { userId: session.user.id }
  })

  return NextResponse.json({ envios, canais })
}