"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast, Toaster } from "sonner"
import Image from "next/image"
import { ExternalLink } from "lucide-react"

type Settings = {
  aliexpressAppKey?: string
  aliexpressSecret?: string
  aliexpressTrackingId?: string
  amazonAccessKey?: string
  amazonSecretKey?: string
  amazonAssociateTag?: string
  shopeeAffiliateId?: string
  shopeeAppKey?: string
  mlAffiliateLink?: string
  mlCode?: string
  sheinAffiliateCode?: string
  sheinTrackingId?: string
}

// Componente Card FORA do componente principal pra não perder foco
const Card = ({ id, name, logo, fields, settings, setSettings, loading, onSave, children }: any) => (
  <div className="rounded-lg border border-gray-200 bg-white p-5">
    <div className="mb-4 flex items-center gap-3">
      <Image
        src={logo}
        alt={name}
        width={40}
        height={40}
        className="rounded object-contain"
        unoptimized
      />
      <h3 className="font-semibold text-gray-900">{name}</h3>
    </div>

    <div className="space-y-3">
      {fields.map((field: any) => (
        <div key={field.key}>
          <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
            {field.label}
          </label>
          {field.type === "textarea"? (
            <textarea
              value={settings[field.key] || ""}
              onChange={(e) => setSettings((prev: Settings) => ({...prev, [field.key]: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={settings[field.key] || ""}
              onChange={(e) => setSettings((prev: Settings) => ({...prev, [field.key]: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          )}
        </div>
      ))}
    </div>

    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log("Clicou salvar:", id)
        onSave(id)
      }}
      disabled={loading === id}
      className="mt-4 w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading === id? "Salvando..." : "Salvar"}
    </button>

    {children}
  </div>
)

const HelpBox = ({ text }: { text: string }) => (
  <div className="mt-4 rounded bg-blue-50 p-3 text-center text-xs text-blue-600">
    💡 {text}
  </div>
)

export default function ConfigAfiliadosPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    if (session) loadSettings()
  }, [session])

  async function loadSettings() {
    try {
      const res = await fetch("/api/affiliates")
      if (!res.ok) return
      const data = await res.json()
      setSettings(data.settings || {})
    } catch (e) {
      console.error(e)
    }
  }

  async function salvar(platform: string) {
    setLoading(platform)
    try {
      // Envia só os campos da plataforma específica
      const payload = { platform,...settings }

      const res = await fetch("/api/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Erro ao salvar")

      toast.success("Salvo com sucesso!")
      await loadSettings()
    } catch (e: any) {
      toast.error(e.message)
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <Toaster richColors />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          id="aliexpress"
          name="Afiliados AliExpress"
          logo="/logo-aliexpress.png"
          settings={settings}
          setSettings={setSettings}
          loading={loading}
          onSave={salvar}
          fields={[
            { label: "ALIEXPRESS APP KEY", key: "aliexpressAppKey" },
            { label: "ALIEXPRESS SECRET", key: "aliexpressSecret" },
            { label: "ALIEXPRESS TRACKING ID", key: "aliexpressTrackingId" },
          ]}
        >
          <HelpBox text="Dúvidas? CLIQUE AQUI" />
        </Card>

        <Card
          id="amazon"
          name="Afiliados Amazon"
          logo="/logo-amazon.png"
          settings={settings}
          setSettings={setSettings}
          loading={loading}
          onSave={salvar}
          fields={[
            { label: "AMAZON ACCESS KEY", key: "amazonAccessKey" },
            { label: "AMAZON SECRET KEY", key: "amazonSecretKey" },
            { label: "AMAZON ASSOCIATE TAG", key: "amazonAssociateTag" },
          ]}
        >
          <HelpBox text="Dúvidas? CLIQUE AQUI" />
        </Card>

        <Card
          id="shopee"
          name="Afiliados SHOPEE"
          logo="/logo-shopee.png"
          settings={settings}
          setSettings={setSettings}
          loading={loading}
          onSave={salvar}
          fields={[
            { label: "SHOPEE ID DE AFILIADO", key: "shopeeAffiliateId" },
            { label: "SHOPEE APP KEY", key: "shopeeAppKey" },
          ]}
        >
          <HelpBox text="Dúvidas? CLIQUE AQUI" />
        </Card>

        <Card
          id="mercadolivre"
          name="Afiliados Mercado Livre"
          logo="/logo-mercadolivre.png"
          settings={settings}
          setSettings={setSettings}
          loading={loading}
          onSave={salvar}
          fields={[
            { label: "LINK DE AFILIADO MERCADO LIVRE", key: "mlAffiliateLink" },
            { label: "CÓDIGO DO MERCADO LIVRE", key: "mlCode", type: "textarea" },
          ]}
        >
          <div className="mt-4 rounded bg-blue-50 p-4 text-xs text-gray-700">
            <p className="mb-2 font-semibold">💡 Como obter suas credenciais</p>
            <p className="mb-2">{`1. Link de Afiliado: Acesse sua conta de afiliado do Mercado Livre > Clique em 'Meus Links' > 'Compartilhar' ou copie qualquer link de produto. Cole o link completo no campo ao lado. O sistema irá automaticamente extrair sua Tag.`}</p>
            <p className="mb-2">{`2. Código do Mercado Livre: Acesse sua conta de afiliado do Mercado Livre. Procure por 'ID de Afiliado' ou 'Código de Afiliado'. Na página de 'Anúncios' > 'Meus Links' > 'Gerar Link' > 'Personalizado'. Em 'Recomendados' > 'Busca' > 'Copiar'.`}</p>
            <p className="mb-2">⚠️ Importante: Use o código apenas se não conseguir o link acima. Se a tag já estiver presente no link, o sistema irá priorizá-la.</p>
            <button className="mt-2 flex items-center gap-1 text-blue-600 hover:underline">
              <ExternalLink size={14} />
              Dúvidas? CLIQUE AQUI VEJA O VÍDEO
            </button>
          </div>
        </Card>

        <Card
          id="shein"
          name="Afiliados Shein"
          logo="/logo-shein.png"
          settings={settings}
          setSettings={setSettings}
          loading={loading}
          onSave={salvar}
          fields={[
            { label: "SHEIN CÓDIGO DE AFILIADO", key: "sheinAffiliateCode" },
            { label: "SHEIN TRACKING ID", key: "sheinTrackingId" },
          ]}
        >
          <HelpBox text="Dúvidas? CLIQUE AQUI" />
        </Card>
      </div>
    </div>
  )
}