import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [telegram, whatsapp] = await Promise.all([
    prisma.telegramChannel.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    }),
    prisma.whatsappGroup.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })
  ])

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  const limit = user?.plan === "PRO"? 999 : 1
  const total = telegram.length + whatsapp.length

  return NextResponse.json({
    telegram,
    whatsapp,
    stats: {
      telegramCount: telegram.length,
      whatsappCount: whatsapp.length,
      activeCount: [...telegram,...whatsapp].filter(c => c.isActive).length,
      total,
      limit
    }
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { type, name, chatId, groupId, interval, random } = body

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  const limit = user?.plan === "PRO"? 999 : 1

  const [telegramCount, whatsappCount] = await Promise.all([
    prisma.telegramChannel.count({ where: { userId: session.user.id } }),
    prisma.whatsappGroup.count({ where: { userId: session.user.id } })
  ])

  if (telegramCount + whatsappCount >= limit) {
    return NextResponse.json({ error: "Limite atingido. Faça upgrade do plano." }, { status: 403 })
  }

  if (type === "telegram") {
    const channel = await prisma.telegramChannel.create({
      data: {
        userId: session.user.id,
        name,
        chatId,
        interval: interval || null,
      }
    })
    return NextResponse.json(channel)
  }

  if (type === "whatsapp") {
    if (!groupId.endsWith("@g.us")) {
      return NextResponse.json({ error: "ID do grupo inválido" }, { status: 400 })
    }
    const group = await prisma.WhatsappGroup.create({
      data: {
        userId: session.user.id,
        name,
        groupId,
        interval: interval || null,
      }
    })
    return NextResponse.json(group)
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
}