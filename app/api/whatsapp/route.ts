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
      select: {
        whatsappNumber: true,
        whatsappInstanceId: true,
        whatsappToken: true,
        whatsappGroupId: true
      }
    })

    return NextResponse.json({ settings: settings || {} })
  } catch (e: any) {
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { whatsappNumber, whatsappInstanceId, whatsappToken, whatsappGroupId } = await req.json()

    if (!whatsappNumber ||!whatsappInstanceId ||!whatsappToken ||!whatsappGroupId) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 })
    }

    await prisma.settings.upsert({
      where: { userId: session.user.id },
      update: { whatsappNumber, whatsappInstanceId, whatsappToken, whatsappGroupId },
      create: {
        userId: session.user.id,
        whatsappNumber,
        whatsappInstanceId,
        whatsappToken,
        whatsappGroupId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: "Erro ao salvar no banco" }, { status: 500 })
  }
}