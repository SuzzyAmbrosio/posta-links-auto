'use client'

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

type LinkItem = {
  id: string;
  title: string;
  url: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const planoAtual = session?.user?.email === "admin@saaslinks.com"? "PRO" : "FREE";

  const totalCliques = useMemo(
    () => links.reduce((acc, item) => acc + item.clicks, 0),
    [links]
  );

  const ganhosEstimados = useMemo(
    () => (totalCliques * 0.05).toFixed(2),
    [totalCliques]
  );

  const topLinks = useMemo(() => {
    return [...links].sort((a, b) => b.clicks - a.clicks).slice(0, 5);
  }, [links]);

  async function carregarLinks() {
    setLoading(true);
    try {
      const res = await fetch("/api/links/list", { cache: "no-store" });
      const data = await res.json();
      setLinks(Array.isArray(data)? data : data.links || []);
    } catch {
      toast.error("Erro ao carregar links.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) carregarLinks();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-semibold">
        Carregando...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold">Você precisa fazer login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Entre na sua conta para acessar o painel e gerenciar seus links.
          </p>
          <div className="mt-6">
            <Link href="/login" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Ir para login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard Posta Links Auto</h1>
            <p className="text-sm text-gray-600">Painel principal de campanhas, canais e automações</p>
          </div>
          <button 
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            onClick={carregarLinks}
          >
            Atualizar
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-gray-100 px-3 py-1">Geral</span>
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">Telegram</span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Layout Post</span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">WhatsApp - Grupos/Canais</span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Instagram</span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Shopee</span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Amazon</span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Mercado Livre</span>
        </div>
      </div>

      <section className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">Total de links</div>
          <div className="mt-2 text-3xl font-bold">{links.length}</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">Cliques totais</div>
          <div className="mt-2 text-3xl font-bold">{totalCliques}</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">Links disponíveis</div>
          <div className="mt-2 text-3xl font-bold">
            {planoAtual === "PRO"? "∞" : Math.max(0, 5 - links.length)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">Ganhos estimados</div>
          <div className="mt-2 text-3xl font-bold">R$ {ganhosEstimados}</div>
        </div>
      </section>

      <section className="mb-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-base font-bold">Top links</h2>
          <p className="mb-4 text-sm text-gray-600">
            Os links com melhor desempenho até agora.
          </p>

          {loading? (
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
              Carregando...
            </div>
          ) : topLinks.length === 0? (
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
              Nenhum dado ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {topLinks.map((link, index) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-600">
                      #{index + 1}
                    </div>
                    <div className="line-clamp-2 text-sm font-semibold">
                      {link.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      /{link.shortCode}
                    </div>
                  </div>
                  <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    {link.clicks} cliques
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="font-bold text-green-900">Conta conectada</div>
        <div className="mt-1 text-sm text-green-800">
          Usuária: <strong>{session.user?.email}</strong>
        </div>
        <div className="mt-1 text-sm text-green-800">
          Plano atual: <strong>{planoAtual}</strong>
        </div>
      </div>
    </>
  );
} fdh
