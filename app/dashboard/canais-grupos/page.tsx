"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast, Toaster } from "sonner"
import { Plus, Send, MessageCircle, Trash2, ExternalLink, Users, Hash, CheckCircle2, Settings, Info, HelpCircle, AlertCircle, X, Edit } from "lucide-react"
import Link from "next/link"

type Channel = {
  id: string
  name: string
  type: "telegram" | "whatsapp"
  chatId?: string
  groupId?: string
  avatar?: string | null // ADICIONA ESSA LINHA
  interval?: number | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type Stats = {
  telegramCount: number
  whatsappCount: number
  activeCount: number
  total: number
  limit: number
}

export default function CanaisGruposPage() {
  const { data: session } = useSession()
  const [channels, setChannels] = useState<Channel[]>([])
  const [stats, setStats] = useState<Stats>({ telegramCount: 0, whatsappCount: 0, activeCount: 0, total: 0, limit: 1 })
  const [activeTab, setActiveTab] = useState<"todos" | "telegram" | "whatsapp">("todos")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newChannelType, setNewChannelType] = useState<"telegram" | "whatsapp">("telegram")
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelId, setNewChannelId] = useState("")
  const [newInterval, setNewInterval] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [telegramConnected, setTelegramConnected] = useState(false)
  const [whatsappConnected, setWhatsappConnected] = useState(false)

  useEffect(() => {
    if (session) {
      loadSettings()
      loadData()
    }
  }, [session])

  useEffect(() => {
    // Auto-seleciona a plataforma conectada
    if (telegramConnected &&!whatsappConnected) {
      setNewChannelType("telegram")
    } else if (!telegramConnected && whatsappConnected) {
      setNewChannelType("whatsapp")
    }
  }, [telegramConnected, whatsappConnected])

  async function loadSettings() {
    try {
      const res = await fetch("/api/settings")
      if (!res.ok) return
      const data = await res.json()
      setTelegramConnected(data.telegramConnected)
      setWhatsappConnected(data.whatsappConnected)
    } catch (e) {
      console.error(e)
    }
  }

  async function loadData() {
    try {
      const res = await fetch("/api/channels")
      if (!res.ok) throw new Error("Erro ao carregar canais")
      const data = await res.json()

      const all: Channel[] = [
    ...data.telegram.map((c: any) => ({...c, type: "telegram" })),
    ...data.whatsapp.map((c: any) => ({...c, type: "whatsapp" }))
      ]

      setChannels(all)
      setStats(data.stats)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function adicionarCanal() {
    if (!newChannelName ||!newChannelId) {
      toast.error("Preencha nome e ID")
      return
    }

    if (stats.total >= stats.limit) {
      toast.error("Limite atingido. Faça upgrade do plano.")
      return
    }

    if (newChannelType === "whatsapp" &&!newChannelId.endsWith("@g.us")) {
      toast.error("ID do WhatsApp deve terminar com @g.us")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newChannelType,
          name: newChannelName,
          chatId: newChannelType === "telegram"? newChannelId : undefined,
          groupId: newChannelType === "whatsapp"? newChannelId : undefined,
          interval: newInterval? parseInt(newInterval) : null
        })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      toast.success("Canal/Grupo adicionado!")
      setShowAddModal(false)
      setNewChannelName("")
      setNewChannelId("")
      setNewInterval("")
      loadData()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function removerCanal(id: string, type: "telegram" | "whatsapp") {
    if (!confirm("Deseja remover este canal/grupo?")) return

    try {
      const res = await fetch(`/api/channels/${id}?type=${type}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao excluir")
      }
      toast.success("Excluído com sucesso")
      loadData()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  async function toggleStatus(id: string, type: "telegram" | "whatsapp", currentStatus: boolean) {
    try {
      const res = await fetch(`/api/channels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, isActive:!currentStatus })
      })
      if (!res.ok) throw new Error("Erro ao atualizar status")
      loadData()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const filteredChannels = channels.filter(c => {
    if (activeTab === "todos") return true
    return c.type === activeTab
  })

  const limiteAtingido = stats.total >= stats.limit
  const nenhumaPlataformaConectada =!telegramConnected &&!whatsappConnected

  return (
    <div className="space-y-5">
      <Toaster richColors />

      {/* Banner INICIANTES */}
      <div className="rounded-lg border border-[#FFE082] bg-[#FFF8E1] px-5 py-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm leading-relaxed text-amber-900">
            <span className="mr-1">⚠️</span>
            <strong>Atenção:</strong> Você está utilizando o plano <strong>INICIANTES (7 dias grátis)</strong>, que possui limitações, como marca d'água nos posts e suporte a afiliados reduzido. Para desbloquear todos os recursos, considere fazer um upgrade para um plano premium!
          </p>
          <button className="inline-flex items-center rounded-md bg-[#FFC107] px-4 py-2 text-sm font-bold text-slate-900 hover:bg-amber-400">
            Upgrade Agora 🚀
          </button>
        </div>
      </div>

      {/* Header Gerenciar Grupos */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">Gerenciar Grupos de Configuração</h2>
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
            <Info size={14} />
            <span>Configure seus grupos e organize suas publicações</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={() => setShowAddModal(true)}
            disabled={limiteAtingido || nenhumaPlataformaConectada}
            className="flex items-center gap-2 rounded-md bg-[#1976D2] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Plus size={18} />
            Adicionar Grupo
          </button>
          {limiteAtingido && (
            <p className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle size={12} />
              Limite atingido: {stats.total}/{stats.limit}
            </p>
          )}
          {nenhumaPlataformaConectada && (
            <p className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle size={12} />
              Conecte Telegram ou WhatsApp primeiro
            </p>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Canais Telegram</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.telegramCount}</p>
            </div>
            <Send className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Grupos WhatsApp</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.whatsappCount}</p>
            </div>
            <MessageCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ativos Agora</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.activeCount}</p>
            </div>
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("todos")}
            className={`border-b-2 pb-3 text-sm font-medium transition ${
              activeTab === "todos"
            ? "border-[#1976D2] text-[#1976D2]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab("telegram")}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition ${
              activeTab === "telegram"
            ? "border-[#1976D2] text-[#1976D2]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Send size={16} />
            Telegram ({stats.telegramCount})
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition ${
              activeTab === "whatsapp"
            ? "border-[#1976D2] text-[#1976D2]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <MessageCircle size={16} />
            WhatsApp ({stats.whatsappCount})
          </button>
        </div>
      </div>

      {/* Lista de Canais */}
      <div className="space-y-3">
        {loading? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-sm text-gray-600">Carregando...</p>
          </div>
        ) : filteredChannels.length === 0? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">
              Nenhum canal ou grupo adicionado ainda
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={limiteAtingido || nenhumaPlataformaConectada}
              className="mt-4 rounded-lg bg-[#1976D2] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Adicionar Primeiro Canal
            </button>
          </div>
        ) : (
          filteredChannels.map((channel) => (
            <div
              key={channel.id}
              className="rounded-lg border border-gray-300 bg-white p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                  {channel.type === "telegram"? (
                    <img
                      src={channel?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel?.name || 'C')}&background=random`}
                      alt={channel?.name || 'Canal'}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <Hash size={24} className="text-gray-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">{channel.name}</h3>
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                      ID: {channel.chatId || channel.groupId}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Post Auto:</span>
                      <button
                        onClick={() => toggleStatus(channel.id, channel.type, channel.isActive)}
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          channel.isActive
                        ? "bg-[#E8F5E9] text-[#2E7D32]"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {channel.isActive? "ATIVO" : "INATIVO"}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Intervalo:</span>
                      <span className="font-semibold text-gray-900">{channel.interval? `${channel.interval}min` : "N/A"}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/dashboard/canais-grupos/${channel.id}?type=${channel.type}`}
                      className="flex items-center gap-1.5 rounded-md bg-[#1976D2] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <Edit size={15} />
                      Editar
                    </Link>
                    <button
                      onClick={() => removerCanal(channel.id, channel.type)}
                      className="flex items-center gap-1.5 rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Banner Ajuda */}
      <div className="rounded-lg border border-[#B3E5FC] bg-[#E1F5FE] p-4">
        <p className="flex items-center gap-2 text-sm text-[#0277BD]">
          <HelpCircle size={16} />
          <strong>Precisa de ajuda?</strong> Assista nosso tutorial em vídeo
          <a href="#" className="ml-1 font-semibold text-[#1976D2] hover:underline">
            clicando aqui <ExternalLink size={12} className="inline" />
          </a>
        </p>
      </div>

      {/* Modal Adicionar - SEM O CHECKBOX DE ALEATÓRIO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Adicionar Canal/Grupo</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase text-gray-700">
                  PLATAFORMA
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewChannelType("telegram")}
                    disabled={!telegramConnected}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition ${
                      newChannelType === "telegram"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <Send size={18} />
                    Telegram
                  </button>
                  <button
                    onClick={() => setNewChannelType("whatsapp")}
                    disabled={!whatsappConnected}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition ${
                      newChannelType === "whatsapp"
                    ? "border-green-600 bg-green-50 text-green-600"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </button>
                </div>
                {nenhumaPlataformaConectada && (
                  <p className="mt-2 text-xs text-red-600">Conecte Telegram ou WhatsApp nas configurações primeiro</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
                  NOME DO CANAL/GRUPO
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Ex: Ofertas Posta Links Auto"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
                  {newChannelType === "telegram"? "CHAT ID" : "ID DO GRUPO"}
                </label>
                <input
                  type="text"
                  value={newChannelId}
                  onChange={(e) => setNewChannelId(e.target.value)}
                  placeholder={newChannelType === "telegram"? "-1001234567890" : "1203630421@g.us"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {newChannelType === "telegram"
                 ? "Use @userinfobot pra pegar o Chat ID"
                    : "Deve terminar com @g.us"
                  }
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
                  INTERVALO (MINUTOS)
                </label>
                <input
                  type="number"
                  value={newInterval}
                  onChange={(e) => setNewInterval(e.target.value)}
                  placeholder="Deixe vazio para manual"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={adicionarCanal}
                  disabled={!newChannelName ||!newChannelId || isSaving || nenhumaPlataformaConectada}
                  className="flex-1 rounded-lg bg-[#1976D2] py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isSaving? "Salvando..." : "Adicionar"}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewChannelName("")
                    setNewChannelId("")
                    setNewInterval("")
                  }}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}