import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Plus, Save, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useOturum } from '@/lib/oturum'
import { useAlimler, useKonular } from '@/lib/veri'
import { DERECELER, DERECE_SIRASI, DERECE_HEX } from '@/lib/derece'
import type { Derece, Hadis, Kaynak } from '@/lib/types'

interface Form {
  metin: string
  yaygin_versiyon: string
  arapca_metin: string
  derece: Derece
  kaynaklar: Kaynak[]
  aciklama: string
  konu_id: string
  alim_id: string
  yayinda: boolean
}

const BOS: Form = {
  metin: '',
  yaygin_versiyon: '',
  arapca_metin: '',
  derece: 'sahih',
  kaynaklar: [],
  aciklama: '',
  konu_id: '',
  alim_id: '',
  yayinda: true,
}

export default function HadisFormu() {
  const { id } = useParams()
  const yeni = !id || id === 'yeni'
  const [params] = useSearchParams()
  const soruId = params.get('soru')
  const nav = useNavigate()
  const { admin, benimAlim } = useOturum()
  const konular = useKonular()
  const alimler = useAlimler()

  const [form, setForm] = useState<Form>(BOS)
  const [yukleniyor, setYukleniyor] = useState(!yeni || !!soruId)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hata, setHata] = useState('')

  useEffect(() => {
    if (!yeni) {
      supabase
        .from('hadisler')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          const h = data as Hadis
          if (h)
            setForm({
              metin: h.metin,
              yaygin_versiyon: h.yaygin_versiyon ?? '',
              arapca_metin: h.arapca_metin ?? '',
              derece: h.derece,
              kaynaklar: h.kaynaklar ?? [],
              aciklama: h.aciklama ?? '',
              konu_id: h.konu_id ?? '',
              alim_id: h.alim_id ?? '',
              yayinda: h.yayinda,
            })
          setYukleniyor(false)
        })
    } else {
      setForm((f) => ({ ...f, alim_id: f.alim_id || benimAlim?.id || '' }))
      if (soruId) {
        supabase
          .from('kullanici_sorulari')
          .select('metin')
          .eq('id', soruId)
          .single()
          .then(({ data }) => {
            if (data) setForm((f) => ({ ...f, yaygin_versiyon: (data as { metin: string }).metin }))
            setYukleniyor(false)
          })
      }
    }
  }, [id, yeni, soruId, benimAlim?.id])

  const g = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))

  async function kaydet(e: React.FormEvent) {
    e.preventDefault()
    setHata('')
    if (!form.metin.trim()) return setHata('Metin zorunlu.')
    setKaydediliyor(true)
    const kayit = {
      metin: form.metin.trim(),
      yaygin_versiyon: form.yaygin_versiyon.trim() || null,
      arapca_metin: form.arapca_metin.trim() || null,
      derece: form.derece,
      kaynaklar: form.kaynaklar
        .map((k) => ({ kitap: k.kitap.trim(), bolum: k.bolum?.trim() || undefined, numara: k.numara?.trim() || undefined }))
        .filter((k) => k.kitap),
      aciklama: form.aciklama.trim() || null,
      konu_id: form.konu_id || null,
      alim_id: form.alim_id || null,
      yayinda: form.yayinda,
    }
    const sonuc = yeni
      ? await supabase.from('hadisler').insert(kayit).select('id').single()
      : await supabase.from('hadisler').update(kayit).eq('id', id).select('id').single()

    if (sonuc.error || !sonuc.data) {
      setKaydediliyor(false)
      return setHata('Kaydedilemedi: ' + (sonuc.error?.message ?? 'bilinmeyen hata'))
    }
    if (soruId) {
      await supabase
        .from('kullanici_sorulari')
        .update({ durum: 'cevaplandi', hadis_id: (sonuc.data as { id: string }).id })
        .eq('id', soruId)
    }
    setKaydediliyor(false)
    nav(soruId ? '/admin/sorular' : '/admin')
  }

  async function sil() {
    if (!confirm('Bu hadis kalıcı olarak silinsin mi?')) return
    const { error } = await supabase.from('hadisler').delete().eq('id', id)
    if (error) return setHata('Silinemedi: ' + error.message)
    nav('/admin')
  }

  if (yukleniyor) return <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-stone-400" />

  return (
    <form onSubmit={kaydet} className="space-y-5">
      <button type="button" onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-stone-500">
        <ArrowLeft className="h-4 w-4" /> Geri
      </button>
      <h1 className="font-serif text-2xl font-bold">{yeni ? 'Yeni hadis' : 'Hadisi düzenle'}</h1>
      {soruId && (
        <p className="rounded-xl bg-gold/10 p-3 text-sm text-stone-700">
          Kullanıcı sorusundan oluşturuluyor. Kaydedince soru “cevaplandı” olarak işaretlenir.
        </p>
      )}

      {/* Derece */}
      <section className="kart p-5">
        <span className="etiket">Hüküm</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DERECE_SIRASI.map((d) => {
            const secili = form.derece === d
            return (
              <button
                type="button"
                key={d}
                onClick={() => g('derece', d)}
                className="rounded-xl border-2 px-3 py-3 text-sm font-bold transition"
                style={{
                  borderColor: secili ? DERECE_HEX[d] : '#efe8d8',
                  background: secili ? DERECE_HEX[d] : 'white',
                  color: secili ? 'white' : DERECE_HEX[d],
                }}
              >
                {DERECELER[d].isaret} {DERECELER[d].ad}
              </button>
            )
          })}
        </div>
      </section>

      {/* Metinler */}
      <section className="kart space-y-4 p-5">
        <div>
          <label className="etiket">Sosyal medyada dolaşan hâli</label>
          <textarea
            className="girdi min-h-[80px] font-serif"
            placeholder="İnsanların paylaştığı şekliyle (arama bu metinde de yapılır)"
            value={form.yaygin_versiyon}
            onChange={(e) => g('yaygin_versiyon', e.target.value)}
          />
        </div>
        <div>
          <label className="etiket">
            {form.derece === 'uydurma' ? 'Metin *' : 'Kaynaklardaki Türkçe metin *'}
          </label>
          <textarea
            className="girdi min-h-[100px] font-serif"
            value={form.metin}
            onChange={(e) => g('metin', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="etiket">Arapça metin (isteğe bağlı)</label>
          <textarea
            dir="rtl"
            lang="ar"
            className="girdi min-h-[80px] font-arabic text-xl"
            value={form.arapca_metin}
            onChange={(e) => g('arapca_metin', e.target.value)}
          />
        </div>
      </section>

      {/* Kaynaklar */}
      <section className="kart p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="etiket mb-0">Kaynaklar</span>
          <button
            type="button"
            className="btn-ikincil px-3 py-1.5"
            onClick={() => g('kaynaklar', [...form.kaynaklar, { kitap: '', bolum: '', numara: '' }])}
          >
            <Plus className="h-4 w-4" /> Ekle
          </button>
        </div>
        {form.kaynaklar.length === 0 && <p className="text-sm text-stone-400">Henüz kaynak eklenmedi.</p>}
        <div className="space-y-2">
          {form.kaynaklar.map((k, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] gap-2 rounded-xl bg-parchment p-2 sm:grid-cols-[2fr_1.5fr_1fr_auto]">
              <input
                className="girdi"
                placeholder="Kitap (ör. Buhârî)"
                value={k.kitap}
                onChange={(e) => g('kaynaklar', form.kaynaklar.map((x, j) => (j === i ? { ...x, kitap: e.target.value } : x)))}
              />
              <button
                type="button"
                className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 sm:order-last"
                onClick={() => g('kaynaklar', form.kaynaklar.filter((_, j) => j !== i))}
                aria-label="Kaldır"
              >
                <X className="h-4 w-4" />
              </button>
              <input
                className="girdi"
                placeholder="Bölüm (ör. İlim)"
                value={k.bolum ?? ''}
                onChange={(e) => g('kaynaklar', form.kaynaklar.map((x, j) => (j === i ? { ...x, bolum: e.target.value } : x)))}
              />
              <input
                className="girdi"
                placeholder="No"
                value={k.numara ?? ''}
                onChange={(e) => g('kaynaklar', form.kaynaklar.map((x, j) => (j === i ? { ...x, numara: e.target.value } : x)))}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Değerlendirme */}
      <section className="kart space-y-4 p-5">
        <div>
          <label className="etiket">Âlim değerlendirmesi / açıklama</label>
          <textarea
            className="girdi min-h-[140px]"
            placeholder="Neden bu hükme varıldı? Senet durumu, râvi değerlendirmesi, doğru bilgi…"
            value={form.aciklama}
            onChange={(e) => g('aciklama', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiket">Konu</label>
            <select className="girdi" value={form.konu_id} onChange={(e) => g('konu_id', e.target.value)}>
              <option value="">— Seçin —</option>
              {konular.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ikon} {k.ad}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="etiket">Değerlendiren âlim</label>
            <select
              className="girdi"
              value={form.alim_id}
              onChange={(e) => g('alim_id', e.target.value)}
              disabled={!admin && !!benimAlim}
            >
              <option value="">— Seçin —</option>
              {alimler.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.unvan ? `${a.unvan} ` : ''}
                  {a.ad}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-parchment p-3">
          <input
            type="checkbox"
            className="h-5 w-5 accent-emerald-900"
            checked={form.yayinda}
            onChange={(e) => g('yayinda', e.target.checked)}
          />
          <span>
            <b>Yayında</b>
            <span className="block text-xs text-stone-500">Kapalıysa taslak olarak kalır, kullanıcılar görmez.</span>
          </span>
        </label>
      </section>

      {hata && <p className="text-sm text-red-600">{hata}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 pb-10">
        {!yeni && admin ? (
          <button type="button" className="btn-tehlike" onClick={sil}>
            <Trash2 className="h-4 w-4" /> Sil
          </button>
        ) : (
          <span />
        )}
        <button className="btn-ana px-6 py-3" disabled={kaydediliyor}>
          {kaydediliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Kaydet
        </button>
      </div>
    </form>
  )
}
