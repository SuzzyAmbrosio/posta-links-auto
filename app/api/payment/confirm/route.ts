import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return Response.json(
        { error: "Email obrigatório" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        plan: "PRO",
      },
    });

    return Response.json({
      success: true,
      user,
    });
  } catch {
    return Response.json(
      { error: "Erro ao ativar plano" },
      { status: 500 }
    );
  }
}
