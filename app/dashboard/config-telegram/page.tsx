"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast, Toaster } from "sonner"
import { Send, Bot, CheckCircle2, AlertCircle, ExternalLink, Copy, Check, X } from "lucide-react"

export default function ConfigTelegramPage() {
  const { data: session } = useSession()
  const [botToken, setBotToken] = useState("")
  const [chatId, setChatId] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [copied, setCopied] = useState(false)

  const webhookUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/telegram/webhook`
    : "https://seusite.com/api/telegram/webhook"

  useEffect(() => {
    if (session) loadSettings()
  }, [session])

  async function loadSettings() {
    try {
      const res = await fetch("/api/telegram")
      if (!res.ok) return
      const data = await res.json()
      const token = data.settings?.telegramBotToken || ""
      const id = data.settings?.telegramChatId || ""
      setBotToken(token)
      setChatId(id)
      setIsConnected(!!token?.trim() && !!id?.trim())
    } catch (e) {
      console.error(e)
    }
  }

  async function salvarConfig() {
    if (!botToken) {
      toast.error("Preencha o Bot Token")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramBotToken: botToken, telegramChatId: chatId }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      setIsConnected(true)
      toast.success("Configurações do Telegram salvas!")
    } catch (e: any) {
      toast.error(e.message)
      setIsConnected(false)
    } finally {
      setIsSaving(false)
    }
  }

  async function desconectarTelegram() {
    if (!confirm("Tem certeza que quer desconectar o Telegram? Os posts automáticos vão parar.")) return

    setIsDisconnecting(true)
    try {
      const res = await fetch("/api/telegram/disconnect", { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setBotToken("")
      setChatId("")
      setIsConnected(false)
      toast.success("Telegram desconectado com sucesso!")
    } catch (e: any) {
      toast.error(e.message || "Erro ao desconectar")
    } finally {
      setIsDisconnecting(false)
    }
  }

  async function testarConexao() {
    if (!botToken || !chatId) {
      toast.error("Salve Token e Chat ID primeiro")
      return
    }

    setIsTesting(true)
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ Bot conectado com sucesso no Posta Links Auto!",
        }),
      })

      const data = await res.json()
      if (!data.ok) throw new Error(data.description || "Erro ao enviar mensagem")

      toast.success("Mensagem de teste enviada! Confere no Telegram.")
    } catch (e: any) {
      toast.error(`Erro ao testar: ${e.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  function copiarWebhook() {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Toaster richColors />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuração Telegram</h1>
        <p className="mt-1 text-sm text-gray-600">
          Conecte seu bot do Telegram ao Posta Links Auto para enviar ofertas automaticamente para seus canais e grupos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status do Bot</p>
              <p className="mt-1 text-2xl font-bold">
                {isConnected ? (
                  <span className="text-green-600">Conectado</span>
                ) : (
                  <span className="text-red-600">Desconectado</span>
                )}
              </p>
            </div>
            {isConnected ? (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            ) : (
              <Bot className="h-10 w-10 text-gray-400" />
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mensagens Enviadas</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">3,847</p>
            </div>
            <Send className="h-10 w-10 text-blue-600" />
          </div>
          <p className="mt-2 text-xs text-gray-500">Últimos 30 dias</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Canais Ativos</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">5</p>
            </div>
            <Bot className="h-10 w-10 text-purple-600" />
          </div>
          <p className="mt-2 text-xs text-gray-500">Configure em Canais/Grupos</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Como criar seu Bot do Telegram</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              1
            </div>
            <div>
              <p className="font-semibold text-gray-900">Abra o Telegram e procure por @BotFather</p>
              <p className="mt-1 text-sm text-gray-600">
                Esse é o bot oficial do Telegram para criar novos bots.
              </p>
              <a 
                href="https://t.me/botfather" 
                target="_blank" 
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                Abrir @BotFather <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              2
            </div>
            <div>
              <p className="font-semibold text-gray-900">Envie /newbot e siga as instruções</p>
              <p className="mt-1 text-sm text-gray-600">
                Escolha um nome para seu bot e um username terminado em "bot".
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              3
            </div>
            <div>
              <p className="font-semibold text-gray-900">Copie o Token do seu bot</p>
              <p className="mt-1 text-sm text-gray-600">
                O BotFather vai te enviar um token parecido com: <code className="rounded bg-gray-100 px-1">123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11</code>
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              4
            </div>
            <div>
              <p className="font-semibold text-gray-900">Cole o token abaixo e salve</p>
              <p className="mt-1 text-sm text-gray-600">
                Depois adicione seu bot como administrador nos canais/grupos onde quer postar.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Configurar Bot</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
              BOT TOKEN
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              disabled={isConnected}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Cole aqui o token que o @BotFather te enviou
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
              CHAT ID
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="-1001234567890"
              disabled={isConnected}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              ID do canal/grupo principal. Use @userinfobot pra descobrir
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
              WEBHOOK URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600"
              />
              <button
                type="button"
                onClick={copiarWebhook}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Configure essa URL no seu bot se quiser receber comandos
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            {!isConnected && (
              <button
                type="button"
                onClick={salvarConfig}
                disabled={!botToken || isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Salvando..." : "Salvar Configuração"}
              </button>
            )}
            {isConnected && (
              <>
                <button
                  type="button"
                  onClick={testarConexao}
                  disabled={isTesting}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isTesting ? "Enviando..." : "Testar Envio"}
                </button>
                <button
                  onClick={desconectarTelegram}
                  disabled={isDisconnecting}
                  className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  {isDisconnecting ? "Desconectando..." : "Desconectar"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isConnected && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Bot Conectado com Sucesso!</p>
            <p className="text-sm text-green-700">
              Seu bot está pronto para enviar ofertas. Configure os canais em Canais/Grupos.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">⚠️ Importante:</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Adicione seu bot como administrador nos canais/grupos onde quer postar</li>
              <li>Dê permissão de "Postar mensagens" para o bot funcionar</li>
              <li>O plano INICIANTE permite até 500 envios/dia. Faça upgrade para ilimitado</li>
              <li>Respeite os limites do Telegram para não ter o bot bloqueado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}