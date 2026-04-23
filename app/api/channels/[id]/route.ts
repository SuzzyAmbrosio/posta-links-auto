import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")

  if (type === "telegram") {
    await prisma.telegramChannel.delete({
      where: { id, userId: session.user.id }
    })
  } else {
    await prisma.whatsappGroup.delete({
      where: { id, userId: session.user.id }
    })
  }

  const updated = type === "telegram" 
  ? await prisma.telegramChannel.findUnique({ where: { id } })
  : await prisma.whatsappGroup.findUnique({ where: { id } })

return NextResponse.json(updated)
}

// GET já tá ok
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")

  const channel = type === "telegram"
   ? await prisma.telegramChannel.findUnique({ where: { id } })
    : await prisma.whatsappGroup.findUnique({ where: { id } })

  return NextResponse.json(channel)
}

// ESSA FUNÇÃO TEM QUE EXISTIR - É ELA QUE TÁ DANDO 405
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { type, name, avatar, interval, isActive } = await req.json()

  let updated

  if (type === "telegram") {
    updated = await prisma.telegramChannel.update({
      where: { id, userId: session.user.id }, // adiciona userId pra segurança
      data: {
        name,
        avatar,
        interval,
        isActive
      }
    })
  } else {
    updated = await prisma.whatsappGroup.update({
      where: { id, userId: session.user.id }, // adiciona userId pra segurança
      data: {
        name,
        avatar,
        interval,
        isActive
      }
    })
  }

  return NextResponse.json(updated)
}