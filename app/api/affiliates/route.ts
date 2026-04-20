import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const settings = await prisma.settings.findUnique({
    where: { userId: session.user.id }
  })

  return Response.json({ settings: settings || {} })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { platform,...data } = body // remove o campo platform

  await prisma.settings.upsert({
    where: { userId: session.user.id },
    update: data, // salva só os campos enviados
    create: { 
      userId: session.user.id, 
     ...data 
    },
  })

  return Response.json({ success: true })
}