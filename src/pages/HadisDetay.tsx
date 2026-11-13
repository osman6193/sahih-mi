import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Image as ImageIcon, Loader2, Share2, UserRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAlimler, useKonular, kaynakYazi } from '@/lib/veri'
import { DERECELER, DERECE_HEX } from '@/lib/derece'
import type { Hadis } from '@/lib/types'
import { DereceRozeti } from '@/components/DereceRozeti'
import { PaylasimKarti } from '@/components/PaylasimKarti'
import { gorselPaylas, metinPaylas } from '@/lib/paylas'

export default function HadisDetay() {
  const { id } = useParams()
  const nav = useNavigate()
  const [hadis, setHadis] = useState<Hadis | null | undefined>(undefined)
  const [paylasiliyor, setPaylasiliyor] = useState(false)
  const kartRef = useRef<HTMLDivElement>(null)
  const alimler = useAlimler()
  const konular = useKonular()

  useEffect(() => {
    if (!id) return
    supabase
      .from('hadisler')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => setHadis((data as Hadis) ?? null))
    supabase.rpc('hadis_okundu', { _id: id })
  }, [id])

  if (hadis === undefined)
    return <Loader2 className="mx-auto mt-24 h-6 w-6 animate-spin text-stone-400" />
  if (hadis === null)
    return (
      <div className="p-10 text-center">
        <p className="font-serif text-lg">Hadis bulunamadı.</p>
        <button className="btn-ikincil mt-4" onClick={() => nav('/')}>
          Ana sayfa
        </button>
      </div>
    )

  const d = DERECELER[hadis.derece]
  const alim = alimler.find((a) => a.id === hadis.alim_id)
  const konu = konular.find((k) => k.id === hadis.konu_id)
  const paylasimMetni =
    `${d.isaret} ${d.kisa}\n\n“${hadis.yaygin_versiyon || hadis.metin}”\n\n` +
    (hadis.kaynaklar?.length && hadis.derece !== 'uydurma'
      ? `📚 ${hadis.kaynaklar.map(kaynakYazi).join(' · ')}\n\n`
      : '') +
    `Sahih mi? uygulamasıyla duyduğun hadisi kontrol et.`

  async function gorselIlePaylas() {
    if (!kartRef.current) return
    setPaylasiliyor(true)
    try {
      await gorselPaylas(kartRef.current, paylasimMetni)
    } catch (e) {
      console.warn(e)
    } finally {
      setPaylasiliyor(false)
    }
  }

  return (
    <div>
      <header className="pt-safe desen bg-emerald-950 text-parchment">
        <div className="px-5 pb-20 pt-5">
          <button onClick={() => nav(-1)} className="-ml-1 flex items-center gap-1 text-sm text-emerald-100/80">
            <ArrowLeft className="h-4 w-4" /> Geri
          </button>
          {konu && (
            <p className="mt-4 text-sm text-emerald-100/70">
              {konu.ikon} {konu.ad}
            </p>
          )}
        </div>
      </header>

      <div className="-mt-16 space-y-4 px-5">
        {/* Hüküm kartı */}
        <section className={`kart overflow-hidden border-2 ${d.cizgi}`}>
          <div className={`flex items-center gap-3 px-5 py-4 ${d.zemin}`}>
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
              style={{ background: DERECE_HEX[hadis.derece] }}
            >
              {d.isaret}
            </span>
            <div>
              <p className={`text-lg font-extrabold tracking-wide ${d.renk}`}>{d.ad}</p>
              <p className="text-[13px] leading-snug text-stone-600">{d.aciklama}</p>
            </div>
          </div>
          <div className="p-5">
            {hadis.yaygin_versiyon && (
              <>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Dolaşan hâli
                </p>
                <p className="font-serif text-[17px] italic leading-relaxed text-stone-600">
                  “{hadis.yaygin_versiyon}”
                </p>
                <div className="my-4 h-px bg-sand" />
              </>
            )}
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
              {hadis.yaygin_versiyon ? 'Kaynaklardaki metin' : 'Metin'}
            </p>
            <p className="font-serif text-[19px] leading-relaxed text-ink">“{hadis.metin}”</p>
            {hadis.arapca_metin && (
              <p dir="rtl" lang="ar" className="mt-4 font-arabic text-2xl leading-loose text-emerald-950">
                {hadis.arapca_metin}
              </p>
            )}
          </div>
        </section>

        {/* Kaynaklar */}
        {hadis.kaynaklar?.length > 0 && (
          <section className="kart p-5">
            <h2 className="mb-3 flex items-center gap-2 font-serif font-semibold">
              <BookOpen className="h-4 w-4 text-gold" /> Kaynaklar
            </h2>
            <ul className="space-y-2">
              {hadis.kaynaklar.map((k, i) => (
                <li key={i} className="flex gap-2 text-[15px]">
                  <span className="text-gold">•</span>
                  <span>
                    <b>{k.kitap}</b>
                    {k.bolum && <>, {k.bolum}</>}
                    {k.numara && <span className="text-stone-500"> — No: {k.numara}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Âlim değerlendirmesi */}
        {(hadis.aciklama || alim) && (
          <section className="kart p-5">
            <h2 className="mb-3 font-serif font-semibold">Âlim değerlendirmesi</h2>
            {hadis.aciklama && (
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-stone-700">{hadis.aciklama}</p>
            )}
            {alim && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-parchment p-3">
                {alim.foto_url ? (
                  <img src={alim.foto_url} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-900/10">
                    <UserRound className="h-5 w-5 text-emerald-900" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">
                    {alim.unvan ? `${alim.unvan} ` : ''}
                    {alim.ad}
                  </p>
                  {alim.biyografi && <p className="line-clamp-2 text-xs text-stone-500">{alim.biyografi}</p>}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Paylaş */}
        <section className="grid grid-cols-2 gap-3 pb-4">
          <button className="btn-ana py-3.5" onClick={gorselIlePaylas} disabled={paylasiliyor}>
            {paylasiliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            Görsel paylaş
          </button>
          <button className="btn-ikincil py-3.5" onClick={() => metinPaylas(paylasimMetni)}>
            <Share2 className="h-4 w-4" /> Metin paylaş
          </button>
        </section>
        <div className="flex justify-center pb-6">
          <DereceRozeti derece={hadis.derece} />
        </div>
      </div>

      {/* Görsel için gizli kart */}
      <div aria-hidden style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}>
        <PaylasimKarti ref={kartRef} hadis={hadis} alim={alim} />
      </div>
    </div>
  )
}
