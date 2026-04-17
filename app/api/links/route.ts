import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { title, url } = await req.json();
  if (!title || !url) {
    return NextResponse.json({ error: "Título e URL obrigatórios" }, { status: 400 });
  }

  const link = await prisma.link.create({
    data: {
      title,
      url,
      shortCode: nanoid(6),
      userId: session.user.id,
    },
  });

  return NextResponse.json(link);
}