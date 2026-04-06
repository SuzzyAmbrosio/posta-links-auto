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
      groupName: s?.whatsappGroupName ?? "",
      inviteLink: s?.whatsappInviteLink ?? "",
      defaultMessage: s?.whatsappDefaultMessage ?? "",
      footerCta: s?.whatsappFooterCta ?? "",
      includeInviteLink: Boolean(s?.whatsappIncludeInviteLink),
      shortenText: Boolean(s?.whatsappShortenText),
    });
  } catch {
    return Response.json({ error: "Erro ao buscar config WhatsApp." }, { status: 500 });
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
        whatsappGroupName: String(body?.groupName ?? ""),
        whatsappInviteLink: String(body?.inviteLink ?? ""),
        whatsappDefaultMessage: String(body?.defaultMessage ?? ""),
        whatsappFooterCta: String(body?.footerCta ?? ""),
        whatsappIncludeInviteLink: Boolean(body?.includeInviteLink),
        whatsappShortenText: Boolean(body?.shortenText),
      },
      create: {
        userId: user.id,
        whatsappGroupName: String(body?.groupName ?? ""),
        whatsappInviteLink: String(body?.inviteLink ?? ""),
        whatsappDefaultMessage: String(body?.defaultMessage ?? ""),
        whatsappFooterCta: String(body?.footerCta ?? ""),
        whatsappIncludeInviteLink: Boolean(body?.includeInviteLink),
        whatsappShortenText: Boolean(body?.shortenText),
      },
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Erro ao salvar config WhatsApp." }, { status: 500 });
  }
}
