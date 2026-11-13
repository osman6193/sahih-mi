import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Loader2, MessageCircleQuestion, SearchX } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useKonular } from '@/lib/veri'
import { DERECELER, DERECE_SIRASI } from '@/lib/derece'
import type { Derece, Hadis } from '@/lib/types'
import { AramaCubugu } from '@/components/AramaCubugu'
import { HadisKarti } from '@/components/HadisKarti'

export default function AnaSayfa() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [derece, setDerece] = useState<Derece | null>(null)
  const [sonuclar, setSonuclar] = useState<Hadis[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const konular = useKonular()
  const konuMap = useMemo(() => new Map(konular.map((k) => [k.id, k])), [konular])

  useEffect(() => {
    setYukleniyor(true)
    const t = setTimeout(async () => {
      setParams(q ? { q } : {}, { replace: true })
      const { data } = await supabase.rpc('hadis_ara', {
        q: q.trim(),
        _derece: derece,
        _limit: q.trim() ? 40 : 20,
      })
      setSonuclar((data as Hadis[]) ?? [])
      setYukleniyor(false)
    }, 280)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, derece])

  const aramaVar = q.trim().length > 0

  return (
    <div>
      <header className="pt-safe desen relative bg-emerald-950 text-parchment">
        <div className="px-5 pb-16 pt-8">
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="" className="h-9 w-9" />
            <span className="font-serif text-2xl font-bold tracking-tight">Sahih mi?</span>
          </div>
          <p className="mt-4 max-w-sm font-serif text-[22px] leading-snug">
            Duyduğun hadis gerçekten <span className="text-gold">Peygamberimize</span> mi ait?
          </p>
          <p className="mt-2 text-sm text-emerald-100/70">
            Kaynağını ve sıhhatini âlimlerin değerlendirmesiyle öğren.
          </p>
        </div>
        <div className="absolute inset-x-5 -bottom-7">
          <AramaCubugu deger={q} degisti={setQ} />
        </div>
      </header>

      <div className="px-5 pt-11">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          <FiltreCipi aktif={derece === null} onClick={() => setDerece(null)}>
            Tümü
          </FiltreCipi>
          {DERECE_SIRASI.map((d) => (
            <FiltreCipi key={d} aktif={derece === d} onClick={() => setDerece(derece === d ? null : d)}>
              {DERECELER[d].isaret} {DERECELER[d].ad.split(' ')[0]}
            </FiltreCipi>
          ))}
        </div>

        <div className="mb-3 mt-6 flex items-baseline justify-between">
          <h2 className="font-serif text-lg font-semibold">
            {aramaVar ? 'Arama sonuçları' : 'Son değerlendirilenler'}
          </h2>
          {yukleniyor && <Loader2 className="h-4 w-4 animate-spin text-stone-400" />}
        </div>

        {!yukleniyor && sonuclar.length === 0 ? (
          <BosDurum aramaVar={aramaVar} q={q} />
        ) : (
          <div className="space-y-3">
            {sonuclar.map((h) => (
              <HadisKarti key={h.id} hadis={h} konu={h.konu_id ? konuMap.get(h.konu_id) : undefined} />
            ))}
          </div>
        )}

        {aramaVar && sonuclar.length > 0 && (
          <Link
            to={`/sor?metin=${encodeURIComponent(q)}`}
            className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-gold/60 bg-gold/5 p-4 text-sm"
          >
            <MessageCircleQuestion className="h-5 w-5 shrink-0 text-gold" />
            <span>
              Aradığın burada değil mi? <b className="text-emerald-900">Âlimlerimize sor →</b>
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}

function FiltreCipi({ aktif, onClick, children }: { aktif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        aktif ? 'border-emerald-900 bg-emerald-900 text-white' : 'border-sand bg-white text-stone-600'
      }`}
    >
      {children}
    </button>
  )
}

function BosDurum({ aramaVar, q }: { aramaVar: boolean; q: string }) {
  return (
    <div className="kart flex flex-col items-center px-6 py-10 text-center">
      <SearchX className="h-10 w-10 text-stone-300" />
      <p className="mt-3 font-serif text-lg font-semibold">
        {aramaVar ? 'Bu söz henüz değerlendirilmemiş' : 'Henüz hadis eklenmemiş'}
      </p>
      <p className="mt-1 max-w-xs text-sm text-stone-500">
        {aramaVar
          ? 'Gönder, âlimlerimiz incelesin. Cevaplandığında “Sorularım” bölümünde görürsün.'
          : 'Âlimlerimiz değerlendirdikçe burada görünecek.'}
      </p>
      <Link to={`/sor${aramaVar ? `?metin=${encodeURIComponent(q)}` : ''}`} className="btn-ana mt-5">
        <MessageCircleQuestion className="h-4 w-4" /> Âlimlere sor
      </Link>
    </div>
  )
}
