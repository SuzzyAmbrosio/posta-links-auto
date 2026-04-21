"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast, Toaster } from "sonner"
import { MessageCircle, CheckCircle2, AlertCircle, Smartphone, QrCode } from "lucide-react"

export default function ConfigWhatsappPage() {
  const { data: session } = useSession()
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [whatsappApiKey, setWhatsappApiKey] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    if (session) loadSettings()
  }, [session])

  async function loadSettings() {
    try {
      const res = await fetch("/api/whatsapp")
      if (!res.ok) return
      const data = await res.json()
      const number = data.settings?.whatsappNumber || ""
      const key = data.settings?.whatsappApiKey || ""
      setWhatsappNumber(number)
      setWhatsappApiKey(key)
      setIsConnected(!!number)
    } catch (e) {
      console.error(e)
    }
  }

  async function salvarConfig() {
    if (!whatsappNumber) {
      toast.error("Preencha o número do WhatsApp")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber, whatsappApiKey }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      setIsConnected(true)
      toast.success("Configurações do WhatsApp salvas!")
    } catch (e: any) {
      toast.error(e.message)
      setIsConnected(false)
    } finally {
      setIsSaving(false)
    }
  }

  async function testarConexao() {
    if (!whatsappNumber) {
      toast.error("Salve o número primeiro")
      return
    }

    setIsTesting(true)
    try {
      // Aqui você vai chamar sua API de WhatsApp real depois
      // Por enquanto só simula
      await new Promise(r => setTimeout(r, 1500))
      toast.success("Mensagem de teste enviada! Confere no WhatsApp.")
    } catch (e: any) {
      toast.error(`Erro ao testar: ${e.message}`)
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
          Conecte seu WhatsApp Business ao Posta Links Auto para disparar ofertas automaticamente para seus grupos e contatos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status WhatsApp</p>
              <p className="mt-1 text-2xl font-bold">
                {isConnected? (
                  <span className="text-green-600">Conectado</span>
                ) : (
                  <span className="text-red-600">Desconectado</span>
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
              <p className="text-sm text-gray-600">Mensagens Enviadas</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <Smartphone className="h-10 w-10 text-green-600" />
          </div>
          <p className="mt-2 text-xs text-gray-500">Últimos 30 dias</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Grupos Ativos</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">8</p>
            </div>
            <MessageCircle className="h-10 w-10 text-purple-600" />
          </div>
          <p className="mt-2 text-xs text-gray-500">Configure em Canais/Grupos</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Como conectar seu WhatsApp</h2>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              1
            </div>
            <div>
              <p className="font-semibold text-gray-900">Use WhatsApp Business</p>
              <p className="mt-1 text-sm text-gray-600">
                Baixe o WhatsApp Business no celular. É gratuito e permite automação.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              2
            </div>
            <div>
              <p className="font-semibold text-gray-900">Conecte via API ou QR Code</p>
              <p className="mt-1 text-sm text-gray-600">
                Use uma API como Z-API, Evolution API, ou escaneie o QR Code para conectar.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              3
            </div>
            <div>
              <p className="font-semibold text-gray-900">Cole o número e API Key abaixo</p>
              <p className="mt-1 text-sm text-gray-600">
                Use o formato: 5583999999999 (código do país + DDD + número)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Configurar WhatsApp</h2>

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
              Código do país + DDD + número. Ex: 5583999999999
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
              API KEY (Opcional)
            </label>
            <input
              type="text"
              value={whatsappApiKey}
              onChange={(e) => setWhatsappApiKey(e.target.value)}
              placeholder="Chave da API Z-API, Evolution, etc"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Se usar Z-API, Evolution API ou similar. Deixe vazio se for conectar por QR Code
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={salvarConfig}
              disabled={!whatsappNumber || isSaving}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving? "Salvando..." : "Salvar Configuração"}
            </button>
            <button
              type="button"
              onClick={testarConexao}
              disabled={!isConnected || isTesting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isTesting? "Enviando..." : "Testar Envio"}
            </button>
          </div>
        </div>
      </div>

      {isConnected && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">WhatsApp Conectado com Sucesso!</p>
            <p className="text-sm text-green-700">
              Seu WhatsApp está pronto para disparar ofertas. Configure os grupos em Canais/Grupos.
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
              <li>Use WhatsApp Business para evitar bloqueio do número</li>
              <li>Não dispare spam. Respeite a LGPD e leis de marketing</li>
              <li>O plano INICIANTE permite até 200 envios/dia. Faça upgrade para ilimitado</li>
              <li>Mantenha o celular conectado se usar QR Code</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}