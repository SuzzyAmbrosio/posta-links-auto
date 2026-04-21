"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast, Toaster } from "sonner"
import { MessageCircle, CheckCircle2, AlertCircle, Smartphone, X, ExternalLink } from "lucide-react"

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

      const whatsappConectado =!!(s.whatsappNumber?.trim() && s.whatsappInstanceId?.trim() && s.whatsappToken?.trim() && s.whatsappGroupId?.trim())
      setIsConnected(whatsappConectado)
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
      loadSettings()
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
        <h1 className="text-2xl font-bold text-gray-900">Configuração WhatsApp</h1>
        <p className="mt-1 text-sm text-gray-600">
          Conecte sua API do WhatsApp para disparar ofertas automaticamente nos seus grupos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Como conectar sua Z-API</h2>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              1
            </div>
            <div>
              <p className="font-semibold text-gray-900">Crie uma conta na Z-API</p>
              <p className="mt-1 text-sm text-gray-600">
                Acesse z-api.io e crie sua instância. Você ganha 7 dias grátis pra testar.
              </p>
              <a
                href="https://z-api.io"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-green-600 hover:underline"
              >
                Abrir Z-API <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              2
            </div>
            <div>
              <p className="font-semibold text-gray-900">Conecte seu WhatsApp escaneando o QR Code</p>
              <p className="mt-1 text-sm text-gray-600">
                Use um número secundário. Se tomar ban, você perde o número.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              3
            </div>
            <div>
              <p className="font-semibold text-gray-900">Copie Instance ID e Token</p>
              <p className="mt-1 text-sm text-gray-600">
                No painel da Z-API você encontra o Instance ID e Client-Token da sua instância.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              4
            </div>
            <div>
              <p className="font-semibold text-gray-900">Pegue o ID do grupo</p>
              <p className="mt-1 text-sm text-gray-600">
                Adicione o bot @getidsbot no seu grupo do WhatsApp. Ele vai enviar o ID que termina com <code className="rounded bg-gray-100 px-1">@g.us</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Credenciais da API</h2>
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
            <p className="mt-1 text-xs text-gray-500">
              Número conectado na Z-API, com DDI+DDD sem símbolos
            </p>
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
            <p className="mt-1 text-xs text-gray-500">
              Encontrado no painel da Z-API
            </p>
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
            <p className="mt-1 text-xs text-gray-500">
              Client-Token da sua instância na Z-API
            </p>
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
            <p className="mt-1 text-xs text-gray-500">
              Adicione @getidsbot no grupo pra pegar o ID
            </p>
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