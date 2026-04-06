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
  groupName?: string;
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

    let botToken = group.telegramToken?.trim() || user.settings?.telegramBotToken?.trim() || "";
    let chatId = group.telegramChatId?.trim() || user.settings?.telegramChatId?.trim() || "";
    const parseMode = user.settings?.telegramParseMode?.trim() || "HTML";
    const disablePreview = Boolean(user.settings?.telegramDisablePreview);

    if (!botToken || !chatId) {
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
      return Response.json(
        { error: "Nenhum link disponível para postar." },
        { status: 400 }
      );
    }

    let selectedLink = links[0];

    if (group.randomMode) {
      const randomIndex = Math.floor(Math.random() * links.length);
      selectedLink = links[randomIndex];
    }

    const shortUrl =
      process.env.NEXTAUTH_URL
        ? `${process.env.NEXTAUTH_URL}/${selectedLink.shortCode}`
        : selectedLink.url;

    const message = buildTelegramMessage({
      title: selectedLink.title,
      shortUrl,
      groupName: group.name,
      customTitle: group.postTitle,
      priceLabel: group.postPriceLabel,
      cta: group.postCta,
      defaultMessage: user.settings?.telegramDefaultMessage,
      signature: user.settings?.telegramSignature,
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
      return Response.json(
        {
          error: telegramData?.description || "Erro ao enviar mensagem para o Telegram.",
        },
        { status: 400 }
      );
    }

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
