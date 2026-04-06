import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(
      settings ?? {
        telegramBotToken: "",
        telegramChatId: "",
        telegramDefaultMessage: "",
        telegramSignature: "",
        whatsappGroupName: "",
        whatsappInviteLink: "",
        whatsappDefaultMessage: "",
        whatsappFooterCta: "",
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar configurações." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        telegramBotToken: body.telegramBotToken ?? "",
        telegramChatId: body.telegramChatId ?? "",
        telegramDefaultMessage: body.telegramDefaultMessage ?? "",
        telegramSignature: body.telegramSignature ?? "",
        whatsappGroupName: body.whatsappGroupName ?? "",
        whatsappInviteLink: body.whatsappInviteLink ?? "",
        whatsappDefaultMessage: body.whatsappDefaultMessage ?? "",
        whatsappFooterCta: body.whatsappFooterCta ?? "",
      },
      create: {
        userId: user.id,
        telegramBotToken: body.telegramBotToken ?? "",
        telegramChatId: body.telegramChatId ?? "",
        telegramDefaultMessage: body.telegramDefaultMessage ?? "",
        telegramSignature: body.telegramSignature ?? "",
        whatsappGroupName: body.whatsappGroupName ?? "",
        whatsappInviteLink: body.whatsappInviteLink ?? "",
        whatsappDefaultMessage: body.whatsappDefaultMessage ?? "",
        whatsappFooterCta: body.whatsappFooterCta ?? "",
      },
    });

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Erro ao salvar configurações." },
      { status: 500 }
    );
  }
}
