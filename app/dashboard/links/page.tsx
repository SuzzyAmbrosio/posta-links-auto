'use client'

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type LinkItem = {
  id: string;
  title: string;
  url: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
};

export default function LinksPage() {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [importando, setImportando] = useState(false);
  const [enviandoId, setEnviandoId] = useState<string | null>(null);

  async function carregarLinks() {
    try {
      const res = await fetch("/api/links/list", { cache: "no-store" });
      const data = await res.json();
      setLinks(Array.isArray(data)? data : data.links || []);
    } catch {
      toast.error("Erro ao carregar links.");
    }
  }

  useEffect(() => {
    if (session) carregarLinks();
  }, [session]);

  async function criarLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao criar link.");
        return;
      }

      toast.success("Link criado com sucesso.");
      setTitle("");
      setUrl("");
      await carregarLinks();
    } catch {
      toast.error("Erro ao criar link.");
    } finally {
      setLoading(false);
    }
  }

  async function excluirLink(id: string) {
    const confirmou = window.confirm("Deseja excluir este link?");
    if (!confirmou) return;

    try {
      const res = await fetch("/api/links/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao excluir link.");
        return;
      }

      toast.success("Link excluído com sucesso.");
      await carregarLinks();
    } catch {
      toast.error("Erro ao excluir link.");
    }
  }

  async function importarProdutosShopee() {
    setImportando(true);

    try {
      const res = await fetch("/api/shopee/import", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao importar produtos.");
        return;
      }

      toast.success(data.message || "Produtos importados com sucesso.");
      await carregarLinks();
    } catch {
      toast.error("Erro ao importar produtos.");
    } finally {
      setImportando(false);
    }
  }

  async function enviarTelegram(link: LinkItem) {
    setEnviandoId(link.id);

    try {
      const mensagem = `🔥 ${link.title}\n\nOferta imperdível hoje.\n👉 ${window.location.origin}/${link.shortCode}`;

      const res = await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: mensagem }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao enviar para o Telegram.");
        return;
      }

      toast.success("Enviado para o Telegram com sucesso.");
    } catch {
      toast.error("Erro ao enviar para o Telegram.");
    } finally {
      setEnviandoId(null);
    }
  }

  function copiarLink(shortCode: string) {
    const linkCompleto = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(linkCompleto);
    toast.success("Link copiado com sucesso.");
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Links</h1>
        <p className="text-sm text-gray-600">Crie e gerencie seus links de afiliado</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Adicionar produto ou link</h2>
            <p className="text-sm text-gray-600">
              Crie links curtos para suas ofertas
            </p>
          </div>

          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={importarProdutosShopee}
            disabled={importando}
          >
            {importando? "Importando..." : "Importar Shopee"}
          </button>
        </div>

        <form onSubmit={criarLink} className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-600">
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Fone Bluetooth com desconto"
              className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-600">
              URL de destino
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
            <button 
              type="submit" 
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50" 
              disabled={loading}
            >
              {loading? "Criando..." : "Salvar link"}
            </button>

            <button
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setTitle("");
                setUrl("");
              }}
            >
              Limpar
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-bold">Todos os links</h2>
        </div>

        {links.length === 0? (
          <div className="p-8 text-center text-sm text-gray-600">
            Nenhum link criado ainda. Crie seu primeiro link acima.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Short link</th>
                  <th className="px-4 py-3">Cliques</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => {
                  const linkCompleto = `${window.location.origin}/${link.shortCode}`;

                  return (
                    <tr key={link.id} className="border-b border-gray-100">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{link.title}</div>
                        <div className="mt-1 text-xs text-gray-600 line-clamp-2">
                          {link.url}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={linkCompleto}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          /{link.shortCode}
                        </a>
                      </td>
                      <td className="px-4 py-3">{link.clicks}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => copiarLink(link.shortCode)}
                          >
                            Copiar
                          </button>

                          <button
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            onClick={() => enviarTelegram(link)}
                            disabled={enviandoId === link.id}
                          >
                            {enviandoId === link.id? "Enviando..." : "Telegram"}
                          </button>

                          <button
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                            onClick={() => excluirLink(link.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}