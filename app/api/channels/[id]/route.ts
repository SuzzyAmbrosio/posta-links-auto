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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { type, name, avatar, interval, isActive } = await req.json()
  const { id } = params

  // Atualiza na tabela principal
  if (type === "telegram") {
    await prisma.telegramChannel.update({
      where: { id },
      data: {
        name,
        avatar, // SALVA A FOTO
        interval,
        isActive
      }
    })

    // Atualiza também na tabela Group se existir
    await prisma.group.updateMany({
      where: {
        userId: session.user.id,
        telegramChatId: id // ou o campo que relaciona
      },
      data: {
        name,
        isActive
      }
    })
  } else {
    await prisma.whatsappGroup.update({
      where: { id },
      data: {
        name,
        avatar, // SALVA A FOTO
        interval,
        isActive
      }
    })

    // Atualiza também na tabela Group se existir
    await prisma.group.updateMany({
      where: {
        userId: session.user.id,
        whatsappGroupId: id // ou o campo que relaciona
      },
      data: {
        name,
        isActive
      }
    })
  }

  // Retorna o registro atualizado
  const updated = type === "telegram"
   ? await prisma.telegramChannel.findUnique({ where: { id } })
    : await prisma.whatsappGroup.findUnique({ where: { id } })

  return NextResponse.json(updated)
}