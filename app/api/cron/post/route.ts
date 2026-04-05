import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // 🔥 pega até 5 links mais clicados
    const links = await prisma.link.findMany({
      take: 5,
      orderBy: {
        clicks: "desc",
      },
    });

    if (links.length === 0) {
      return Response.json({ message: "Sem links" });
    }

    for (const link of links) {
      const mensagem = `🔥 ${link.title} com desconto HOJE!

💥 Oferta imperdível  
🚚 Entrega rápida  
⭐ Produto bem avaliado  

👉 Compre agora:
https://SEU-DOMINIO/${link.shortCode}`;

      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: mensagem,
        }),
      });

      // ⏱️ espera 2 segundos entre posts
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return Response.json({
      success: true,
      total: links.length,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Erro no cron" },
      { status: 500 }
    );
  }
}
