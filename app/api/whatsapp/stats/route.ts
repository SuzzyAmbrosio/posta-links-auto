import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const enviosHoje = await prisma.postLog.count({
      where: {
        userId: session.user.id,
        status: "success",
        createdAt: { gte: today },
        detail: { contains: "WhatsApp" }
      }
    })

    return NextResponse.json({ enviosHoje })
  } catch (e) {
    return NextResponse.json({ enviosHoje: 0 })
  }
}