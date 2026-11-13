import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Link2, Loader2, PenLine, Search, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Hadis, KullaniciSorusu, SoruDurum } from '@/lib/types'
import { DereceRozeti } from '@/components/DereceRozeti'

export default function AdminSorular() {
  const [durum, setDurum] = useState<SoruDurum>('bekliyor')
  const [sorular, setSorular] = useState<KullaniciSorusu[] | null>(null)
  const [baglanan, setBaglanan] = useState<KullaniciSorusu | null>(null)

  async function yukle() {
    setSorular(null)
    const { data } = await supabase
      .from('kullanici_sorulari')
      .select('*')
      .eq('durum', durum)
      .order('created_at', { ascending: durum === 'bekliyor' })
      .limit(200)
    setSorular((data as KullaniciSorusu[]) ?? [])
  }

  useEffect(() => {
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durum])

  async function reddet(s: KullaniciSorusu) {
    const not = prompt(
      'Kullanıcıya kısa bir not (isteğe bağlı):',
      'Bu bir hadis değil / değerlendirmeye uygun değil.',
    )
    if (not === null) return
    await supabase
      .from('kullanici_sorulari')
      .update({ durum: 'reddedildi', cevap_notu: not.trim() || null })
      .eq('id', s.id)
    yukle()
  }

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold">Kullanıcı soruları</h1>
      <p className="mb-4 text-sm text-stone-500">“Bunu gördüm, doğru mu?” ile gelen gönderiler</p>

      <div className="mb-4 inline-flex gap-1 rounded-xl border border-sand bg-white p-1">
        {(['bekliyor', 'cevaplandi', 'reddedildi'] as SoruDurum[]).map((d) => (
          <button
            key={d}
            onClick={() => setDurum(d)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${durum === d ? 'bg-emerald-900 text-white' : 'text-stone-600'}`}
          >
            {d === 'bekliyor' ? 'Bekleyen' : d === 'cevaplandi' ? 'Cevaplanan' : 'Reddedilen'}
          </button>
        ))}
      </div>

      {sorular === null ? (
        <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-stone-400" />
      ) : sorular.length === 0 ? (
        <div className="kart p-8 text-center text-stone-500">Bu listede soru yok.</div>
      ) : (
        <div className="space-y-3">
          {sorular.map((s) => (
            <div key={s.id} className="kart p-4">
              <p className="whitespace-pre-line font-serif text-[15px] leading-relaxed">{s.metin}</p>
              <p className="mt-2 text-xs text-stone-400">
                {new Date(s.created_at).toLocaleString('tr-TR')}
                {s.nerede_gordu && ` · ${s.nerede_gordu}`}
              </p>
              {s.cevap_notu && <p className="mt-2 rounded-lg bg-parchment p-2 text-sm text-stone-600">Not: {s.cevap_notu}</p>}
              {s.durum === 'bekliyor' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to={`/admin/hadis/yeni?soru=${s.id}`} className="btn-ana px-3 py-2">
                    <PenLine className="h-4 w-4" /> Değerlendir
                  </Link>
                  <button className="btn-ikincil px-3 py-2" onClick={() => setBaglanan(s)}>
                    <Link2 className="h-4 w-4" /> Mevcut hadise bağla
                  </button>
                  <button className="btn-tehlike px-3 py-2" onClick={() => reddet(s)}>
                    <XCircle className="h-4 w-4" /> Reddet
                  </button>
                </div>
              )}
              {s.hadis_id && (
                <Link to={`/admin/hadis/${s.hadis_id}`} className="mt-2 inline-block text-sm font-semibold text-emerald-900">
                  Bağlı hadisi aç →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {baglanan && (
        <BaglaPenceresi
          soru={baglanan}
          kapat={() => setBaglanan(null)}
          bitti={() => {
            setBaglanan(null)
            yukle()
          }}
        />
      )}
    </div>
  )
}

function BaglaPenceresi({ soru, kapat, bitti }: { soru: KullaniciSorusu; kapat: () => void; bitti: () => void }) {
  const [q, setQ] = useState(soru.metin.slice(0, 80))
  const [sonuclar, setSonuclar] = useState<Hadis[]>([])

  useEffect(() => {
    const t = setTimeout(async () => {
      const { data } = await supabase.rpc('hadis_ara', { q, _limit: 10 })
      setSonuclar((data as Hadis[]) ?? [])
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  async function bagla(h: Hadis) {
    await supabase.from('kullanici_sorulari').update({ durum: 'cevaplandi', hadis_id: h.id }).eq('id', soru.id)
    bitti()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={kapat}>
      <div className="kart max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-b-none p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-3 font-serif text-lg font-semibold">Mevcut hadise bağla</h2>
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input className="girdi pl-9" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        </div>
        <div className="space-y-2">
          {sonuclar.map((h) => (
            <button key={h.id} onClick={() => bagla(h)} className="block w-full rounded-xl border border-sand p-3 text-left hover:bg-parchment">
              <DereceRozeti derece={h.derece} />
              <p className="mt-1 line-clamp-2 font-serif text-sm">{h.yaygin_versiyon || h.metin}</p>
            </button>
          ))}
          {sonuclar.length === 0 && <p className="text-sm text-stone-400">Eşleşen yayındaki hadis yok.</p>}
        </div>
        <button className="btn-ikincil mt-4 w-full" onClick={kapat}>
          Vazgeç
        </button>
      </div>
    </div>
  )
}
