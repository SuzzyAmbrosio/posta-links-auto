import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: { settings: true },
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Não autenticado." }, { status: 401 });
    }

    const s = user.settings;

    return Response.json({
      botToken: s?.telegramBotToken ?? "",
      chatId: s?.telegramChatId ?? "",
      defaultMessage: s?.telegramDefaultMessage ?? "",
      signature: s?.telegramSignature ?? "",
      parseMode: s?.telegramParseMode ?? "HTML",
      disablePreview: Boolean(s?.telegramDisablePreview),
      pinAfterSend: Boolean(s?.telegramPinAfterSend),
    });
  } catch {
    return Response.json({ error: "Erro ao buscar config Telegram." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();

    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        telegramBotToken: String(body?.botToken ?? ""),
        telegramChatId: String(body?.chatId ?? ""),
        telegramDefaultMessage: String(body?.defaultMessage ?? ""),
        telegramSignature: String(body?.signature ?? ""),
        telegramParseMode: String(body?.parseMode ?? "HTML"),
        telegramDisablePreview: Boolean(body?.disablePreview),
        telegramPinAfterSend: Boolean(body?.pinAfterSend),
      },
      create: {
        userId: user.id,
        telegramBotToken: String(body?.botToken ?? ""),
        telegramChatId: String(body?.chatId ?? ""),
        telegramDefaultMessage: String(body?.defaultMessage ?? ""),
        telegramSignature: String(body?.signature ?? ""),
        telegramParseMode: String(body?.parseMode ?? "HTML"),
        telegramDisablePreview: Boolean(body?.disablePreview),
        telegramPinAfterSend: Boolean(body?.pinAfterSend),
      },
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Erro ao salvar config Telegram." }, { status: 500 });
  }
}
