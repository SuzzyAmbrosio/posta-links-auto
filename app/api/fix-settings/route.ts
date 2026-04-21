import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.settings.upsert({
    where: { userId: session.user.id },
    update: { telegramConnected: true },
    create: { userId: session.user.id, telegramConnected: true }
  })

  return NextResponse.json({ success: true })
}