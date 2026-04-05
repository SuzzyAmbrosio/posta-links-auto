"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function UpgradePage() {
  const { data: session } = useSession();
  const [qr, setQr] = useState("");
  const [valor, setValor] = useState("");
  const [message, setMessage] = useState("");

  async function gerarPix() {
    setMessage("");

    const res = await fetch("/api/payment/pix", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Erro ao gerar PIX.");
      return;
    }

    setQr(data.qrCode);
    setValor(data.valor);
  }

  async function confirmarPagamento() {
    if (!session?.user?.email) {
      setMessage("Você precisa estar logada.");
      return;
    }

    const res = await fetch("/api/payment/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: session.user.email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Erro ao ativar plano.");
      return;
    }

    setMessage("Plano PRO ativado com sucesso 🚀");
  }

  return (
    <main className="min-h-screen bg-[#0a0f1f] p-6 text-white md:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            Upgrade
          </div>
          <h1 className="mt-2 text-4xl font-bold">Plano PRO</h1>
          <p className="mt-3 max-w-2xl text-white/60">
            Libere links ilimitados, mais automações e recursos avançados para
            escalar seu canal.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
              <div className="text-sm text-white/50">Mensalidade</div>
              <div className="mt-2 text-3xl font-bold text-emerald-400">
                R$ 19,90
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
              <div className="text-sm text-white/50">Links</div>
              <div className="mt-2 text-3xl font-bold">∞</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
              <div className="text-sm text-white/50">Automação</div>
              <div className="mt-2 text-3xl font-bold">PRO</div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-white/10 bg-[#0b1220] p-6">
              <h2 className="text-xl font-semibold">O que você desbloqueia</h2>

              <ul className="mt-5 space-y-3 text-white/70">
                <li>✔ Links ilimitados</li>
                <li>✔ Mais automações</li>
                <li>✔ Melhor performance</li>
                <li>✔ Mais poder de escala</li>
              </ul>

              <button
                onClick={gerarPix}
                className="mt-6 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
              >
                Gerar PIX
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0b1220] p-6">
              <h2 className="text-xl font-semibold">Pagamento</h2>

              {!qr ? (
                <p className="mt-4 text-white/50">
                  Gere o PIX para visualizar o código de pagamento.
                </p>
              ) : (
                <>
                  <div className="mt-4 text-sm text-white/50">
                    Valor: <span className="text-white">R$ {valor}</span>
                  </div>

                  <textarea
                    value={qr}
                    readOnly
                    className="mt-4 h-40 w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white outline-none"
                  />

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigator.clipboard.writeText(qr)}
                      className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white"
                    >
                      Copiar código PIX
                    </button>

                    <button
                      onClick={confirmarPagamento}
                      className="rounded-2xl bg-fuchsia-500 px-4 py-3 font-semibold text-white"
                    >
                      Já paguei
                    </button>
                  </div>
                </>
              )}

              {message ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                  {message}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
