'use client'

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type Settings = {
  aliexpressAppKey?: string;
  aliexpressSecret?: string;
  aliexpressTrackingId?: string;
  amazonAccessKey?: string;
  amazonSecretKey?: string;
  amazonAssociateTag?: string;
  shopeeAffiliateId?: string;
  shopeeAppKey?: string;
  mlAffiliateLink?: string;
  mlCode?: string;
  sheinAffiliateCode?: string;
  sheinTrackingId?: string;
};

export default function AfiliadosPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (session) loadSettings();
  }, [session]);

  async function loadSettings() {
    const res = await fetch("/api/affiliates");
    const data = await res.json();
    setSettings(data.settings || {});
  }

  async function salvar(platform: string, data: any) {
    setLoading(platform);
    try {
      const res = await fetch("/api/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform,...data }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success("Salvo com sucesso!");
      await loadSettings();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  const Card = ({ title, icon, children }: any) => (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Input = ({ label, value, onChange }: any) => (
    <div className="mb-3">
      <label className="mb-1 block text-xs font-bold uppercase text-gray-600">{label}</label>
      <input
        value={value || ""}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
      />
    </div>
  );

  const BotaoSalvar = ({ platform, data }: any) => (
    <>
      <button
        onClick={() => salvar(platform, data)}
        disabled={loading === platform}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading === platform? "Salvando..." : "Salvar"}
      </button>
      <div className="mt-2 rounded-lg bg-blue-50 px-4 py-2 text-center text-xs text-blue-700">
        💡 Dúvidas? CLIQUE AQUI
      </div>
    </>
  );

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Config Afiliados</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Afiliados AliExpress" icon="🛍️">
          <Input label="ALIEXPRESS APP KEY" value={settings.aliexpressAppKey}
            onChange={(e: any) => setSettings({...settings, aliexpressAppKey: e.target.value})} />
          <Input label="ALIEXPRESS SECRET" value={settings.aliexpressSecret}
            onChange={(e: any) => setSettings({...settings, aliexpressSecret: e.target.value})} />
          <Input label="ALIEXPRESS TRACKING ID" value={settings.aliexpressTrackingId}
            onChange={(e: any) => setSettings({...settings, aliexpressTrackingId: e.target.value})} />
          <BotaoSalvar platform="aliexpress" data={{
            aliexpressAppKey: settings.aliexpressAppKey,
            aliexpressSecret: settings.aliexpressSecret,
            aliexpressTrackingId: settings.aliexpressTrackingId,
          }} />
        </Card>

        <Card title="Afiliados Amazon" icon="📦">
          <Input label="AMAZON ACCESS KEY" value={settings.amazonAccessKey}
            onChange={(e: any) => setSettings({...settings, amazonAccessKey: e.target.value})} />
          <Input label="AMAZON SECRET KEY" value={settings.amazonSecretKey}
            onChange={(e: any) => setSettings({...settings, amazonSecretKey: e.target.value})} />
          <Input label="AMAZON ASSOCIATE TAG" value={settings.amazonAssociateTag}
            onChange={(e: any) => setSettings({...settings, amazonAssociateTag: e.target.value})} />
          <BotaoSalvar platform="amazon" data={{
            amazonAccessKey: settings.amazonAccessKey,
            amazonSecretKey: settings.amazonSecretKey,
            amazonAssociateTag: settings.amazonAssociateTag,
          }} />
        </Card>

        <Card title="Afiliados SHOPEE" icon="🛒">
          <Input label="SHOPEE ID DE AFILIADO" value={settings.shopeeAffiliateId}
            onChange={(e: any) => setSettings({...settings, shopeeAffiliateId: e.target.value})} />
          <Input label="SHOPEE APP KEY" value={settings.shopeeAppKey}
            onChange={(e: any) => setSettings({...settings, shopeeAppKey: e.target.value})} />
          <BotaoSalvar platform="shopee" data={{
            shopeeAffiliateId: settings.shopeeAffiliateId,
            shopeeAppKey: settings.shopeeAppKey,
          }} />
        </Card>

        <Card title="Afiliados Mercado Livre" icon="💛">
          <Input label="LINK DE AFILIADO MERCADO LIVRE" value={settings.mlAffiliateLink}
            onChange={(e: any) => setSettings({...settings, mlAffiliateLink: e.target.value})} />
          <Input label="CÓDIGO DO MERCADO LIVRE" value={settings.mlCode}
            onChange={(e: any) => setSettings({...settings, mlCode: e.target.value})} />
          <BotaoSalvar platform="ml" data={{
            mlAffiliateLink: settings.mlAffiliateLink,
            mlCode: settings.mlCode,
          }} />
        </Card>

        <Card title="Afiliados Shein" icon="👗">
          <Input label="SHEIN CÓDIGO DE AFILIADO" value={settings.sheinAffiliateCode}
            onChange={(e: any) => setSettings({...settings, sheinAffiliateCode: e.target.value})} />
          <Input label="SHEIN TRACKING ID" value={settings.sheinTrackingId}
            onChange={(e: any) => setSettings({...settings, sheinTrackingId: e.target.value})} />
          <BotaoSalvar platform="shein" data={{
            sheinAffiliateCode: settings.sheinAffiliateCode,
            sheinTrackingId: settings.sheinTrackingId,
          }} />
        </Card>
      </div>
    </div>
  );
}