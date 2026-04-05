export async function POST() {
  return Response.json({
    qrCode: "00020126580014BR.GOV.BCB.PIX...",
    valor: "19.90",
    mensagem: "Pagamento PIX gerado"
  });
}
