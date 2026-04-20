import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const settings = await prisma.settings.findUnique({
    where: { userId: session.user.id }
  })

  return Response.json({ settings: settings || {} })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { platform,...data } = body

  // Remove campos vazios pra não sobrescrever dados existentes
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v!== undefined && v!== "")
  )

  await prisma.settings.upsert({
    where: { userId: session.user.id },
    update: cleanData,
    create: {
      userId: session.user.id,
    ...cleanData
    },
  })

  return Response.json({ success: true })
}