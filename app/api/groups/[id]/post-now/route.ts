import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: { settings: true },
  });
}

function buildTelegramMessage(params: {
  title: string;
  shortUrl: string;
  customTitle?: string;
  priceLabel?: string;
  cta?: string;
  defaultMessage?: string;
  signature?: string;
}) {
  const {
    title,
    shortUrl,
    customTitle,
    priceLabel,
    cta,
    defaultMessage,
    signature,
  } = params;

  const finalTitle = customTitle?.trim() || title;
  const finalPrice = priceLabel?.trim();
  const finalCta = cta?.trim() || "🛒 Aproveite agora:";
  const intro =
    defaultMessage?.trim() ||
    "🔥 Oferta imperdível do dia!\n\n✅ Produto selecionado\n🚚 Envio rápido\n⭐ Aproveite enquanto durar";

  const parts = [
    intro,
    `📦 ${finalTitle}`,
    finalPrice ? `💰 ${finalPrice}` : "",
    `${finalCta}\n${shortUrl}`,
    signature?.trim() || "",
  ].filter(Boolean);

  return parts.join("\n\n");
}

function pickLink<T extends { clicks: number }>(
  links: T[],
  selectionMode?: string,
  randomMode?: boolean
) {
  if (!links.length) return null;

  if (randomMode || selectionMode === "random") {
    return links[Math.floor(Math.random() * links.length)];
  }

  if (selectionMode === "most_clicked") {
    return [...links].sort((a, b) => b.clicks - a.clicks)[0];
  }

  return links[0];
}

export async function POST(_req: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await context.params;

    const group = await prisma.group.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!group) {
      return Response.json({ error: "Grupo não encontrado." }, { status: 404 });
    }

    const botToken =
      group.telegramToken?.trim() || user.settings?.telegramBotToken?.trim() || "";

    const chatId =
      group.telegramChatId?.trim() || user.settings?.telegramChatId?.trim() || "";

    const parseMode = user.settings?.telegramParseMode?.trim() || "HTML";
    const disablePreview = Boolean(user.settings?.telegramDisablePreview);

    if (!botToken || !chatId) {
      await prisma.postLog.create({
        data: {
          userId: user.id,
          status: "error",
          detail: "Configure o Telegram no grupo ou nas configurações gerais.",
          groupId: group.id,
          groupName: group.name,
        },
      });

      return Response.json(
        { error: "Configure o Telegram no grupo ou nas configurações gerais." },
        { status: 400 }
      );
    }

    let links = await prisma.link.findMany({
      where: {
        userId: user.id,
        groupId: group.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    if (!links.length) {
      links = await prisma.link.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      });
    }

    if (!links.length) {
      await prisma.postLog.create({
        data: {
          userId: user.id,
          status: "error",
          detail: "Nenhum link disponível para postar.",
          groupId: group.id,
          groupName: group.name,
        },
      });

      return Response.json(
        { error: "Nenhum link disponível para postar." },
        { status: 400 }
      );
    }

    const selectedLink = pickLink(links, group.selectionMode, group.randomMode);

    if (!selectedLink) {
      return Response.json(
        { error: "Nenhum link encontrado." },
        { status: 400 }
      );
    }

    const shortUrl =
      process.env.NEXTAUTH_URL
        ? `${process.env.NEXTAUTH_URL.replace(/\/$/, "")}/${selectedLink.shortCode}`
        : selectedLink.url;

    const message = buildTelegramMessage({
      title: selectedLink.title,
      shortUrl,
      customTitle: group.postTitle,
      priceLabel: group.postPriceLabel,
      cta: group.postCta,
      defaultMessage: user.settings?.telegramDefaultMessage || undefined,
      signature: user.settings?.telegramSignature || undefined,
    });

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode === "Plain" ? undefined : parseMode,
          disable_web_page_preview: disablePreview,
        }),
      }
    );

    const telegramData = await telegramRes.json();

    if (!telegramRes.ok || !telegramData?.ok) {
      const detail =
        telegramData?.description || "Erro ao enviar mensagem para o Telegram.";

      await prisma.postLog.create({
        data: {
          userId: user.id,
          status: "error",
          detail,
          groupId: group.id,
          groupName: group.name,
          linkId: selectedLink.id,
          linkTitle: selectedLink.title,
          telegramChatId: chatId,
        },
      });

      return Response.json({ error: detail }, { status: 400 });
    }

    await prisma.group.update({
      where: { id: group.id },
      data: {
        lastPostedAt: new Date(),
      },
    });

    await prisma.postLog.create({
      data: {
        userId: user.id,
        status: "success",
        detail: `Post manual enviado: ${selectedLink.title}`,
        groupId: group.id,
        groupName: group.name,
        linkId: selectedLink.id,
        linkTitle: selectedLink.title,
        telegramChatId: chatId,
      },
    });

    return Response.json({
      ok: true,
      group: {
        id: group.id,
        name: group.name,
      },
      postedLink: {
        id: selectedLink.id,
        title: selectedLink.title,
        shortCode: selectedLink.shortCode,
      },
      telegramMessageId: telegramData?.result?.message_id ?? null,
    });
  } catch {
    return Response.json(
      { error: "Erro interno ao postar no grupo." },
      { status: 500 }
    );
  }
}
