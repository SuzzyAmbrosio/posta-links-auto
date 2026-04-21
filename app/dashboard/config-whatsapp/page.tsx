"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast, Toaster } from "sonner"
import { MessageCircle, CheckCircle2, AlertCircle, Smartphone, Users, X } from "lucide-react"

export default function ConfigWhatsappPage() {
  const { data: session } = useSession()
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [whatsappInstanceId, setWhatsappInstanceId] = useState("")
  const [whatsappToken, setWhatsappToken] = useState("")
  const [whatsappGroupId, setWhatsappGroupId] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [enviosHoje, setEnviosHoje] = useState(0)

  // Telegram
  const [telegramBotToken, setTelegramBotToken] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const [telegramConnected, setTelegramConnected] = useState(false)
  const [isSavingTelegram, setIsSavingTelegram] = useState(false)
  const [isDisconnectingTelegram, setIsDisconnectingTelegram] = useState(false)

  useEffect(() => {
    if (session) {
      loadSettings()
      loadStats()
    }
  }, [session])

  async function loadSettings() {
    try {
      const res = await fetch("/api/whatsapp")
      if (!res.ok) return
      const data = await res.json()
      const s = data.settings || {}

      setWhatsappNumber(s.whatsappNumber || "")
      setWhatsappInstanceId(s.whatsappInstanceId || "")
      setWhatsappToken(s.whatsappToken || "")
      setWhatsappGroupId(s.whatsappGroupId || "")

      // Checa se todos os campos estão preenchidos pra marcar como conectado
      const whatsappConectado =!!(s.whatsappNumber?.trim() && s.whatsappInstanceId?.trim() && s.whatsappToken?.trim() && s.whatsappGroupId?.trim())
      setIsConnected(whatsappConectado)

      setTelegramBotToken(s.telegramBotToken || "")
      setTelegramChatId(s.telegramChatId || "")
      setTelegramConnected(!!(s.telegramBotToken?.trim() && s.telegramChatId?.trim()))
    } catch (e) {
      console.error(e)
    }
  }

  async function loadStats() {
    try {
      const res = await fetch("/api/whatsapp/stats")
      if (!res.ok) return
      const data = await res.json()
      setEnviosHoje(data.enviosHoje || 0)
    } catch (e) {
      console.error(e)
    }
  }

  function validarGroupId(id: string) {
    return id.trim().endsWith("@g.us") || id.trim().includes("-")
  }

  async function salvarConfig() {
    if (!whatsappNumber ||!whatsappInstanceId ||!whatsappToken ||!whatsappGroupId) {
      toast.error("Preencha todos os campos")
      return
    }

    if (!validarGroupId(whatsappGroupId)) {
      toast.error("ID do grupo inválido. Deve terminar com @g.us")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappNumber: whatsappNumber.trim(),
          whatsappInstanceId: whatsappInstanceId.trim(),
          whatsappToken: whatsappToken.trim(),
          whatsappGroupId: whatsappGroupId.trim(),
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      setIsConnected(true)
      toast.success("WhatsApp configurado com sua API!")
      loadSettings() // Recarrega pra garantir
    } catch (e: any) {
      toast.error(e.message)
      setIsConnected(false)
    } finally {
      setIsSaving(false)
    }
  }

  async function desconectarWhatsapp() {
    if (!confirm("Tem certeza que quer desconectar o WhatsApp? Os posts automáticos vão parar.")) return

    setIsDisconnecting(true)
    try {
      const res = await fetch("/api/whatsapp/disconnect", { method: "POST" })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      setWhatsappNumber("")
      setWhatsappInstanceId("")
      setWhatsappToken("")
      setWhatsappGroupId("")
      setIsConnected(false)
      toast.success("WhatsApp desconectado")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsDisconnecting(false)
    }
  }

  async function salvarTelegram() {
    if (!telegramBotToken ||!telegramChatId) {
      toast.error("Preencha Token e Chat ID")
      return
    }

    setIsSavingTelegram(true)
    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramBotToken: telegramBotToken.trim(),
          telegramChatId: telegramChatId.trim(),
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      setTelegramConnected(true)
      toast.success("Telegram configurado!")
      loadSettings()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSavingTelegram(false)
    }
  }

  async function desconectarTelegram() {
    if (!confirm("Tem certeza que quer desconectar o Telegram? Os posts automáticos vão parar.")) return

    setIsDisconnectingTelegram(true)
    try {
      const res = await fetch("/api/telegram/disconnect", { method: "POST" })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      setTelegramBotToken("")
      setTelegramChatId("")
      setTelegramConnected(false)
      toast.success("Telegram desconectado")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsDisconnectingTelegram(false)
    }
  }

  async function testarEnvio() {
    if (!whatsappInstanceId ||!whatsappToken ||!whatsappGroupId) {
      toast.error("Salve todas as credenciais primeiro")
      return
    }

    setIsTesting(true)
    try {
      const res = await fetch(
        `https://api.z-api.io/instances/${whatsappInstanceId}/token/${whatsappToken}/send-text`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: whatsappGroupId,
            message: "✅ Bot conectado! Esse grupo vai receber ofertas automáticas do Posta Links Auto.",
          }),
        }
      )

      const data = await res.json()
      if (!res.ok || data?.error) throw new Error(data?.message || "Erro ao enviar")

      toast.success("Mensagem de teste enviada no grupo!")
      loadStats()
    } catch (e: any) {
      toast.error(`Erro: ${e.message}. Confere Instance ID e Token.`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Toaster richColors />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuração de Canais</h1>
        <p className="mt-1 text-sm text-gray-600">
          Conecte WhatsApp e Telegram para disparar ofertas automaticamente.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status WhatsApp</p>
              <p className="mt-1 text-2xl font-bold">
                {isConnected? (
                  <span className="text-green-600">Ativo</span>
                ) : (
                  <span className="text-red-600">Inativo</span>
                )}
              </p>
            </div>
            {isConnected? (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            ) : (
              <MessageCircle className="h-10 w-10 text-gray-400" />
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Envios Hoje</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{enviosHoje}</p>
            </div>
            <Smartphone className="h-10 w-10 text-green-600" />
          </div>
          <p className="mt-2 text-xs text-gray-500">Via sua API</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status Telegram</p>
              <p className="mt-1 text-2xl font-bold">
                {telegramConnected? (
                  <span className="text-green-600">Ativo</span>
                ) : (
                  <span className="text-red-600">Inativo</span>
                )}
              </p>
            </div>
            <Users className="h-10 w-10 text-blue-600" />
          </div>
        </div>
      </div>

      {/* WHATSAPP */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">WhatsApp via Z-API</h2>
          {isConnected && (
            <button
              onClick={desconectarWhatsapp}
              disabled={isDisconnecting}
              className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              {isDisconnecting? "Desconectando..." : "Desconectar"}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
              NÚMERO DO WHATSAPP
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="5583999999999"
              disabled={isConnected}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
              INSTANCE ID
            </label>
            <input
              type="text"
              value={whatsappInstanceId}
              onChange={(e) => setWhatsappInstanceId(e.target.value)}
              placeholder="3D1234ABCD"
              disabled={isConnected}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
              TOKEN
            </label>
            <input
              type="password"
              value={whatsappToken}
              onChange={(e) => setWhatsappToken(e.target.value)}
              placeholder="Client-Token da Z-API"
              disabled={isConnected}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
              ID DO GRUPO
            </label>
            <input
              type="text"
              value={whatsappGroupId}
              onChange={(e) => setWhatsappGroupId(e.target.value)}
              placeholder="120363123456789012@g.us"
              disabled={isConnected}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            {!isConnected && (
              <button
                type="button"
                onClick={salvarConfig}
                disabled={!whatsappNumber ||!whatsappInstanceId ||!whatsappToken ||!whatsappGroupId || isSaving}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving? "Salvando..." : "Conectar Minha API"}
              </button>
            )}
            <button
              type="button"
              onClick={testarEnvio}
              disabled={!isConnected || isTesting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isTesting? "Enviando..." : "Testar no Grupo"}
            </button>
          </div>
        </div>
      </div>

      {/* TELEGRAM */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Telegram Bot</h2>
          {telegramConnected && (
            <button
              onClick={desconectarTelegram}
              disabled={isDisconnectingTelegram}
              className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              {isDisconnectingTelegram? "Desconectando..." : "Desconectar"}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
              BOT TOKEN
            </label>
            <input
              type="password"
              value={telegramBotToken}
              onChange={(e) => setTelegramBotToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              disabled={telegramConnected}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
              CHAT ID
            </label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="-1001234567890"
              disabled={telegramConnected}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            {!telegramConnected && (
              <button
                type="button"
                onClick={salvarTelegram}
                disabled={!telegramBotToken ||!telegramChatId || isSavingTelegram}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingTelegram? "Salvando..." : "Salvar Configuração"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">⚠️ Importante:</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Você é responsável pelos custos da sua API. Z-API cobra por mensagem</li>
              <li>Use número secundário. Se tomar ban, perde o número</li>
              <li>Limite de envio: 1 mensagem a cada 3 minutos pra não bloquear</li>
              <li>Ao desconectar, os posts automáticos param imediatamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}