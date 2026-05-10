import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const channelId = searchParams.get('channelId')

  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 })

  const config = await prisma.channelConfig.findUnique({
    where: { channelId }
  })

  return NextResponse.json(config || {})
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { channelId, channelType, ...configData } = body

    if (!channelId) {
      return NextResponse.json({ error: "channelId required" }, { status: 400 })
    }

    const config = await prisma.channelConfig.upsert({
      where: { channelId },
      update: configData,
      create: {
        userId: session.user.id,
        channelId,
        channelType,
        ...configData
      }
    })

    return NextResponse.json(config)
  } catch (e: any) {
    console.error('Erro ao salvar config:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}