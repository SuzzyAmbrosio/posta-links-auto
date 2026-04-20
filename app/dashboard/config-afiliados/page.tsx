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
      const data = await res.json()
      setSettings(data.settings || {})
    } catch (e) {
      console.error(e)
    }
  }

  async function salvar(platform: string, data: any) {
    setLoading(platform)
    try {
      const res = await fetch("/api/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform,...data }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      toast.success("Salvo com sucesso!")
      await loadSettings()
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar")
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  const Card = ({ id, name, logo, fields, children }: any) => (
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
          <div key={field.name}>
            <label className="mb-1 block text-xs font-medium uppercase text-gray-700">
              {field.label}
            </label>
            {field.type === "textarea"? (
              <textarea
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                rows={3}
              />
            ) : (
              <input
                type="text"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
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
          console.log("Clicou salvar:", id, settings)
          salvar(id, fieldData(id))
        }}
        disabled={loading === id}
        className="mt-4 w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading === id? "Salvando..." : "Salvar"}
      </button>

      {children}
    </div>
  )

  const fieldData = (id: string) => {
    switch (id) {
      case "aliexpress":
        return {
          aliexpressAppKey: settings.aliexpressAppKey,
          aliexpressSecret: settings.aliexpressSecret,
          aliexpressTrackingId: settings.aliexpressTrackingId,
        }
      case "amazon":
        return {
          amazonAccessKey: settings.amazonAccessKey,
          amazonSecretKey: settings.amazonSecretKey,
          amazonAssociateTag: settings.amazonAssociateTag,
        }
      case "shopee":
        return {
          shopeeAffiliateId: settings.shopeeAffiliateId,
          shopeeAppKey: settings.shopeeAppKey,
        }
      case "mercadolivre":
        return {
          mlAffiliateLink: settings.mlAffiliateLink,
          mlCode: settings.mlCode,
        }
      case "shein":
        return {
          sheinAffiliateCode: settings.sheinAffiliateCode,
          sheinTrackingId: settings.sheinTrackingId,
        }
      default:
        return {}
    }
  }

  const HelpBox = ({ text }: { text: string }) => (
    <div className="mt-4 rounded bg-blue-50 p-3 text-center text-xs text-blue-600">
      💡 {text}
    </div>
  )

  return (
    <div>
      <Toaster richColors />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          id="aliexpress"
          name="Afiliados AliExpress"
          logo="/logo-aliexpress.png"
          fields={[
            {
              label: "ALIEXPRESS APP KEY",
              value: settings.aliexpressAppKey,
              onChange: (v: string) => setSettings({...settings, aliexpressAppKey: v }),
            },
            {
              label: "ALIEXPRESS SECRET",
              value: settings.aliexpressSecret,
              onChange: (v: string) => setSettings({...settings, aliexpressSecret: v }),
            },
            {
              label: "ALIEXPRESS TRACKING ID",
              value: settings.aliexpressTrackingId,
              onChange: (v: string) => setSettings({...settings, aliexpressTrackingId: v }),
            },
          ]}
        >
          <HelpBox text="Dúvidas? CLIQUE AQUI" />
        </Card>

        <Card
          id="amazon"
          name="Afiliados Amazon"
          logo="/logo-amazon.png"
          fields={[
            {
              label: "AMAZON ACCESS KEY",
              value: settings.amazonAccessKey,
              onChange: (v: string) => setSettings({...settings, amazonAccessKey: v }),
            },
            {
              label: "AMAZON SECRET KEY",
              value: settings.amazonSecretKey,
              onChange: (v: string) => setSettings({...settings, amazonSecretKey: v }),
            },
            {
              label: "AMAZON ASSOCIATE TAG",
              value: settings.amazonAssociateTag,
              onChange: (v: string) => setSettings({...settings, amazonAssociateTag: v }),
            },
          ]}
        >
          <HelpBox text="Dúvidas? CLIQUE AQUI" />
        </Card>

        <Card
          id="shopee"
          name="Afiliados SHOPEE"
          logo="/logo-shopee.png"
          fields={[
            {
              label: "SHOPEE ID DE AFILIADO",
              value: settings.shopeeAffiliateId,
              onChange: (v: string) => setSettings({...settings, shopeeAffiliateId: v }),
            },
            {
              label: "SHOPEE APP KEY",
              value: settings.shopeeAppKey,
              onChange: (v: string) => setSettings({...settings, shopeeAppKey: v }),
            },
          ]}
        >
          <HelpBox text="Dúvidas? CLIQUE AQUI" />
        </Card>

        <Card
          id="mercadolivre"
          name="Afiliados Mercado Livre"
          logo="/logo-mercadolivre.png"
          fields={[
            {
              label: "LINK DE AFILIADO MERCADO LIVRE",
              value: settings.mlAffiliateLink,
              onChange: (v: string) => setSettings({...settings, mlAffiliateLink: v }),
            },
            {
              label: "CÓDIGO DO MERCADO LIVRE",
              type: "textarea",
              value: settings.mlCode,
              onChange: (v: string) => setSettings({...settings, mlCode: v }),
            },
          ]}
        >
          <div className="mt-4 rounded bg-blue-50 p-4 text-xs text-gray-700">
            <p className="mb-2 font-semibold">💡 Como obter suas credenciais</p>
            <p className="mb-2">1. Link de Afiliado: Acesse sua conta de afiliado do Mercado Livre &gt; Clique em 'Meus Links' &gt; 'Compartilhar' ou copie qualquer link de produto. Cole o link completo no campo ao lado. O sistema irá automaticamente extrair sua Tag.</p>
            <p className="mb-2">2. Código do Mercado Livre: Acesse sua conta de afiliado do Mercado Livre. Procure por 'ID de Afiliado' ou 'Código de Afiliado'. Na página de 'Anúncios' &gt; 'Meus Links' &gt; 'Gerar Link' &gt; 'Personalizado'. Em 'Recomendados' &gt; 'Busca' &gt; 'Copiar'.</p>
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
          fields={[
            {
              label: "SHEIN CÓDIGO DE AFILIADO",
              value: settings.sheinAffiliateCode,
              onChange: (v: string) => setSettings({...settings, sheinAffiliateCode: v }),
            },
            {
              label: "SHEIN TRACKING ID",
              value: settings.sheinTrackingId,
              onChange: (v: string) => setSettings({...settings, sheinTrackingId: v }),
            },
          ]}
        >
          <HelpBox text="Dúvidas? CLIQUE AQUI" />
        </Card>
      </div>
    </div>
  )
}