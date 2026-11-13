import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock, Loader2, Send, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { soruEkle, sorularimiOku } from '@/lib/sorularim'
import type { SoruDurum } from '@/lib/types'
import { SayfaBasligi } from '@/components/Layout'

interface SoruDurumSatiri {
  id: string
  durum: SoruDurum
  hadis_id: string | null
  cevap_notu: string | null
  metin: string
  created_at: string
}

const KAYNAK_SECENEKLERI = ['WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'YouTube', 'Sohbet / vaaz', 'Diğer']

export default function Sor() {
  const [params] = useSearchParams()
  const [metin, setMetin] = useState(params.get('metin') ?? '')
  const [nerede, setNerede] = useState('')
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [basarili, setBasarili] = useState(false)
  const [hata, setHata] = useState('')
  const [sorularim, setSorularim] = useState<SoruDurumSatiri[]>([])

  async function sorulariYukle() {
    const ids = sorularimiOku()
    if (!ids.length) return setSorularim([])
    const { data } = await supabase.rpc('soru_durumlari', { _ids: ids })
    const liste = ((data as SoruDurumSatiri[]) ?? []).sort((a, b) => b.created_at.localeCompare(a.created_at))
    setSorularim(liste)
  }

  useEffect(() => {
    sorulariYukle()
  }, [])

  async function gonder(e: React.FormEvent) {
    e.preventDefault()
    setHata('')
    const temiz = metin.trim()
    if (temiz.length < 10) return setHata('Lütfen sözü biraz daha eksiksiz yaz (en az 10 karakter).')
    setGonderiliyor(true)
    // RLS gereği gönderen kişi satırı geri okuyamaz; ID'yi burada üretiyoruz.
    const id = crypto.randomUUID()
    const { error } = await supabase
      .from('kullanici_sorulari')
      .insert({ id, metin: temiz, nerede_gordu: nerede || null })
    setGonderiliyor(false)
    if (error) return setHata('Gönderilemedi, internet bağlantını kontrol edip tekrar dene.')
    soruEkle(id)
    setBasarili(true)
    setMetin('')
    setNerede('')
    sorulariYukle()
  }

  return (
    <div>
      <SayfaBasligi baslik="Bunu gördüm, doğru mu?" alt="Duyduğun sözü gönder, âlimlerimiz incelesin" />

      <div className="space-y-6 p-5">
        {basarili ? (
          <div className="kart flex flex-col items-center p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-sahih" />
            <p className="mt-3 font-serif text-xl font-semibold">Gönderildi, Allah razı olsun</p>
            <p className="mt-1 text-sm text-stone-500">
              Âlimlerimiz inceleyince aşağıdaki “Sorularım” listesinde göreceksin.
            </p>
            <button className="btn-ikincil mt-5" onClick={() => setBasarili(false)}>
              Başka bir şey sor
            </button>
          </div>
        ) : (
          <form onSubmit={gonder} className="kart space-y-4 p-5">
            <div>
              <label className="etiket" htmlFor="metin">
                Gördüğün / duyduğun söz
              </label>
              <textarea
                id="metin"
                className="girdi min-h-[140px] resize-y font-serif leading-relaxed"
                placeholder="Mesajı olduğu gibi buraya yapıştırabilirsin…"
                value={metin}
                maxLength={2000}
                onChange={(e) => setMetin(e.target.value)}
              />
              <p className="mt-1 text-right text-xs text-stone-400">{metin.length}/2000</p>
            </div>
            <div>
              <span className="etiket">Nerede gördün? (isteğe bağlı)</span>
              <div className="flex flex-wrap gap-2">
                {KAYNAK_SECENEKLERI.map((k) => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => setNerede(nerede === k ? '' : k)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      nerede === k ? 'border-emerald-900 bg-emerald-900 text-white' : 'border-sand bg-white text-stone-600'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
            {hata && <p className="text-sm text-red-600">{hata}</p>}
            <button className="btn-ana w-full py-3" disabled={gonderiliyor}>
              {gonderiliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Âlimlere gönder
            </button>
            <p className="text-center text-xs text-stone-400">Hesap gerekmez. Kimlik bilgin alınmaz.</p>
          </form>
        )}

        {sorularim.length > 0 && (
          <section>
            <h2 className="mb-3 font-serif text-lg font-semibold">Sorularım</h2>
            <div className="space-y-3">
              {sorularim.map((s) => (
                <SoruSatiri key={s.id} s={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function SoruSatiri({ s }: { s: SoruDurumSatiri }) {
  const durum = {
    bekliyor: { ikon: Clock, renk: 'text-amber-600', ad: 'İnceleniyor' },
    cevaplandi: { ikon: CheckCircle2, renk: 'text-sahih', ad: 'Cevaplandı' },
    reddedildi: { ikon: XCircle, renk: 'text-stone-400', ad: 'Değerlendirilmedi' },
  }[s.durum]
  const Ikon = durum.ikon
  const icerik = (
    <>
      <p className="line-clamp-2 font-serif text-[15px]">“{s.metin}”</p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1 font-semibold ${durum.renk}`}>
          <Ikon className="h-3.5 w-3.5" /> {durum.ad}
        </span>
        <span className="text-stone-400">{new Date(s.created_at).toLocaleDateString('tr-TR')}</span>
      </div>
      {s.cevap_notu && <p className="mt-2 rounded-lg bg-parchment p-2.5 text-sm text-stone-600">{s.cevap_notu}</p>}
      {s.hadis_id && <p className="mt-2 text-sm font-semibold text-emerald-900">Değerlendirmeyi gör →</p>}
    </>
  )
  return s.hadis_id ? (
    <Link to={`/hadis/${s.hadis_id}`} className="kart block p-4 transition hover:shadow-md">
      {icerik}
    </Link>
  ) : (
    <div className="kart p-4">{icerik}</div>
  )
}
