import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.settings.update({
      where: { userId: session.user.id },
      data: {
        telegramBotToken: null,
        telegramChatId: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: "Erro ao desconectar" }, { status: 500 })
  }
}