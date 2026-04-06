import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
      return Response.json({ error: "Não autenticado." }, { status: 401 });
    }

    return Response.json({
      groupName: user.whatsappGroupName ?? "",
      inviteLink: user.whatsappInviteLink ?? "",
      defaultMessage: user.whatsappDefaultMessage ?? "",
      footerCta: user.whatsappFooterCta ?? "",
      includeInviteLink: Boolean(user.whatsappIncludeInviteLink),
      shortenText: Boolean(user.whatsappShortenText),
    });
  } catch {
    return Response.json(
      { error: "Erro ao buscar configurações do WhatsApp." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        whatsappGroupName: String(body?.groupName ?? ""),
        whatsappInviteLink: String(body?.inviteLink ?? ""),
        whatsappDefaultMessage: String(body?.defaultMessage ?? ""),
        whatsappFooterCta: String(body?.footerCta ?? ""),
        whatsappIncludeInviteLink: Boolean(body?.includeInviteLink),
        whatsappShortenText: Boolean(body?.shortenText),
      },
    });

    return Response.json({
      ok: true,
      config: {
        groupName: updated.whatsappGroupName,
        inviteLink: updated.whatsappInviteLink,
        defaultMessage: updated.whatsappDefaultMessage,
        footerCta: updated.whatsappFooterCta,
        includeInviteLink: updated.whatsappIncludeInviteLink,
        shortenText: updated.whatsappShortenText,
      },
    });
  } catch {
    return Response.json(
      { error: "Erro ao salvar configurações do WhatsApp." },
      { status: 500 }
    );
  }
}
