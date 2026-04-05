import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 🔐 Verifica login
    if (!session?.user?.email) {
      return Response.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, url } = body;

    // 🔎 Validação
    if (!title || !url) {
      return Response.json(
        { error: "Título e URL são obrigatórios." },
        { status: 400 }
      );
    }

    // 👤 Busca usuário
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // 🧱 Cria usuário se não existir
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          password: "123456",
          plan: "FREE",
        },
      });
    }

    // 📊 Conta links
    const totalLinks = await prisma.link.count({
      where: { userId: user.id },
    });

    // 🚫 Limite FREE
    if (user.plan === "FREE" && totalLinks >= 5) {
      return Response.json(
        { error: "Plano FREE atingiu limite. Atualize para PRO 🚀" },
        { status: 403 }
      );
    }

    // 🤖 TRANSFORMA LINK SHOPEE EM AFILIADO
    let finalUrl = url;

    if (url.includes("shopee")) {
      // ⚠️ substitua pelo seu ID real depois
      const affiliateId = "18394650198";

      // evita duplicar parâmetro
      if (!url.includes("af_id=")) {
        finalUrl = url.includes("?")
          ? `${url}&af_id=${affiliateId}`
          : `${url}?af_id=${affiliateId}`;
      }
    }

    // 🔗 Cria link
    const link = await prisma.link.create({
      data: {
        title,
        url: finalUrl,
        shortCode: nanoid(6),
        userId: user.id,
      },
    });

    return Response.json(link);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Erro ao criar link." },
      { status: 500 }
    );
  }
}
