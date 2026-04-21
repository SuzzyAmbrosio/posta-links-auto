import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys"
import QRCode from "qrcode"

const sessions = new Map() // Em produção usa Redis

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${userId}`)

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    })

    sessions.set(userId, sock)

    sock.ev.on("creds.update", saveCreds)

    return new Promise((resolve) => {
      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
          const qrBase64 = await QRCode.toDataURL(qr)
          resolve(NextResponse.json({ qr: qrBase64, status: "qr" }))
        }

        if (connection === "open") {
          await prisma.settings.upsert({
            where: { userId },
            update: { whatsappNumber: sock.user?.id.split(':')[0] || "" },
            create: {
              userId,
              whatsappNumber: sock.user?.id.split(':')[0] || "",
            },
          })
          resolve(NextResponse.json({ status: "connected", number: sock.user?.id }))
        }

        if (connection === "close") {
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
          if (!shouldReconnect) {
            sessions.delete(userId)
          }
          resolve(NextResponse.json({ status: "disconnected" }))
        }
      })
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const sock = sessions.get(userId)

    if (!sock) {
      return NextResponse.json({ groups: [], connected: false })
    }

    const groups = await sock.groupFetchAllParticipating()
    const groupList = Object.values(groups).map((g: any) => ({
      id: g.id,
      name: g.subject,
    }))

    return NextResponse.json({ groups: groupList, connected: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}