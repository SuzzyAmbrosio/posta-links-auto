"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:grid-cols-2">
        <section className="bg-[linear-gradient(135deg,#4f6df5,#6f8cff)] px-8 py-10 text-white md:px-12">
          <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
            Entrar na plataforma
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight">
            Acesse seu painel e controle toda a sua operação.
          </h1>

          <p className="mt-4 max-w-xl text-white/85">
            Gerencie links, acompanhe cliques, faça upgrade, envie para Telegram
            e automatize seus melhores produtos.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <div className="text-sm text-white/80">Automação</div>
              <div className="mt-2 text-xl font-bold">Telegram + campanhas</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <div className="text-sm text-white/80">Monitoramento</div>
              <div className="mt-2 text-xl font-bold">Cliques e desempenho</div>
            </div>
          </div>
        </section>

        <section className="px-8 py-10 md:px-12">
          <div className="mx-auto max-w-md">
            <h2 className="text-2xl font-bold text-[var(--text)]">Login</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Use seu email e senha para entrar.
            </p>

            <form onSubmit={login} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@email.com"
                  className="px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-4 py-3"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
