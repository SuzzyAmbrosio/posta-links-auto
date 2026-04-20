import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // ou "@/app/api/auth/[...nextauth]/route"

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

  await prisma.settings.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { 
      userId: session.user.id, 
     ...data 
    },
  })

  return Response.json({ success: true })
}