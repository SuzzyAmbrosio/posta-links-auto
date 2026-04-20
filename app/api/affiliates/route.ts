import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const { platform,...data } = body;

  await prisma.settings.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id,...data },
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const settings = await prisma.settings.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ settings: settings || {} });
}