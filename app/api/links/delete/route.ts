import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json(
        { error: "ID do link é obrigatório." },
        { status: 400 }
      );
    }

    await prisma.link.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Erro ao excluir link." },
      { status: 500 }
    );
  }
}
