"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast, Toaster } from "sonner"
import { MessageCircle, CheckCircle2, AlertCircle, Smartphone, Users } from "lucide-react"

export default function ConfigWhatsappPage() {
  const { data: session } = useSession()
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [whatsappInstanceId, setWhatsappInstanceId] = useState("")
  const [whatsappToken, setWhatsappToken] = useState("")
  const [whatsappGroupId, setWhatsappGroupId] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
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
      setWhatsappNumber(data.settings?.whatsappNumber || "")
      setWhatsappInstanceId(data.settings?.whatsappInstanceId || "")
      setWhatsappToken(data.settings?.whatsappToken || "")
      setWhatsappGroupId(data.settings?.whatsappGroupId || "")
      setIsConnected(
       !!data.settings?.whatsappNumber &&
       !!data.settings?.whatsappInstanceId &&
       !!data.settings?.whatsappToken &&
       !!data.settings?.whatsappGroupId
      )
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
    // Grupo termina com @g.us
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
    } catch (e: any) {
      toast.error(e.message)
      setIsConnected(false)
    } finally {
      setIsSaving(false)
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
          Conecte sua própria API do WhatsApp para disparar ofertas no seu grupo automaticamente.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
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
              <p className="text-sm text-gray-600">Grupo Conectado</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{isConnected? "1" : "0"}</p>
            </div>
            <Users className="h-10 w-10 text-purple-600" />
          </div>
          <p className="mt-2 text-xs text-gray-500">Recebe posts automáticos</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Como pegar suas credenciais da Z-API</h2>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              1
            </div>
            <div>
              <p className="font-semibold text-gray-900">Crie conta em z-api.io</p>
              <p className="mt-1 text-sm text-gray-600">
                Plano grátis dá pra testar. Depois cobra por mensagem enviada.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              2
            </div>
            <div>
              <p className="font-semibold text-gray-900">Crie uma Instância e escaneie o QR Code</p>
              <p className="mt-1 text-sm text-gray-600">
                Use WhatsApp Business no celular que vai disparar as mensagens.
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
                Fica em Instâncias &gt; Sua instância &gt; Detalhes
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
                Z-API &gt; Grupos &gt; Lista. Copia o ID tipo: 120363123456789012@g.us
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Suas Credenciais da API</h2>

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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Número que vai enviar as mensagens. Ex: 5583999999999
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">ID da sua instância na Z-API</p>
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Token secreto da sua instância</p>
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Grupo onde os produtos serão postados automaticamente
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={salvarConfig}
              disabled={!whatsappNumber ||!whatsappInstanceId ||!whatsappToken ||!whatsappGroupId || isSaving}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving? "Salvando..." : "Conectar Minha API"}
            </button>
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

      {isConnected && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Sua API está conectada!</p>
            <p className="text-sm text-green-700">
              O cron vai usar suas credenciais pra postar no seu grupo automaticamente.
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
              <li>Você é responsável pelos custos da sua API. Z-API cobra por mensagem</li>
              <li>Use número secundário. Se tomar ban, perde o número</li>
              <li>Limite de envio: 1 mensagem a cada 3 minutos pra não bloquear</li>
              <li>Se trocar de API, só atualizar Instance ID e Token aqui</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}