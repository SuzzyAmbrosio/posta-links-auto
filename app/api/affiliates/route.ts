import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Campos permitidos no banco. Evita erro 500 se mandar campo que não existe
const ALLOWED_FIELDS = [
  "aliexpressAppKey",
  "aliexpressSecret",
  "aliexpressTrackingId",
  "amazonAccessKey",
  "amazonSecretKey",
  "amazonAssociateTag",
  "shopeeAffiliateId",
  "shopeeAppKey",
  "mlAffiliateLink",
  "mlCode",
  "sheinAffiliateCode",
  "sheinTrackingId",
] as const

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await prisma.settings.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ settings: settings || {} })
  } catch (e: any) {
    console.error("GET /api/affiliates error:", e)
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { platform,...data } = body

    // Filtra só campos que existem no schema e não são vazios
    const cleanData: Record<string, string> = {}
    for (const [key, value] of Object.entries(data)) {
      if (
        ALLOWED_FIELDS.includes(key as any) &&
        value!== undefined &&
        value!== "" &&
        typeof value === "string"
      ) {
        cleanData[key] = value
      }
    }

    if (Object.keys(cleanData).length === 0) {
      return NextResponse.json({ error: "Nenhum dado para salvar" }, { status: 400 })
    }

    await prisma.settings.upsert({
      where: { userId: session.user.id },
      update: cleanData,
      create: {
        userId: session.user.id,
     ...cleanData
      },
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("POST /api/affiliates error:", e)
    return NextResponse.json({ error: "Erro ao salvar no banco" }, { status: 500 })
  }
}