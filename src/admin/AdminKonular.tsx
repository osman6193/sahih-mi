import { useEffect, useState } from 'react'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cacheTemizle } from '@/lib/veri'
import type { Konu } from '@/lib/types'

function slugla(s: string) {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[âà]/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function AdminKonular() {
  const [konular, setKonular] = useState<Konu[] | null>(null)
  const [yeniAd, setYeniAd] = useState('')
  const [yeniIkon, setYeniIkon] = useState('')
  const [hata, setHata] = useState('')

  async function yukle() {
    const { data } = await supabase.from('konular').select('*').order('sira')
    setKonular((data as Konu[]) ?? [])
    cacheTemizle()
  }
  useEffect(() => {
    yukle()
  }, [])

  async function ekle(e: React.FormEvent) {
    e.preventDefault()
    if (!yeniAd.trim()) return
    const sira = Math.max(0, ...(konular ?? []).filter((k) => k.sira < 99).map((k) => k.sira)) + 1
    const { error } = await supabase
      .from('konular')
      .insert({ ad: yeniAd.trim(), slug: slugla(yeniAd), ikon: yeniIkon.trim() || null, sira })
    if (error) return setHata(error.message)
    setYeniAd('')
    setYeniIkon('')
    setHata('')
    yukle()
  }

  async function guncelle(k: Konu) {
    const { error } = await supabase.from('konular').update({ ad: k.ad, ikon: k.ikon, sira: k.sira }).eq('id', k.id)
    setHata(error ? error.message : '')
    yukle()
  }

  async function sil(k: Konu) {
    if (!confirm(`“${k.ad}” silinsin mi? Bu konudaki hadisler konusuz kalır.`)) return
    await supabase.from('konular').delete().eq('id', k.id)
    yukle()
  }

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl font-bold">Konular</h1>
      <form onSubmit={ekle} className="kart mb-4 flex gap-2 p-3">
        <input className="girdi w-16 text-center" placeholder="🌿" value={yeniIkon} onChange={(e) => setYeniIkon(e.target.value)} />
        <input className="girdi flex-1" placeholder="Yeni konu adı" value={yeniAd} onChange={(e) => setYeniAd(e.target.value)} />
        <button className="btn-ana">
          <Plus className="h-4 w-4" />
        </button>
      </form>
      {hata && <p className="mb-3 text-sm text-red-600">{hata}</p>}
      {konular === null ? (
        <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-stone-400" />
      ) : (
        <div className="kart divide-y divide-sand">
          {konular.map((k) => (
            <KonuSatiri key={k.id} konu={k} kaydet={guncelle} sil={sil} />
          ))}
        </div>
      )}
    </div>
  )
}

function KonuSatiri({ konu, kaydet, sil }: { konu: Konu; kaydet: (k: Konu) => void; sil: (k: Konu) => void }) {
  const [k, setK] = useState(konu)
  const degisti = k.ad !== konu.ad || k.ikon !== konu.ikon || k.sira !== konu.sira
  return (
    <div className="flex items-center gap-2 p-3">
      <input className="girdi w-14 px-2 text-center" value={k.ikon ?? ''} onChange={(e) => setK({ ...k, ikon: e.target.value })} />
      <input className="girdi flex-1" value={k.ad} onChange={(e) => setK({ ...k, ad: e.target.value })} />
      <input
        className="girdi w-16 px-2 text-center"
        type="number"
        title="Sıra"
        value={k.sira}
        onChange={(e) => setK({ ...k, sira: Number(e.target.value) })}
      />
      {degisti && (
        <button className="btn-ana px-3" onClick={() => kaydet(k)}>
          <Save className="h-4 w-4" />
        </button>
      )}
      <button className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600" onClick={() => sil(konu)}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
