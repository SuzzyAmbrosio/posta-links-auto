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

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const message = String(body?.message ?? "").trim();
    const groupId = body?.groupId ?? null;

    if (!message) {
      return Response.json({ error: "Mensagem vazia." }, { status: 400 });
    }

    const s = user.settings;

    let botToken = s?.telegramBotToken ?? "";
    let chatId = s?.telegramChatId ?? "";
    let parseMode = s?.telegramParseMode ?? "HTML";
    let disablePreview = Boolean(s?.telegramDisablePreview);

    // sobrescrever pelo grupo (se existir)
    if (groupId) {
      const group = await prisma.group.findFirst({
        where: { id: groupId, userId: user.id },
      });

      if (group) {
        if (group.telegramToken?.trim()) {
          botToken = group.telegramToken;
        }
        if (group.telegramChatId?.trim()) {
          chatId = group.telegramChatId;
        }
      }
    }

    if (!botToken || !chatId) {
      return Response.json(
        { error: "Configure o Telegram primeiro." },
        { status: 400 }
      );
    }

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode === "Plain" ? undefined : parseMode,
          disable_web_page_preview: disablePreview,
        }),
      }
    );

    const data = await telegramRes.json();

    if (!telegramRes.ok || !data?.ok) {
      return Response.json(
        { error: data?.description || "Erro Telegram" },
        { status: 400 }
      );
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Erro interno." }, { status: 500 });
  }
}
