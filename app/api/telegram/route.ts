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

    const settings = await prisma.settings.findUnique({
      where: { userId: session.user.id },
      select: { telegramBotToken: true, telegramChatId: true }
    })

    return NextResponse.json({ settings: settings || {} })
  } catch (e: any) {
    console.error("GET /api/telegram error:", e)
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { telegramBotToken, telegramChatId } = await req.json()

    if (!telegramBotToken) {
      return NextResponse.json({ error: "Preencha o Bot Token" }, { status: 400 })
    }

    // Valida o token antes de salvar
    try {
      const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getMe`)
      const data = await res.json()
      if (!data.ok) throw new Error("Token inválido")
    } catch (e) {
      return NextResponse.json({ error: "Token inválido ou bot inativo" }, { status: 400 })
    }

    await prisma.settings.upsert({
      where: { userId: session.user.id },
      update: {
        telegramBotToken,
        telegramChatId,
        telegramConnected: true // ADICIONA ISSO
      },
      create: {
        userId: session.user.id,
        telegramBotToken,
        telegramChatId,
        telegramConnected: true // E ISSO
      },
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("POST /api/telegram error:", e)
    return NextResponse.json({ error: "Erro ao salvar no banco" }, { status: 500 })
  }
}