import { useEffect, useState } from 'react'
import { Loader2, Plus, Save, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cacheTemizle } from '@/lib/veri'
import type { Alim } from '@/lib/types'

type Duzenlenen = Partial<Alim> & { ad: string }

export default function AdminAlimler() {
  const [alimler, setAlimler] = useState<Alim[] | null>(null)
  const [duzen, setDuzen] = useState<Duzenlenen | null>(null)

  async function yukle() {
    const { data } = await supabase.from('alimler').select('*').order('ad')
    setAlimler((data as Alim[]) ?? [])
    cacheTemizle()
  }
  useEffect(() => {
    yukle()
  }, [])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">Âlimler</h1>
        <button className="btn-ana" onClick={() => setDuzen({ ad: '', unvan: '', biyografi: '', foto_url: '', aktif: true })}>
          <Plus className="h-4 w-4" /> Yeni âlim
        </button>
      </div>

      {alimler === null ? (
        <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-stone-400" />
      ) : alimler.length === 0 ? (
        <div className="kart p-8 text-center text-stone-500">Henüz âlim eklenmedi.</div>
      ) : (
        <div className="kart divide-y divide-sand">
          {alimler.map((a) => (
            <button key={a.id} onClick={() => setDuzen(a)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-parchment">
              {a.foto_url ? (
                <img src={a.foto_url} alt="" className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-900/10">
                  <UserRound className="h-5 w-5 text-emerald-900" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {a.unvan ? `${a.unvan} ` : ''}
                  {a.ad}
                </p>
                <p className="text-xs text-stone-500">
                  {a.user_id ? '✓ Panele giriş yetkisi var' : 'Giriş hesabı bağlı değil'}
                  {!a.aktif && ' · Pasif'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {duzen && (
        <AlimPenceresi
          alim={duzen}
          kapat={() => setDuzen(null)}
          bitti={() => {
            setDuzen(null)
            yukle()
          }}
        />
      )}
    </div>
  )
}

function AlimPenceresi({ alim, kapat, bitti }: { alim: Duzenlenen; kapat: () => void; bitti: () => void }) {
  const [f, setF] = useState<Duzenlenen>(alim)
  const [email, setEmail] = useState('')
  const [adminYap, setAdminYap] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [bekle, setBekle] = useState(false)

  async function kaydet() {
    if (!f.ad.trim()) return setMesaj('Ad zorunlu.')
    setBekle(true)
    const kayit = {
      ad: f.ad.trim(),
      unvan: f.unvan?.trim() || null,
      biyografi: f.biyografi?.trim() || null,
      foto_url: f.foto_url?.trim() || null,
      aktif: f.aktif ?? true,
    }
    const r = f.id
      ? await supabase.from('alimler').update(kayit).eq('id', f.id).select('id').single()
      : await supabase.from('alimler').insert(kayit).select('id').single()
    if (r.error || !r.data) {
      setBekle(false)
      return setMesaj('Kaydedilemedi: ' + r.error?.message)
    }
    if (email.trim()) {
      const { data, error } = await supabase.rpc('alim_yetkilendir', {
        _email: email.trim(),
        _alim_id: (r.data as { id: string }).id,
        _admin: adminYap,
      })
      if (error || data !== 'ok') {
        setBekle(false)
        return setMesaj((data as string) || error?.message || 'Yetki verilemedi')
      }
    }
    setBekle(false)
    bitti()
  }

  async function sil() {
    if (!f.id || !confirm('Âlim silinsin mi? Hadislerdeki isim boşalır.')) return
    await supabase.from('alimler').delete().eq('id', f.id)
    bitti()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={kapat}>
      <div className="kart max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-b-none p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-serif text-lg font-semibold">{f.id ? 'Âlimi düzenle' : 'Yeni âlim'}</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
          <div>
            <label className="etiket">Unvan</label>
            <input className="girdi" placeholder="Prof. Dr." value={f.unvan ?? ''} onChange={(e) => setF({ ...f, unvan: e.target.value })} />
          </div>
          <div>
            <label className="etiket">Ad Soyad *</label>
            <input className="girdi" value={f.ad} onChange={(e) => setF({ ...f, ad: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="etiket">Kısa biyografi</label>
          <textarea className="girdi min-h-[80px]" value={f.biyografi ?? ''} onChange={(e) => setF({ ...f, biyografi: e.target.value })} />
        </div>
        <div>
          <label className="etiket">Fotoğraf URL (isteğe bağlı)</label>
          <input className="girdi" value={f.foto_url ?? ''} onChange={(e) => setF({ ...f, foto_url: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-emerald-900" checked={f.aktif ?? true} onChange={(e) => setF({ ...f, aktif: e.target.checked })} />
          Aktif (Hakkında sayfasında görünür)
        </label>

        <div className="rounded-xl bg-parchment p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-gold" /> Panele giriş yetkisi {f.user_id && '(bağlı)'}
          </p>
          <p className="mb-2 text-xs text-stone-500">
            Önce Supabase &gt; Authentication &gt; Add user ile e-posta + şifre oluşturun, sonra e-postayı buraya yazın.
          </p>
          <input className="girdi" type="email" placeholder="alim@ornek.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-emerald-900" checked={adminYap} onChange={(e) => setAdminYap(e.target.checked)} />
            Yönetici de olsun (âlim/konu ekleyebilir, silebilir)
          </label>
        </div>

        {mesaj && <p className="text-sm text-red-600">{mesaj}</p>}
        <div className="flex justify-between gap-2">
          {f.id ? (
            <button className="btn-tehlike" onClick={sil}>
              <Trash2 className="h-4 w-4" />
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button className="btn-ikincil" onClick={kapat}>
              Vazgeç
            </button>
            <button className="btn-ana" onClick={kaydet} disabled={bekle}>
              {bekle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
