import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") // telegram ou whatsapp

  if (type === "telegram") {
    await prisma.telegramChannel.delete({
      where: { id: params.id, userId: session.user.id }
    })
  } else {
    await prisma.whatsappGroup.delete({
      where: { id: params.id, userId: session.user.id }
    })
  }

  return NextResponse.json({ success: true })
}